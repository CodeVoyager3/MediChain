import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useActiveAccount, useActiveWallet, useDisconnect } from 'thirdweb/react';
import { createThirdwebClient } from 'thirdweb';
import { upload } from 'thirdweb/storage';
import {
  Activity,
  Clock3,
  FileUp,
  FolderSearch2,
  LayoutDashboard,
  PlusCircle,
  QrCode,
  ScanLine,
  Settings,
  Stethoscope,
  UserRoundSearch,
  Users,
  Eye,
  FilePenLine,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import {
  amendRecord,
  completeAppointment,
  createEpisode,
  getAccessibleRecords,
  getPatientEpisodes,
  getWaitingRoom,
  mintRecord,
} from '@/services/api';
import AppLayout from '@/components/common/AppLayout';
import EmptyState from '@/components/common/EmptyState';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import QRDisplay from '@/components/common/QRDisplay';
import QRScanner from '@/components/common/QRScanner';
import StatusBadge from '@/components/common/StatusBadge';
import WalletAddress from '@/components/common/WalletAddress';
import { useToast } from '@/components/common/ToastNotification';

const client = createThirdwebClient({ clientId: import.meta.env.VITE_CLIENT_ID || '' });

const NAV_ITEMS = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'waiting-room', label: 'Waiting Room', icon: Clock3 },
  { id: 'patient-vault', label: 'Patient Vault', icon: FolderSearch2 },
  { id: 'my-episodes', label: 'My Episodes', icon: Activity },
  { id: 'settings', label: 'Settings', icon: Settings },
];

const RECORD_TYPES = ['Diagnosis', 'Lab Report', 'Surgery Report', 'Prescription', 'Final Bill', 'Referral', 'Procedure', 'Other'];

function formatDate(value) {
  if (!value) return 'â€”';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'â€”';
  return date.toLocaleString();
}

function waitTimeLabel(value) {
  if (!value) return 'Waiting now';
  const diff = Date.now() - new Date(value).getTime();
  if (Number.isNaN(diff) || diff < 0) return 'Waiting now';
  const mins = Math.max(1, Math.floor(diff / (1000 * 60)));
  return `Waiting ${mins} min`;
}

function openIpfs(cid) {
  if (!cid) return;
  let cleanCid = String(cid).trim();
  if (cleanCid.startsWith('ipfs://')) cleanCid = cleanCid.replace('ipfs://', '');
  if (cleanCid.startsWith('ipfs/')) cleanCid = cleanCid.replace('ipfs/', '');
  window.open(`https://ipfs.io/ipfs/${cleanCid}`, '_blank', 'noopener,noreferrer');
}

