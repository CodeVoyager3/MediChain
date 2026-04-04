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

async function request(method, path, body = null) {
  const headers = {
    'Content-Type': 'application/json',
    ...authHeaders(),
  };

  const opts = { method, headers };
  if (body) opts.body = JSON.stringify(body);

  const res = await fetch(`${API_BASE}${path}`, opts);
  const data = await res.json();

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
export function getPatientVault() {
  return request('GET', '/api/v1/dashboard/patient/vault');
}

/** Patient checks in to a doctor's clinic waiting room */
export function checkInToClinic(doctorAddress) {
  return request('POST', '/api/v1/dashboard/patient/check-in', { doctorAddress });
}

// ─── Dashboard — Doctor ─────────────────────────────────

/** Fetch all patients currently in the doctor's waiting room */
export function getWaitingRoom() {
  return request('GET', '/api/v1/dashboard/doctor/waiting-room');
}

/** Fetch records the doctor has been granted access to for a specific patient */
export function getAccessibleRecords(patientAddress) {
  return request('GET', `/api/v1/dashboard/doctor/accessible-records/${patientAddress}`);
}

/** Mark an appointment as completed */
export function completeAppointment(checkInId) {
  return request('POST', '/api/v1/dashboard/doctor/complete-appointment', { checkInId });
}

// ─── Blockchain ─────────────────────────────────────────

/** Mint a new medical record NFT (doctor action) */
export function mintRecord(patientAddress, cid) {
  return request('POST', '/api/v1/blockchain/mint', { patientAddress, cid });
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
