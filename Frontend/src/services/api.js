/**
 * MediChain — Centralized API Client
 * Dashboard-focused, with graceful fallback between V2 and legacy endpoints.
 */
const API_BASE = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || '';

const TOKEN_KEY = 'medichain_jwt';
const STORAGE_PREFIX = 'medichain_';

function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

function normalizeWallet(value = '') {
  return String(value).trim().toLowerCase();
}

function parseJsonSafe(text) {
  if (!text) return {};
  try {
    return JSON.parse(text);
  } catch {
    return {};
  }
}

function normalizeErrorMessage(payload, status) {
  const msg = payload?.message || payload?.error || `Request failed (${status})`;
  return String(msg).replace(/java\.lang\.[A-Za-z0-9_]+Exception:\s*/g, '');
}

function handleUnauthorized() {
  for (let i = localStorage.length - 1; i >= 0; i -= 1) {
    const key = localStorage.key(i);
    if (key && key.startsWith(STORAGE_PREFIX)) {
      localStorage.removeItem(key);
    }
  }

  if (typeof window !== 'undefined' && window.location.pathname !== '/') {
    window.location.href = '/';
  }
}

async function requestJson(method, path, { body = null, headers = {} } = {}) {
  const token = getToken();
  const finalHeaders = {
    ...(body instanceof FormData ? {} : { 'Content-Type': 'application/json' }),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...headers,
  };

  const response = await fetch(`${API_BASE}${path}`, {
    method,
    headers: finalHeaders,
    body: body ? (body instanceof FormData ? body : JSON.stringify(body)) : undefined,
  });

  const text = await response.text();
  const data = parseJsonSafe(text);

  if (response.status === 401) {
    handleUnauthorized();
  }

  if (!response.ok) {
    const error = new Error(normalizeErrorMessage(data, response.status));
    error.status = response.status;
    throw error;
  }

  return data;
}

async function requestWithFallback(method, paths, options) {
  let lastError = null;

  for (const path of paths) {
    try {
      return await requestJson(method, path, options);
    } catch (error) {
      lastError = error;
      if (error?.status === 401) break;
    }
  }

  throw lastError || new Error('Request failed.');
}

