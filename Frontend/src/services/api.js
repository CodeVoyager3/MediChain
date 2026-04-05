/**
 * MediChain — Centralized API Client
 *
 * Every backend call goes through this module.
 * In development, Vite's proxy rewrites /api → localhost:8080.
 * In production, set VITE_API_URL to the real backend origin.
 */

const API_BASE = import.meta.env.VITE_API_URL || '';

// ─── Helpers ────────────────────────────────────────────

function getToken() {
    return localStorage.getItem('medichain_jwt');
}

function authHeaders() {
    const token = getToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
}

function safeJsonParse(value, fallback = {}) {
    try {
        const parsed = JSON.parse(value);
        return parsed ?? fallback;
    } catch {
        return fallback;
    }
}

function normalizeCid(value) {
    if (!value) return null;
    let v = String(value).trim();
    if (v.startsWith('ipfs://')) v = v.replace('ipfs://', '');
    if (v.includes('/')) v = v.split('/')[0];
    return v && v.length > 10 ? v : null;
}

function normalizeWallet(value) {
    return (value || '').toString().trim().toLowerCase();
}

function normalizeRecord(raw) {
    return {
        id: raw.id ?? null,
        recordId: raw.recordId ?? raw.record_id ?? raw.id ?? null,
        patientAddress: raw.patientAddress ?? raw.patient_address ?? '',
        doctorAddress: raw.doctorAddress ?? raw.doctor_address ?? '',
        ipfsCid: normalizeCid(raw.ipfsCid ?? raw.ipfs_cid ?? raw.cid ?? raw.record?.ipfsCid ?? raw.record?.ipfs_cid),
        recordType: raw.recordType ?? raw.record_type ?? 'Medical Record',
        superseded: raw.superseded ?? raw.isSuperseded ?? raw.is_superseded ?? false,
        previousRecordId: raw.previousRecordId ?? raw.previous_record_id ?? null,
        txHash: raw.txHash ?? raw.tx_hash ?? '',
        timestamp: raw.timestamp ?? raw.createdAt ?? raw.created_at ?? null,
    };
}

function normalizeAccessGrant(raw) {
    const recordId = raw.recordId ?? raw.record_id ?? null;
    const doctorAddress = raw.doctorAddress ?? raw.viewerAddress ?? raw.viewer_address ?? '';
    const patientAddress = raw.patientAddress ?? raw.patient_address ?? '';
    const expiresAt = raw.expiresAt ?? raw.expires_at ?? null;

    return {
        id: raw.id ?? `${doctorAddress}-${recordId ?? 'unknown'}`,
        doctorAddress,
        viewerAddress: raw.viewerAddress ?? raw.viewer_address ?? doctorAddress,
        patientAddress,
        recordId,
        expiresAt,
        recordIds: Array.isArray(raw.recordIds) ? raw.recordIds : (recordId != null ? [recordId] : []),
        durationLabel: raw.durationLabel ?? 'Active',
    };
}

function readCidMap() {
    const raw = localStorage.getItem('medichain_record_cid_map');
    const parsed = safeJsonParse(raw, {});
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return {};
    return parsed;
}

function writeCidMapFromRecords(records = []) {
    const existing = readCidMap();
    const map = { ...existing };

    for (const r of records) {
        const recordId = r?.recordId ?? r?.record_id ?? r?.id;
        const cid = normalizeCid(r?.ipfsCid ?? r?.ipfs_cid ?? r?.cid);
        if (recordId != null && cid) {
            map[String(recordId)] = cid;
        }
    }

    localStorage.setItem('medichain_record_cid_map', JSON.stringify(map));
}

async function request(method, path, body = null) {
    const headers = {
        'Content-Type': 'application/json',
        ...authHeaders(),
    };

    const opts = { method, headers };
    if (body) opts.body = JSON.stringify(body);

    const res = await fetch(`${API_BASE}${path}`, opts);

    let data;
    try {
        data = await res.json();
    } catch {
        data = {};
    }

    if (!res.ok) {
        const msg = data?.message || data?.error || `Request failed (${res.status})`;
        const err = new Error(msg);
        err.status = res.status;
        err.data = data;
        throw err;
    }

    return data;
}

// ─── Auth ───────────────────────────────────────────────

/** Step 1: ask backend for a unique message (nonce) to sign */
export function requestNonce(walletAddress) {
    return request('POST', '/api/v1/auth/nonce', { walletAddress });
}

/** Step 2: send the signed message back to get a JWT */
export function verifySignature(walletAddress, signature) {
    return request('POST', '/api/v1/auth/verify', { walletAddress, signature });
}

// ─── Users ──────────────────────────────────────────────

/** Complete first-time registration (name + role). Requires JWT. */
export function registerUser(name, role) {
    return request('POST', '/api/v1/users/register', { name, role });
}

/** Fetch any user's profile by wallet address. Requires JWT. */
export function getUserProfile(walletAddress) {
    return request('GET', `/api/v1/users/profile/${walletAddress}`);
}

