/**
 * MediChain — Centralized API Client
 */
const API_BASE = import.meta.env.VITE_API_URL || '';

function getToken() { return localStorage.getItem('medichain_jwt'); }
function authHeaders() { const token = getToken(); return token ? { Authorization: `Bearer ${token}` } : {}; }

function normalizeCid(value) {
    if (!value) return null;
    let v = String(value).trim();
    if (v.startsWith('ipfs://')) v = v.replace('ipfs://', '');
    if (v.includes('/')) v = v.split('/')[0];
    return v && v.length > 10 ? v : null;
}

function normalizeWallet(value) { return (value || '').toString().trim().toLowerCase(); }

function normalizeRecord(raw) {
    return {
        id: raw.id ?? null,
        recordId: raw.recordId ?? raw.record_id ?? raw.id ?? null,
        patientAddress: raw.patientAddress ?? raw.patient_address ?? '',
        doctorAddress: raw.doctorAddress ?? raw.doctor_address ?? '',
        ipfsCid: normalizeCid(raw.ipfs_cid ?? raw.ipfsCid ?? raw.cid ?? raw.record?.ipfsCid),
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
    return {
        id: raw.id ?? `${doctorAddress}-${recordId ?? 'unknown'}`,
        doctorAddress,
        viewerAddress: raw.viewerAddress ?? raw.viewer_address ?? doctorAddress,
        patientAddress: raw.patientAddress ?? raw.patient_address ?? '',
        recordId,
        expiresAt: raw.expiresAt ?? raw.expires_at ?? null,
        recordIds: Array.isArray(raw.recordIds) ? raw.recordIds : (recordId != null ? [recordId] : []),
        durationLabel: raw.durationLabel ?? 'Active',
    };
}

async function request(method, path, body = null) {
    const headers = { 'Content-Type': 'application/json', ...authHeaders() };
    const opts = { method, headers };
    if (body) opts.body = JSON.stringify(body);
    const res = await fetch(`${API_BASE}${path}`, opts);
    let data; try { data = await res.json(); } catch { data = {}; }

    if (!res.ok) {
        if (res.status === 401) {
            localStorage.removeItem('medichain_jwt');
            localStorage.removeItem('medichain_user');
            window.dispatchEvent(new CustomEvent('medichain:unauthorized'));
        }

        let msg = data?.message || data?.error || `Request failed (${res.status})`;

        // GLOBAL FIX: Strip out ugly Java stack traces from the UI
        msg = msg.replace(/java\.lang\.[A-Za-z0-9_]+Exception:\s*/g, '');

        // Make the access denied error sound more professional
        if (msg === "ACCESS_DENIED") {
            msg = "Access Denied: The patient has not granted you access, or the grant has expired.";
        }

        throw new Error(msg);
    }
    return data;
}

export async function requestNonce(walletAddress) {
    const res = await request('POST', '/api/v1/auth/nonce', { walletAddress });
    return { ...res, messageToSign: res.messageToSign ?? res.data?.messageToSign };
}
export async function verifySignature(walletAddress, signature) {
    const res = await request('POST', '/api/v1/auth/verify', { walletAddress, signature });
    return { ...res, token: res.token ?? res.data?.token };
}
export async function registerUser(name, role) {
    const res = await request('POST', '/api/v1/users/register', { name, role });
    return { ...res, user: res.user ?? res.data?.user };
}
export async function getUserProfile(walletAddress) {
    const res = await request('GET', `/api/v1/users/profile/${walletAddress}`);
    return { ...res, user: res.user ?? res.data?.user };
}

// --- Patient Methods ---
export async function getPatientVault() {
    const res = await request('GET', '/api/v1/dashboard/patient/vault');
    return { ...res, data: (res.data || []).map(normalizeRecord) };
}
export function checkInToClinic(doctorAddress) { return request('POST', '/api/v1/dashboard/patient/check-in', { doctorAddress }); }
export function getPatientEpisodes() { return request('GET', '/api/v1/dashboard/patient/episodes'); }

export async function getActiveGrants() {
    const res = await request('GET', '/api/v1/blockchain/active-grants');
    const rows = (res.data || []).map(normalizeAccessGrant);
    const groupedMap = {};
    for (const g of rows) {
        const key = normalizeWallet(g.doctorAddress || g.viewerAddress);
        if (!groupedMap[key]) {
            groupedMap[key] = { id: key || g.id, doctorAddress: g.doctorAddress || g.viewerAddress || '', patientAddress: g.patientAddress || '', recordIds: [], durationLabel: 'Active' };
        }
        if (g.recordId != null && !groupedMap[key].recordIds.includes(g.recordId)) groupedMap[key].recordIds.push(g.recordId);
        if (g.expiresAt) groupedMap[key].expiresAt = g.expiresAt;
    }
    return { ...res, data: Object.values(groupedMap) };
}

export function getPatientCheckInStatus() { return request('GET', '/api/v1/dashboard/patient/check-in-status'); }
export function leaveClinic() { return request('POST', '/api/v1/dashboard/patient/leave-room'); }

// --- Doctor Methods ---
export function getWaitingRoom() { return request('GET', '/api/v1/dashboard/doctor/waiting-room'); }
export function completeAppointment(checkInId) { return request('POST', '/api/v1/dashboard/doctor/complete-appointment', { checkInId }); }
export function createEpisode(patientAddress, title, description = '') {
    return request('POST', '/api/v1/dashboard/doctor/create-episode', { patientAddress, title, description });
}

export async function getAccessibleRecords(patientAddress) {
    const res = await request('GET', `/api/v1/dashboard/doctor/accessible-records/${normalizeWallet(patientAddress)}`);
    const enriched = (res.data || []).map(g => ({
        ...normalizeAccessGrant(g),
        recordId: g.recordId ?? g.record_id,
        ipfsCid: normalizeCid(g.ipfs_cid ?? g.ipfsCid ?? g.cid ?? g.record?.ipfs_cid),
        recordType: g.recordType ?? g.record_type ?? g.record?.recordType ?? 'Medical Record',
        isGranted: g.isGranted ?? false,
        isAuthored: g.isAuthored ?? false,
        superseded: g.superseded ?? false
    }));
    return { ...res, data: enriched };
}

// --- Blockchain Methods ---
export function mintRecord(patientAddress, cid, recordType = 'Medical Record', previousRecordId = null, episodeId = null) {
    return request('POST', '/api/v1/blockchain/mint', { patientAddress, cid, recordType, previousRecordId, episodeId });
}

export function amendRecord(patientAddress, cid, previousRecordId, recordType = 'Medical Record') {
    return request('POST', '/api/v1/blockchain/mint', { patientAddress, cid, previousRecordId, recordType });
}

export function grantAccess(doctorAddress, recordIds, durationInSeconds) {
    return request('POST', '/api/v1/blockchain/grant-access', { doctorAddress, recordIds, durationInSeconds });
}
export function revokeAccess(doctorAddress, recordId) {
    return request('POST', '/api/v1/blockchain/revoke-access', { doctorAddress, recordId });
}

// --- Insurer & Access Verification Methods ---
export function checkAccess(patientAddress, doctorAddress, recordId) {
    return request('POST', '/api/v1/blockchain/check-access', {
        patientAddress,
        doctorAddress,
        recordId,
    });
}

export function viewRecordAsInsurer(insurerAddress, patientAddress, recordId) {
    return request('POST', '/api/v1/blockchain/insurer/view-record', {
        insurerAddress,
        patientAddress,
        recordId,
    });
}

export function verifyEpisodeAsInsurer(insurerAddress, patientAddress, episodeId) {
    return request('POST', '/api/v1/blockchain/insurer/verify-episode', {
        insurerAddress,
        patientAddress,
        episodeId,
    });
}