function normalizeCid(value) {
  if (!value) return null;
  let cid = String(value).trim();
  cid = cid.replace(/^ipfs:\/\//i, '').replace(/^ipfs\//i, '').replace(/^\//, '');
  if (cid.includes('ipfs/')) cid = cid.split('ipfs/').pop();
  cid = cid.split('/')[0];
  return cid && cid.length > 10 ? cid : null;
}

function normalizeRecord(raw = {}) {
  return {
    id: raw.id ?? raw.recordId ?? raw.record_id ?? null,
    recordId: raw.recordId ?? raw.record_id ?? raw.id ?? null,
    episodeId: raw.episodeId ?? raw.episode_id ?? null,
    filename: raw.filename ?? raw.fileName ?? raw.recordName ?? 'Medical Record',
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

function normalizeEpisode(raw = {}) {
  const items = raw.records || raw.medicalRecords || raw.medical_records || [];
  return {
    id: raw.id ?? raw.episodeId ?? raw.episode_id ?? null,
    title: raw.title ?? raw.episodeTitle ?? raw.name ?? 'Episode of Care',
    createdAt: raw.createdAt ?? raw.created_at ?? null,
    doctorAddress: raw.doctorAddress ?? raw.doctor_address ?? raw.creatorAddress ?? raw.createdBy ?? '',
    records: Array.isArray(items) ? items.map(normalizeRecord) : [],
  };
}

function normalizeAccessGrant(raw = {}) {
  const recordId = raw.recordId ?? raw.record_id ?? null;
  const viewer = raw.doctorAddress ?? raw.viewerAddress ?? raw.viewer_address ?? '';
  return {
    id: raw.id ?? `${viewer}-${recordId ?? 'grant'}`,
    doctorAddress: raw.doctorAddress ?? '',
    viewerAddress: raw.viewerAddress ?? raw.viewer_address ?? viewer,
    patientAddress: raw.patientAddress ?? raw.patient_address ?? '',
    recordId,
    recordIds: Array.isArray(raw.recordIds) ? raw.recordIds : (recordId != null ? [recordId] : []),
    expiresAt: raw.expiresAt ?? raw.expires_at ?? null,
    isActive: raw.isActive ?? raw.is_active ?? true,
  };
}

// --- Auth ---
export async function requestNonce(walletAddress) {
  const wallet = normalizeWallet(walletAddress);
  const res = await requestWithFallback('POST', ['/api/v1/auth/nonce', '/api/auth/request-nonce'], { body: { walletAddress: wallet } });
  return { ...res, messageToSign: res.messageToSign ?? res.data?.messageToSign };
}

export async function verifySignature(walletAddress, signature) {
  const wallet = normalizeWallet(walletAddress);
  const res = await requestWithFallback('POST', ['/api/v1/auth/verify', '/api/auth/verify-signature'], {
    body: { walletAddress: wallet, signature },
  });
  return { ...res, token: res.token ?? res.data?.token };
}

export async function registerUser(name, role) {
  const res = await requestWithFallback('POST', ['/api/v1/users/register', '/api/auth/register'], { body: { name, role } });
  return { ...res, user: res.user ?? res.data?.user };
}

export async function getUserProfile(walletAddress) {
  const wallet = normalizeWallet(walletAddress);
  const res = await requestWithFallback('GET', [`/api/v1/users/profile/${wallet}`, '/api/auth/profile']);
  return { ...res, user: res.user ?? res.data?.user };
}

// --- Patient ---
export async function getPatientVault() {
  const res = await requestWithFallback('GET', ['/api/v1/dashboard/patient/vault']);
  const list = res.data || res.records || [];
  const grants = res.access_grants || res.accessGrants || [];
  return {
    ...res,
    data: Array.isArray(list) ? list.map(normalizeRecord) : [],
    accessGrants: Array.isArray(grants) ? grants.map(normalizeAccessGrant) : [],
  };
}

export async function getPatientEpisodes(patientAddress = '') {
  const normalized = normalizeWallet(patientAddress);
  const paths = ['/api/v1/dashboard/patient/episodes'];
  if (normalized) {
    paths.push(`/api/v1/dashboard/doctor/episodes/${normalized}`);
    paths.push(`/api/v1/episodes/patient/${normalized}`);
  }
  const res = await requestWithFallback('GET', paths);
  const source = res.data?.episodes || res.episodes || [];
  return {
    ...res,
    data: Array.isArray(source) ? source.map(normalizeEpisode) : [],
    ungroupedRecords: Array.isArray(res.data?.ungroupedRecords) ? res.data.ungroupedRecords : [],
  };
}

export function checkInToClinic(doctorAddress) {
  return requestWithFallback('POST', ['/api/v1/dashboard/patient/check-in'], {
    body: { doctorAddress: normalizeWallet(doctorAddress) },
  });
}

export function leaveClinic() {
  return requestWithFallback('POST', ['/api/v1/dashboard/patient/leave-clinic', '/api/v1/dashboard/patient/leave-room']);
}

export function getPatientCheckInStatus() {
  return requestWithFallback('GET', ['/api/v1/dashboard/patient/check-in-status']);
}

export async function getActiveGrants() {
  const res = await requestWithFallback('GET', ['/api/v1/dashboard/patient/active-grants', '/api/v1/blockchain/active-grants']);
  const source = res.data || res.grants || [];
  return {
    ...res,
    data: Array.isArray(source) ? source.map(normalizeAccessGrant) : [],
  };
}

export function grantAccess(doctorAddress, recordIds = [], durationInSeconds = 86400) {
  const payload = {
    doctorAddress: normalizeWallet(doctorAddress),
    recordIds,
    durationInSeconds,
  };
  return requestWithFallback('POST', ['/api/v1/dashboard/patient/grant-access', '/api/v1/blockchain/grant-access'], { body: payload });
}

export function revokeAccess(doctorAddress, recordId) {
  const payload = {
    doctorAddress: normalizeWallet(doctorAddress),
    recordId,
  };
  return requestWithFallback('POST', ['/api/v1/dashboard/patient/revoke-access', '/api/v1/blockchain/revoke-access'], { body: payload });
}

// --- Doctor ---
export function getWaitingRoom() {
  return requestWithFallback('GET', ['/api/v1/dashboard/doctor/waiting-room']);
}

export function completeAppointment(checkInId, patientAddress = '') {
  return requestWithFallback('POST', ['/api/v1/dashboard/doctor/complete-appointment'], {
    body: { checkInId, patientAddress: normalizeWallet(patientAddress) || undefined },
  });
}

export async function getAccessibleRecords(patientAddress) {
  const wallet = normalizeWallet(patientAddress);
  const res = await requestWithFallback('GET', [`/api/v1/dashboard/doctor/accessible-records/${wallet}`]);
  const source = res.data || res.records || [];
  return {
    ...res,
    data: Array.isArray(source)
      ? source.map((entry) => ({
          ...normalizeRecord(entry),
          ...normalizeAccessGrant(entry),
          isGranted: entry.isGranted ?? entry.is_granted ?? false,
          isAuthored: entry.isAuthored ?? entry.is_authored ?? false,
        }))
      : [],
  };
}

export function mintRecord(patientAddress, cid, recordType = 'Medical Record', previousRecordId = null, episodeId = null) {
  const payload = {
    patientAddress: normalizeWallet(patientAddress),
    cid,
    recordType,
    previousRecordId,
    episodeId,
  };
  return requestWithFallback('POST', ['/api/v1/dashboard/doctor/mint-record', '/api/v1/blockchain/mint'], { body: payload });
}

export function amendRecord(patientAddress, cid, previousRecordId, recordType = 'Medical Record', episodeId = null) {
  const payload = {
    patientAddress: normalizeWallet(patientAddress),
    cid,
    previousRecordId,
    recordType,
    episodeId,
  };
  return requestWithFallback('POST', ['/api/v1/dashboard/doctor/amend-record', '/api/v1/blockchain/mint'], { body: payload });
}

export function createEpisode(patientAddress, title) {
  return requestWithFallback('POST', ['/api/v1/episodes/create'], {
    body: { patientAddress: normalizeWallet(patientAddress), title },
  });
}

// --- Insurer ---
export async function verifyRecord(patientAddress, recordId, insurerAddress = '') {
  const patient = normalizeWallet(patientAddress);
  const insurer = normalizeWallet(insurerAddress);

  try {
    return await requestWithFallback('GET', [
      `/api/v1/dashboard/insurer/verify-record?patientAddress=${encodeURIComponent(patient)}&recordId=${encodeURIComponent(recordId)}`,
    ]);
  } catch {
    return requestWithFallback('POST', ['/api/v1/blockchain/insurer/view-record'], {
      body: { insurerAddress: insurer, patientAddress: patient, recordId },
    });
  }
}

export function verifyEpisode(patientAddress, episodeId) {
  const patient = normalizeWallet(patientAddress);
  return requestWithFallback('GET', [
    `/api/v1/dashboard/insurer/verify-episode?patientAddress=${encodeURIComponent(patient)}&episodeId=${encodeURIComponent(episodeId)}`,
  ]);
}

export function analyzeEpisode(episodeId) {
  return requestWithFallback('POST', ['/api/insurer/analyze-episode', '/api/v1/dashboard/insurer/analyze-episode'], {
    body: { episodeId },
  });
}

// --- Backward-compatible exports used in older parts of the app ---
export function checkAccess(patientAddress, doctorAddress, recordId) {
  return requestWithFallback('POST', ['/api/v1/blockchain/check-access'], {
    body: {
      patientAddress: normalizeWallet(patientAddress),
      doctorAddress: normalizeWallet(doctorAddress),
      recordId,
    },
  });
}

export function viewRecordAsInsurer(insurerAddress, patientAddress, recordId) {
  return requestWithFallback('POST', ['/api/v1/blockchain/insurer/view-record'], {
    body: {
      insurerAddress: normalizeWallet(insurerAddress),
      patientAddress: normalizeWallet(patientAddress),
      recordId,
    },
  });
}