// ─── Dashboard — Patient ────────────────────────────────

/** Fetch all records owned by the authenticated patient */
export async function getPatientVault() {
    const res = await request('GET', '/api/v1/dashboard/patient/vault');
    const rows = (res.data || []).map(normalizeRecord);

    // cache recordId -> CID map for doctor-side accessible records fallback
    writeCidMapFromRecords(rows);

    return { ...res, data: rows };
}

/** Patient checks in to a doctor's clinic waiting room */
export function checkInToClinic(doctorAddress) {
    return request('POST', '/api/v1/dashboard/patient/check-in', { doctorAddress });
}

/**
 * Fetch all active data grants the patient has issued.
 * Normalizes response into grouped shape expected by current patient dashboard UI.
 */
export async function getActiveGrants() {
    const res = await request('GET', '/api/v1/blockchain/active-grants');
    const raw = res.data || [];

    const rows = raw.map(normalizeAccessGrant);

    // Group row-wise grants by doctor
    const groupedMap = {};
    for (const g of rows) {
        const key = normalizeWallet(g.doctorAddress || g.viewerAddress);
        if (!groupedMap[key]) {
            groupedMap[key] = {
                id: key || g.id,
                doctorAddress: g.doctorAddress || g.viewerAddress || '',
                patientAddress: g.patientAddress || '',
                recordIds: [],
                durationLabel: 'Active',
            };
        }
        if (g.recordId != null) groupedMap[key].recordIds.push(g.recordId);
        if (g.expiresAt) groupedMap[key].expiresAt = g.expiresAt;
    }

    const grouped = Object.values(groupedMap);
    return { ...res, data: grouped };
}

// ─── Dashboard — Doctor ─────────────────────────────────

/** Fetch all patients currently in the doctor's waiting room */
export function getWaitingRoom() {
    return request('GET', '/api/v1/dashboard/doctor/waiting-room');
}

/**
 * Fetch records doctor can access for a specific patient.
 * Backend returns AccessGrant rows; we enrich with CID from cached map when available.
 */
export async function getAccessibleRecords(patientAddress) {
    const normalizedPatient = normalizeWallet(patientAddress);
    const res = await request('GET', `/api/v1/dashboard/doctor/accessible-records/${normalizedPatient}`);
    const grants = (res.data || []).map(normalizeAccessGrant);

    const cidMap = readCidMap();

    const enriched = grants.map(g => ({
        ...g,
        recordId: g.recordId,
        patientAddress: g.patientAddress || normalizedPatient,
        doctorAddress: g.doctorAddress || g.viewerAddress || '',
        ipfsCid: normalizeCid(g.ipfsCid ?? g.ipfs_cid ?? cidMap?.[String(g.recordId)] ?? null),
        recordType: g.recordType ?? 'Medical Record',
    }));

    return { ...res, data: enriched };
}

/** Mark an appointment as completed */
export function completeAppointment(checkInId) {
    return request('POST', '/api/v1/dashboard/doctor/complete-appointment', { checkInId });
}

// ─── Blockchain ─────────────────────────────────────────

/** Helper to upload a file to the backend (which then pins to IPFS) */
export async function uploadFile(file) {
    const formData = new FormData();
    formData.append('file', file);

    const res = await fetch(`${API_BASE}/api/v1/doctor/upload`, {
        method: 'POST',
        headers: { ...authHeaders() },
        body: formData
    });

    if (!res.ok) throw new Error('File upload failed');
    return res.json(); // expected: { cid, filename } or similar
}

/** Mint a new medical record NFT (doctor action) */
export function mintRecord(patientAddress, cid, recordType = 'Medical Record', supersedes = null) {
    return request('POST', '/api/v1/blockchain/mint', {
        patientAddress,
        cid,
        recordType,
        supersedes
    });
}

/** Amend (supersede) an existing record by minting a corrected version linked to the old one */
export function amendRecord(patientAddress, cid, previousRecordId) {
    return request('POST', '/api/v1/blockchain/mint', { patientAddress, cid, previousRecordId });
}

/** Patient grants temporary access to a doctor for specific records */
export function grantAccess(doctorAddress, recordIds, durationInSeconds) {
    return request('POST', '/api/v1/blockchain/grant-access', {
        doctorAddress,
        recordIds,
        durationInSeconds,
    });
}

/** Patient revokes access for a specific record from a doctor */
export function revokeAccess(doctorAddress, recordId) {
    return request('POST', '/api/v1/blockchain/revoke-access', { doctorAddress, recordId });
}

/** Check whether a doctor has access to a specific record */
export function checkAccess(patientAddress, doctorAddress, recordId) {
    return request('POST', '/api/v1/blockchain/check-access', {
        patientAddress,
        doctorAddress,
        recordId,
    });
}

/** Insurer requests to view a patient's record (with blockchain verification) */
export function viewRecordAsInsurer(insurerAddress, patientAddress, recordId) {
    return request('POST', '/api/v1/blockchain/insurer/view-record', {
        insurerAddress,
        patientAddress,
        recordId,
    });
}