export default function DoctorDashboard() {
  const account = useActiveAccount();
  const wallet = useActiveWallet();
  const { disconnect } = useDisconnect();
  const { user, logout } = useAuth();
  const { toast } = useToast();

  const [activeNav, setActiveNav] = useState('waiting-room');
  const [loading, setLoading] = useState(true);
  const [waitingRoom, setWaitingRoom] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState('');
  const [patientQuery, setPatientQuery] = useState('');
  const [accessibleRecords, setAccessibleRecords] = useState([]);
  const [doctorEpisodes, setDoctorEpisodes] = useState([]);
  const [loadingVault, setLoadingVault] = useState(false);
  const [recordType, setRecordType] = useState(RECORD_TYPES[0]);
  const [selectedEpisodeId, setSelectedEpisodeId] = useState('');
  const [mintFile, setMintFile] = useState(null);
  const [mintPatient, setMintPatient] = useState('');
  const [minting, setMinting] = useState(false);
  const [amendFile, setAmendFile] = useState(null);
  const [amendingId, setAmendingId] = useState(null);
  const [episodeTitle, setEpisodeTitle] = useState('');
  const [creatingEpisode, setCreatingEpisode] = useState(false);
  const [clinicQrOpen, setClinicQrOpen] = useState(false);
  const [scannerOpen, setScannerOpen] = useState(false);

  const walletAddress = account?.address || user?.walletAddress || '';

  const refreshWaitingRoom = useCallback(async () => {
    try {
      const res = await getWaitingRoom();
      setWaitingRoom(res.data || []);
    } catch {
      setWaitingRoom([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadPatientVault = useCallback(async (patientAddress) => {
    console.log('[Vault] Attempting to load vault for:', patientAddress);
    const normalized = String(patientAddress || '').trim().toLowerCase();
    if (!normalized) return;

    setLoadingVault(true);
    setSelectedPatient(normalized);
    setMintPatient(normalized);
    try {
      const [recordsRes, episodesRes] = await Promise.allSettled([
        getAccessibleRecords(normalized),
        getPatientEpisodes(normalized),
      ]);

      if (recordsRes.status === 'fulfilled') {
        setAccessibleRecords(recordsRes.value.data || []);
      } else {
        setAccessibleRecords([]);
      }

      if (episodesRes.status === 'fulfilled') {
        setDoctorEpisodes(episodesRes.value.data || []);
      } else {
        setDoctorEpisodes([]);
      }
      setActiveNav('patient-vault');
    } catch (error) {
      toast(error.message || 'Could not open patient vault.', 'error');
    } finally {
      setLoadingVault(false);
    }
  }, [toast]);

  useEffect(() => {
    refreshWaitingRoom();
  }, [refreshWaitingRoom]);

  useEffect(() => {
    const interval = window.setInterval(refreshWaitingRoom, 15000);
    return () => window.clearInterval(interval);
  }, [refreshWaitingRoom]);

  const handleLogout = () => {
    if (wallet) disconnect(wallet);
    logout();
    window.setTimeout(() => {
      window.location.href = '/';
    }, 200);
  };

  const grantedRecords = useMemo(
    () => accessibleRecords.filter((item) => item.isGranted || !item.isAuthored),
    [accessibleRecords]
  );
  const authoredRecords = useMemo(
    () => accessibleRecords.filter((item) => item.isAuthored),
    [accessibleRecords]
  );

  const handleCompleteAppointment = async (entry) => {
    try {
      await completeAppointment(entry.id, entry.patientAddress);
      toast('Appointment marked as complete.', 'success');
      await refreshWaitingRoom();
      if (selectedPatient && selectedPatient === String(entry.patientAddress || '').toLowerCase()) {
        setSelectedPatient('');
        setAccessibleRecords([]);
      }
    } catch (error) {
      toast(error.message || 'Could not complete appointment.', 'error');
    }
  };

  const handleMint = async () => {
    const target = (selectedPatient || mintPatient || '').toLowerCase();
    if (!target || !mintFile) {
      toast('Select patient and PDF before minting.', 'warning');
      return;
    }

    setMinting(true);
    try {
      const uri = await upload({ client, files: [mintFile] });
      await mintRecord(target, uri, recordType, null, selectedEpisodeId || null);
      setMintFile(null);
      setSelectedEpisodeId('');
      toast('Record minted successfully.', 'success');
      await loadPatientVault(target);
    } catch (error) {
      toast(error.message || 'Minting failed.', 'error');
    } finally {
      setMinting(false);
    }
  };

  const handleAmend = async (record) => {
    if (!amendFile) {
      toast('Select a replacement PDF first.', 'warning');
      return;
    }

    setAmendingId(record.recordId || record.id);
    try {
      const uri = await upload({ client, files: [amendFile] });
      await amendRecord(
        record.patientAddress || selectedPatient,
        uri,
        record.recordId || record.id,
        record.recordType || recordType,
        selectedEpisodeId || null
      );
      setAmendFile(null);
      toast('Record amended successfully.', 'success');
      await loadPatientVault(record.patientAddress || selectedPatient);
    } catch (error) {
      toast(error.message || 'Amendment failed.', 'error');
    } finally {
      setAmendingId(null);
    }
  };

  const handleCreateEpisode = async () => {
    if (!selectedPatient || !episodeTitle.trim()) {
      toast('Select patient and enter episode title.', 'warning');
      return;
    }

    setCreatingEpisode(true);
    try {
      await createEpisode(selectedPatient, episodeTitle.trim());
      setEpisodeTitle('');
      toast('Episode created successfully.', 'success');
      await loadPatientVault(selectedPatient);
    } catch (error) {
      toast(error.message || 'Could not create episode.', 'error');
    } finally {
      setCreatingEpisode(false);
    }
  };

  const sidebarActions = (
    <Button className="w-full bg-indigo-600 text-white hover:bg-indigo-500" onClick={() => setClinicQrOpen(true)}>
      <QrCode className="mr-2 h-4 w-4" />
      My Clinic QR
    </Button>
  );

  const renderOverview = () => (
    <div className="grid gap-4 md:grid-cols-3">
      <div className="rounded-xl border border-neutral-200 dark:border-white/10 bg-card p-4">
        <p className="text-sm text-neutral-500 dark:text-neutral-400">Waiting Room</p>
        <p className="mt-2 text-3xl font-bold text-foreground">{waitingRoom.length}</p>
      </div>
      <div className="rounded-xl border border-neutral-200 dark:border-white/10 bg-card p-4">
        <p className="text-sm text-neutral-500 dark:text-neutral-400">Selected Patient</p>
        <p className="mt-2 text-sm font-semibold text-foreground">{selectedPatient ? <WalletAddress address={selectedPatient} className="text-foreground" /> : 'None'}</p>
      </div>
      <div className="rounded-xl border border-neutral-200 dark:border-white/10 bg-card p-4">
        <p className="text-sm text-neutral-500 dark:text-neutral-400">Accessible Records</p>
        <p className="mt-2 text-3xl font-bold text-foreground">{accessibleRecords.length}</p>
      </div>
    </div>
  );

  const renderWaitingRoom = () => (
    <div className="space-y-4 rounded-xl border border-neutral-200 dark:border-white/10 bg-card p-4">
      <div className="flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-base font-semibold text-foreground">
          Waiting Room
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 dark:bg-emerald-500/10 px-2 py-0.5 text-xs text-emerald-700 dark:text-emerald-400">
            <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" />
            Live
          </span>
        </h2>
      </div>

      {waitingRoom.length === 0 ? (
        <EmptyState
          icon={Clock3}
          title="No patients waiting"
          description="Share your Clinic QR to let patients check in."
        />
      ) : (
        <div className="space-y-2">
          {waitingRoom.map((entry) => (
            <div key={entry.id} className="rounded-md border border-neutral-200 dark:border-white/10 bg-neutral-50 dark:bg-white/5 p-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    <WalletAddress address={entry.patientAddress || entry.patient_address} className="text-foreground" />
                  </p>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400">{waitTimeLabel(entry.checkedInAt || entry.createdAt)}</p>
                </div>
                <div className="flex gap-2">
                  <Button className="bg-indigo-600 text-white hover:bg-indigo-500" onClick={() => loadPatientVault(entry.patientAddress || entry.patient_address)}>
                    Open Vault
                  </Button>
                  <Button className="bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-500/20" onClick={() => handleCompleteAppointment(entry)}>
                    Complete
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderVaultSearch = () => (
    <div className="flex flex-wrap gap-2">
      <input
        className="w-full flex-1 rounded-md border border-neutral-200 dark:border-white/10 bg-neutral-50 dark:bg-white/5 px-3 py-2 text-sm text-foreground outline-none"
        placeholder="0x... patient wallet address"
        value={patientQuery}
        onChange={(event) => setPatientQuery(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === 'Enter') {
            loadPatientVault(patientQuery);
          }
        }}
      />
      <Button type="button" variant="outline" className="border-neutral-200 dark:border-white/10 text-foreground" onClick={() => setScannerOpen(true)}>
        <ScanLine className="h-4 w-4" />
      </Button>
      <Button className="bg-indigo-600 text-white hover:bg-indigo-500" onClick={() => loadPatientVault(patientQuery)}>
        Find
      </Button>
    </div>
  );

  const renderMintEngine = () => (
    <section className="rounded-xl border border-neutral-200 dark:border-white/10 bg-card p-4">
      <h3 className="mb-3 text-base font-semibold text-foreground">Secure Minting Engine</h3>
      <div className="space-y-3">
        <p className="text-sm text-neutral-500 dark:text-neutral-400">
          Minting for:{' '}
          {selectedPatient ? (
            <WalletAddress address={selectedPatient} className="text-foreground" />
          ) : (
            <span className="text-foreground">No patient selected</span>
          )}
        </p>

        {!selectedPatient ? (
          <input
            className="w-full rounded-md border border-neutral-200 dark:border-white/10 bg-neutral-50 dark:bg-white/5 px-3 py-2 text-sm text-foreground outline-none"
            placeholder="0x... patient wallet"
            value={mintPatient}
            onChange={(event) => setMintPatient(event.target.value)}
          />
        ) : null}

        <input
          type="file"
          accept=".pdf"
          onChange={(event) => setMintFile(event.target.files?.[0] || null)}
          className="w-full rounded-md border border-neutral-200 dark:border-white/10 bg-neutral-50 dark:bg-white/5 px-3 py-2 text-sm text-foreground"
        />

        <select
          value={recordType}
          onChange={(event) => setRecordType(event.target.value)}
          className="w-full rounded-md border border-neutral-200 dark:border-white/10 bg-neutral-50 dark:bg-white/5 px-3 py-2 text-sm text-foreground"
        >
          {RECORD_TYPES.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>

        {doctorEpisodes.length > 0 ? (
          <select
            value={selectedEpisodeId}
            onChange={(event) => setSelectedEpisodeId(event.target.value)}
            className="w-full rounded-md border border-neutral-200 dark:border-white/10 bg-neutral-50 dark:bg-white/5 px-3 py-2 text-sm text-foreground"
          >
            <option value="">No Episode</option>
            {doctorEpisodes.map((episode) => (
              <option key={episode.id} value={episode.id}>
                {episode.title}
              </option>
            ))}
          </select>
        ) : null}

        <Button className="w-full bg-indigo-600 text-white hover:bg-indigo-500" disabled={minting} onClick={handleMint}>
          <FileUp className="mr-2 h-4 w-4" />
          {minting ? 'Minting to blockchain...' : 'Mint Record'}
        </Button>
      </div>
    </section>
  );

  const renderPatientVault = () => (
    <div className="space-y-4">
      <section className="rounded-xl border border-neutral-200 bg-card p-4">
        <h2 className="mb-3 text-base font-semibold text-foreground">Patient Vault</h2>
        {renderVaultSearch()}

        {!selectedPatient ? (
          <div className="mt-4">
            <EmptyState
              icon={UserRoundSearch}
              title="No patient selected"
              description="Search by wallet or scan a patient QR to open their vault."
            />
          </div>
        ) : loadingVault ? (
          <LoadingSpinner message="Loading patient vault..." />
        ) : (
          <div className="mt-4 space-y-4">
            <div className="rounded-md border border-emerald-200 bg-emerald-50 p-3">
              <p className="text-sm font-semibold text-emerald-700">Granted Access</p>
              {grantedRecords.length === 0 ? (
                <p className="mt-1 text-sm text-emerald-700">No active access grant for this patient.</p>
              ) : (
                <div className="mt-2 space-y-2">
                  {grantedRecords.map((record) => (
                    <div key={record.recordId || record.id} className="rounded-md border border-neutral-200 bg-neutral-50 p-3">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div>
                          <p className="text-sm font-semibold text-foreground">{record.filename || record.recordType}</p>
                          <p className="text-xs text-neutral-500">{record.recordType} Â· {formatDate(record.timestamp)}</p>
                        </div>
                        <Button className="bg-indigo-600 text-white hover:bg-indigo-500" onClick={() => openIpfs(record.ipfsCid)}>
                          <Eye className="mr-2 h-4 w-4" />
                          View
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="rounded-md border border-neutral-200 bg-neutral-50 p-3">
              <p className="text-sm font-semibold text-foreground">Past Authored Records (Amend Only)</p>
              {authoredRecords.length === 0 ? (
                <p className="mt-1 text-sm text-neutral-500">No authored records found.</p>
              ) : (
                <div className="mt-2 space-y-2">
                  {authoredRecords.map((record) => (
                    <div key={record.recordId || record.id} className="rounded-md border border-neutral-200 bg-card p-3">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div>
                          <p className="text-sm font-semibold text-foreground">#{record.recordId || record.id}</p>
                          <p className="text-xs text-neutral-500">{record.recordType}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <StatusBadge status={record.superseded ? 'superseded' : 'latest'} />
                          {!record.superseded ? (
                            <Button
                              className="bg-amber-50 text-amber-700 hover:bg-amber-100"
                              onClick={() => setAmendingId(record.recordId || record.id)}
                            >
                              <FilePenLine className="mr-2 h-4 w-4" />
                              Amend
                            </Button>
                          ) : null}
                        </div>
                      </div>

                      {amendingId === (record.recordId || record.id) ? (
                        <div className="mt-3 space-y-2 rounded-md border border-neutral-200 bg-neutral-50 p-3">
                          <input
                            type="file"
                            accept=".pdf"
                            onChange={(event) => setAmendFile(event.target.files?.[0] || null)}
                            className="w-full rounded-md border border-neutral-200 bg-card px-3 py-2 text-sm text-foreground"
                          />
                          <div className="flex gap-2">
                            <Button
                              className="bg-amber-600 text-white hover:bg-amber-500"
                              disabled={amendingId === (record.recordId || record.id) && !amendFile}
                              onClick={() => handleAmend(record)}
                            >
                              Confirm Amend
                            </Button>
                            <Button variant="outline" className="border-neutral-200 text-foreground" onClick={() => setAmendingId(null)}>
                              Cancel
                            </Button>
                          </div>
                        </div>
                      ) : null}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </section>

      {renderMintEngine()}
    </div>
  );

  const renderEpisodes = () => (
    <section className="space-y-4 rounded-xl border border-neutral-200 dark:border-white/10 bg-card p-4">
      <h2 className="text-base font-semibold text-foreground">My Episodes</h2>
      {selectedPatient ? (
        <p className="text-sm text-neutral-500 dark:text-neutral-400">
          Managing episodes for <WalletAddress address={selectedPatient} className="text-foreground" />
        </p>
      ) : (
        <p className="text-sm text-neutral-500 dark:text-neutral-400">Select a patient first from Patient Vault.</p>
      )}

      {doctorEpisodes.length === 0 ? (
        <EmptyState icon={Activity} title="No episodes yet" description="Create one below to group records by care journey." />
      ) : (
        <div className="space-y-2">
          {doctorEpisodes.map((episode) => (
            <div key={episode.id} className="rounded-md border border-neutral-200 dark:border-white/10 bg-neutral-50 dark:bg-white/5 p-3">
              <p className="text-sm font-semibold text-foreground">{episode.title}</p>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">{episode.records.length} records · {formatDate(episode.createdAt)}</p>
            </div>
          ))}
        </div>
      )}

      <div className="rounded-md border border-neutral-200 dark:border-white/10 bg-neutral-50 dark:bg-white/5 p-3">
        <p className="mb-2 text-sm font-semibold text-foreground">Create New Episode</p>
        <div className="flex gap-2">
          <input
            className="w-full rounded-md border border-neutral-200 dark:border-white/10 bg-card px-3 py-2 text-sm text-foreground outline-none"
            placeholder="e.g., Knee Surgery April 2026"
            value={episodeTitle}
            onChange={(event) => setEpisodeTitle(event.target.value)}
          />
          <Button className="bg-indigo-600 text-white hover:bg-indigo-500" disabled={creatingEpisode} onClick={handleCreateEpisode}>
            <PlusCircle className="mr-2 h-4 w-4" />
            {creatingEpisode ? 'Creating...' : 'Create'}
          </Button>
        </div>
      </div>
    </section>
  );

  const renderSettings = () => (
    <section className="rounded-xl border border-neutral-200 dark:border-white/10 bg-card p-4">
      <h2 className="mb-2 text-base font-semibold text-foreground">Settings</h2>
      <p className="text-sm text-neutral-500 dark:text-neutral-400">Doctor dashboard settings will appear here.</p>
    </section>
  );

  let content = null;
  if (loading) {
    content = <LoadingSpinner message="Loading doctor dashboard..." />;
  } else if (activeNav === 'overview') {
    content = renderOverview();
  } else if (activeNav === 'waiting-room') {
    content = renderWaitingRoom();
  } else if (activeNav === 'patient-vault') {
    content = renderPatientVault();
  } else if (activeNav === 'my-episodes') {
    content = renderEpisodes();
  } else {
    content = renderSettings();
  }

  return (
    <>
      <AppLayout
        title="Doctor Dashboard"
        role="DOCTOR"
        navItems={NAV_ITEMS}
        activeNav={activeNav}
        onNavChange={setActiveNav}
        onLogout={handleLogout}
        walletAddress={walletAddress}
        walletConnected={Boolean(walletAddress)}
        sidebarActions={sidebarActions}
      >
        {content}
      </AppLayout>

      <QRDisplay
        open={clinicQrOpen}
        payload={{ type: 'CLINIC_CHECKIN', doctorAddress: walletAddress, clinicName: user?.name || 'MediChain Clinic' }}
        title="My Clinic QR"
        subtitle="Print this QR and place it at your reception desk."
        onClose={() => setClinicQrOpen(false)}
      />

      <QRScanner
        open={scannerOpen}
        expectedType="PATIENT_ID"
        onClose={() => setScannerOpen(false)}
        onScanSuccess={(payload) => {
          setPatientQuery(payload.patientAddress || '');
          if (payload.patientAddress) {
            loadPatientVault(payload.patientAddress);
          }
        }}
      />
    </>
  );
}

