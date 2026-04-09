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
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
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
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import BentoStats from '@/components/dashboard/BentoStats';
import { ShimmerButton } from '@/components/animated/ShimmerButton';
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
];

const RECORD_TYPES = ['Diagnosis', 'Lab Report', 'Surgery Report', 'Prescription', 'Final Bill', 'Referral', 'Procedure', 'Other'];

function formatDate(value) {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
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
  const [episodeModalOpen, setEpisodeModalOpen] = useState(false);

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
      setEpisodeModalOpen(false);
      toast('Episode created successfully.', 'success');
      await loadPatientVault(selectedPatient);
    } catch (error) {
      toast(error.message || 'Could not create episode.', 'error');
    } finally {
      setCreatingEpisode(false);
    }
  };

  const sidebarActions = (
 <Button className="w-full bg-primary text-primary-foreground font-semibold hover:bg-primary/90" onClick={() => setClinicQrOpen(true)}>
      <QrCode className="mr-2 h-4 w-4" />
      My Clinic QR
    </Button>
  );

  /* ─── Overview ─── */
  const renderOverview = () => (
    <div className="space-y-6">
      <BentoStats
        items={[
          { label: 'Patients Waiting', value: waitingRoom.length, subtext: 'Live from waiting room' },
          { label: 'Selected Patient', value: selectedPatient ? 'Active' : 'None', subtext: selectedPatient ? 'Vault open' : 'No vault loaded' },
          { label: 'Accessible Records', value: accessibleRecords.length, subtext: 'Granted + authored' },
          { label: 'Active Episodes', value: doctorEpisodes.length, subtext: 'For selected patient' },
        ]}
      />

      <div className="grid gap-4 md:grid-cols-2">
        <section className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-card p-5 shadow-sm">
          <div className="mb-3 flex items-center gap-2">
            <Clock3 className="h-4 w-4 text-primary" />
            <h2 className="text-base font-bold text-foreground">Waiting Room Snapshot</h2>
            <span className="ml-auto inline-flex items-center gap-1 rounded-full bg-emerald-50 dark:bg-emerald-500/10 px-2 py-0.5 text-xs text-emerald-700 dark:text-emerald-400">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
              Live
            </span>
          </div>
          {waitingRoom.length === 0 ? (
            <p className="text-sm text-neutral-500 dark:text-neutral-400">No patients in waiting room.</p>
          ) : (
            <div className="space-y-2">
              {waitingRoom.slice(0, 3).map((entry) => (
                <div key={entry.id} className="flex items-center justify-between rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-white/5 px-3 py-2">
                  <div>
                    <p className="text-sm font-semibold text-foreground">
                      <WalletAddress address={entry.patientAddress || entry.patient_address} className="text-foreground" />
                    </p>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400">{waitTimeLabel(entry.checkedInAt || entry.createdAt)}</p>
                  </div>
 <Button size="sm" className="bg-primary text-primary-foreground font-semibold hover:bg-primary/90 text-xs" onClick={() => loadPatientVault(entry.patientAddress || entry.patient_address)}>
                    Open Vault
                  </Button>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-card p-5 shadow-sm">
          <div className="mb-3 flex items-center gap-2">
            <Stethoscope className="h-4 w-4 text-primary" />
            <h2 className="text-base font-bold text-foreground">Active Patient Context</h2>
          </div>
          {selectedPatient ? (
            <div className="space-y-3">
              <div className="rounded-lg border border-primary/20 bg-primary/5 dark:bg-primary/10 p-3">
                <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-1">Viewing vault for</p>
                <p className="text-sm font-mono font-bold text-foreground">
                  <WalletAddress address={selectedPatient} className="text-foreground" />
                </p>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="rounded-lg bg-muted/40 p-2">
                  <p className="text-xs text-neutral-500 dark:text-neutral-400">Records</p>
                  <p className="text-lg font-bold text-foreground">{accessibleRecords.length}</p>
                </div>
                <div className="rounded-lg bg-muted/40 p-2">
                  <p className="text-xs text-neutral-500 dark:text-neutral-400">Episodes</p>
                  <p className="text-lg font-bold text-foreground">{doctorEpisodes.length}</p>
                </div>
              </div>
              <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90" onClick={() => setActiveNav('patient-vault')}>
                Go to Patient Vault
              </Button>
            </div>
          ) : (
            <EmptyState icon={UserRoundSearch} title="No active patient" description="Open a vault from the Waiting Room or search manually." />
          )}
        </section>
      </div>
    </div>
  );

  /* ─── Waiting Room ─── */
  const renderWaitingRoom = () => (
    <div className="space-y-4 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-card p-5 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="flex items-center gap-2 text-base font-semibold text-foreground">
          Waiting Room
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 dark:bg-emerald-500/10 px-2 py-0.5 text-xs text-emerald-700 dark:text-emerald-400">
            <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" />
            Live
          </span>
        </h2>
        <Badge variant="outline" className="text-xs">{waitingRoom.length} waiting</Badge>
      </div>

      {waitingRoom.length === 0 ? (
        <EmptyState
          icon={Clock3}
          title="No patients waiting"
          description="Share your Clinic QR to let patients check in."
        />
      ) : (
        <div className="flex-1 overflow-auto rounded border border-border mt-2">
          <Table>
            <TableHeader>
              <TableRow className="border-border bg-neutral-950/5 dark:bg-neutral-950">
                <TableHead className="text-xs text-muted-foreground font-medium border-r border-border">Patient</TableHead>
                <TableHead className="text-xs text-muted-foreground font-medium border-r border-border min-w-[120px]">Wait Time</TableHead>
                <TableHead className="text-xs text-muted-foreground font-medium border-r border-border w-[100px]">Status</TableHead>
                <TableHead className="text-xs text-muted-foreground font-medium text-right w-[180px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="[&_tr:last-child]:border-0">
              {waitingRoom.map((entry) => (
                <TableRow key={entry.id} className="border-border hover:bg-muted/20 border-b transition-colors duration-200">
                  <TableCell className="border-r border-border py-2">
                    <div className="flex items-center gap-3">
                      <WalletAddress address={entry.patientAddress || entry.patient_address} className="text-foreground text-xs font-semibold" />
                    </div>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground border-r border-border py-2">
                    {waitTimeLabel(entry.checkedInAt || entry.createdAt)}
                  </TableCell>
                  <TableCell className="border-r border-border py-2">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium border transition-colors duration-200 bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/20">
                      Waiting
                    </span>
                  </TableCell>
                  <TableCell className="text-right py-2">
                    <div className="flex items-center justify-end gap-2">
 <Button size="sm" className="h-7 text-[10px] bg-primary text-primary-foreground font-semibold hover:bg-primary/90" onClick={() => loadPatientVault(entry.patientAddress || entry.patient_address)}>
                        Open Vault
                      </Button>
                      <Button size="sm" className="h-7 text-[10px] bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-500/20" onClick={() => handleCompleteAppointment(entry)}>
                        Complete
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );


  /* ─── Patient Vault ─── */
  const renderVaultSearch = () => (
    <div className="flex flex-wrap gap-2">
      <input
        className="w-full flex-1 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-white/5 px-4 py-2.5 text-sm text-foreground outline-none transition-all focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400"
        placeholder="0x... patient wallet address"
        value={patientQuery}
        onChange={(event) => setPatientQuery(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === 'Enter') loadPatientVault(patientQuery);
        }}
      />
      <Button type="button" variant="outline" className="border-neutral-200 dark:border-neutral-800 text-foreground" onClick={() => setScannerOpen(true)}>
        <ScanLine className="h-4 w-4" />
      </Button>
 <Button className="bg-primary text-primary-foreground font-semibold hover:bg-primary/90" onClick={() => loadPatientVault(patientQuery)}>
        Find
      </Button>
    </div>
  );

  const renderMintEngine = () => (
    <section className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-card p-5 shadow-sm">
      <div className="mb-4 flex items-center gap-2">
        <FileUp className="h-5 w-5 text-primary" />
        <h3 className="text-base font-bold text-foreground">Secure Minting Engine</h3>
        <Badge className="ml-auto bg-primary/10 dark:bg-primary/90/20 text-primary dark:text-primary border-none text-[10px]">
          Polygon Amoy
        </Badge>
      </div>
      <div className="space-y-3">
        <p className="text-sm text-neutral-500 dark:text-neutral-400">
          Minting for:{' '}
          {selectedPatient ? (
            <WalletAddress address={selectedPatient} className="text-foreground font-semibold" />
          ) : (
            <span className="text-foreground">No patient selected</span>
          )}
        </p>

        {!selectedPatient ? (
          <input
            className="w-full rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-white/5 px-4 py-2.5 text-sm text-foreground outline-none"
            placeholder="0x... patient wallet"
            value={mintPatient}
            onChange={(event) => setMintPatient(event.target.value)}
          />
        ) : null}

        <div className="rounded-xl border border-dashed border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-white/5 p-3">
          <p className="mb-2 text-xs text-neutral-500 dark:text-neutral-400">Upload PDF Document</p>
          <input
            type="file"
            accept=".pdf"
            onChange={(event) => setMintFile(event.target.files?.[0] || null)}
            className="w-full text-sm text-foreground file:mr-4 file:rounded-lg file:border-0 file:bg-indigo-50 dark:file:bg-primary/90/10 file:px-4 file:py-1.5 file:text-xs file:font-semibold file:text-primary dark:file:text-indigo-300"
          />
        </div>

        <select
          value={recordType}
          onChange={(event) => setRecordType(event.target.value)}
          className="w-full rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-white/5 px-4 py-2.5 text-sm text-foreground outline-none"
        >
          {RECORD_TYPES.map((type) => (
            <option key={type} value={type} className="bg-card text-foreground dark:bg-neutral-900">{type}</option>
          ))}
        </select>

        {doctorEpisodes.length > 0 ? (
          <select
            value={selectedEpisodeId}
            onChange={(event) => setSelectedEpisodeId(event.target.value)}
            className="w-full rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-white/5 px-4 py-2.5 text-sm text-foreground outline-none"
          >
            <option value="" className="bg-card text-foreground dark:bg-neutral-900">No Episode (Standalone Record)</option>
            {doctorEpisodes.map((episode) => (
              <option key={episode.id} value={episode.id} className="bg-card text-foreground dark:bg-neutral-900">
                #{episode.id} · {episode.title}
              </option>
            ))}
          </select>
        ) : null}

        <ShimmerButton
          className="w-full py-3 text-sm font-bold"
          disabled={minting}
          onClick={handleMint}
        >
          {minting ? (
            <span className="flex items-center justify-center gap-2">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              Minting to Polygon...
            </span>
          ) : (
            <span className="flex items-center justify-center gap-2">
              <FileUp className="h-4 w-4" />
              Sign & Mint to Polygon
            </span>
          )}
        </ShimmerButton>
      </div>
    </section>
  );

  const renderPatientVault = () => (
    <div className="space-y-4">
      <section className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-card p-5 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-semibold text-foreground">Patient Vault</h2>
          {selectedPatient && (
            <Button
              variant="outline"
              size="sm"
              className="border-violet-200 dark:border-violet-500/20 text-primary dark:text-primary text-xs"
              onClick={() => setEpisodeModalOpen(true)}
            >
              <PlusCircle className="mr-1.5 h-3.5 w-3.5" />
              New Episode
            </Button>
          )}
        </div>
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
            {/* Granted Records */}
            <div className="rounded-xl border border-emerald-200 dark:border-emerald-500/20 bg-emerald-50/50 dark:bg-emerald-500/5 p-4">
              <p className="mb-3 flex items-center gap-2 text-sm font-bold text-emerald-700 dark:text-emerald-400">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                Granted Access Records
              </p>
              {grantedRecords.length === 0 ? (
                <p className="text-sm text-emerald-700/70 dark:text-emerald-500">No active access grant for this patient.</p>
              ) : (
                <div className="space-y-2">
                  {grantedRecords.map((record) => (
                    <div key={record.recordId || record.id} className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-card p-3">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div>
                          <p className="text-sm font-semibold text-foreground">{record.filename || record.recordType}</p>
                          <p className="text-xs text-neutral-500 dark:text-neutral-400">{record.recordType} · {formatDate(record.timestamp)}</p>
                        </div>
 <Button className="bg-primary text-primary-foreground font-semibold hover:bg-primary/90" onClick={() => openIpfs(record.ipfsCid)}>
                          <Eye className="mr-2 h-4 w-4" />
                          View
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Authored Records */}
            <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-card p-4">
              <p className="mb-3 text-sm font-bold text-foreground">Past Authored Records (Amend Only)</p>
              {authoredRecords.length === 0 ? (
                <p className="text-sm text-neutral-500 dark:text-neutral-400">No authored records found.</p>
              ) : (
                <div className="space-y-2">
                  {authoredRecords.map((record) => (
                    <div key={record.recordId || record.id} className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-white/5 p-3">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div>
                          <p className="text-sm font-semibold text-foreground">#{record.recordId || record.id}</p>
                          <p className="text-xs text-neutral-500 dark:text-neutral-400">{record.recordType}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <StatusBadge status={record.superseded ? 'superseded' : 'latest'} />
                          {!record.superseded ? (
                            <Button
                              className="bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-500/20"
                              onClick={() => setAmendingId(record.recordId || record.id)}
                            >
                              <FilePenLine className="mr-2 h-4 w-4" />
                              Amend
                            </Button>
                          ) : null}
                        </div>
                      </div>

                      {amendingId === (record.recordId || record.id) ? (
                        <div className="mt-3 space-y-2 rounded-xl border border-amber-200 dark:border-amber-500/20 bg-amber-50/50 dark:bg-amber-500/5 p-3">
                          <input
                            type="file"
                            accept=".pdf"
                            onChange={(event) => setAmendFile(event.target.files?.[0] || null)}
                            className="w-full text-sm text-foreground"
                          />
                          <div className="flex gap-2">
                            <Button
                              className="bg-amber-600 text-white hover:bg-amber-500"
                              disabled={amendingId === (record.recordId || record.id) && !amendFile}
                              onClick={() => handleAmend(record)}
                            >
                              Confirm Amend
                            </Button>
                            <Button variant="outline" className="border-neutral-200 dark:border-neutral-800 text-foreground" onClick={() => setAmendingId(null)}>
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

  /* ─── Episodes ─── */
  const renderEpisodes = () => (
    <section className="space-y-4 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-card p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-foreground">My Episodes</h2>
          {selectedPatient ? (
            <p className="text-sm text-neutral-500 dark:text-neutral-400">
              Managing episodes for <WalletAddress address={selectedPatient} className="text-foreground" />
            </p>
          ) : (
            <p className="text-sm text-neutral-500 dark:text-neutral-400">Select a patient first from Patient Vault.</p>
          )}
        </div>
        {selectedPatient && (
          <Button
            className="bg-primary text-primary-foreground hover:bg-primary/90"
            onClick={() => setEpisodeModalOpen(true)}
          >
            <PlusCircle className="mr-2 h-4 w-4" />
            Create Episode
          </Button>
        )}
      </div>

      {doctorEpisodes.length === 0 ? (
        <EmptyState icon={Activity} title="No episodes yet" description="Create one to group records by care journey." />
      ) : (
        <div className="space-y-2">
          {doctorEpisodes.map((episode) => (
            <div key={episode.id} className="flex items-start justify-between rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-white/5 p-4 transition-all hover:border-violet-200 dark:hover:border-violet-500/30">
              <div className="border-l-4 border-violet-500 pl-3">
                <p className="text-sm font-semibold text-foreground">#{episode.id} · {episode.title}</p>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">{episode.records.length} records · {formatDate(episode.createdAt)}</p>
              </div>
              <Badge variant="outline" className="text-[10px] shrink-0">{episode.records.length} records</Badge>
            </div>
          ))}
        </div>
      )}
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
    content = renderOverview();
  }

  return (
    <>
      <DashboardLayout
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
      </DashboardLayout>

      {/* Create Episode Modal */}
      <Dialog open={episodeModalOpen} onOpenChange={setEpisodeModalOpen}>
        <DialogContent className="border-neutral-200 dark:border-neutral-800 sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary" />
              Create New Episode of Care
            </DialogTitle>
            <DialogDescription>
              Group medical records into a structured care journey for:{' '}
              <span className="font-mono font-semibold text-foreground">
                {selectedPatient ? `${selectedPatient.slice(0, 8)}...${selectedPatient.slice(-6)}` : 'No patient selected'}
              </span>
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                Episode Title
              </label>
              <Input
                placeholder="e.g., Knee Surgery April 2026"
                value={episodeTitle}
                onChange={(e) => setEpisodeTitle(e.target.value)}
                className="border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-white/5"
                onKeyDown={(e) => e.key === 'Enter' && handleCreateEpisode()}
              />
            </div>
            <div className="flex gap-3 pt-2">
              <Button
                variant="outline"
                className="flex-1 border-neutral-200 dark:border-neutral-800"
                onClick={() => setEpisodeModalOpen(false)}
              >
                Cancel
              </Button>
              <ShimmerButton
                className="flex-1 py-2 text-sm font-bold"
                disabled={creatingEpisode || !episodeTitle.trim() || !selectedPatient}
                onClick={handleCreateEpisode}
              >
                {creatingEpisode ? 'Creating...' : 'Create Episode'}
              </ShimmerButton>
            </div>
          </div>
        </DialogContent>
      </Dialog>

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
