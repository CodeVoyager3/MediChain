import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useActiveAccount, useActiveWallet, useDisconnect } from 'thirdweb/react';
import {
  CalendarClock,
  FileText,
  FolderKanban,
  LayoutDashboard,
  QrCode,
  ScanLine,
  Settings,
  ShieldCheck,
  UserRoundCheck,
  Eye,
  PlusCircle,
  Link2,
  FolderOpen,
  Activity,
} from 'lucide-react';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Tooltip, Legend } from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import {
  checkInToClinic,
  getActiveGrants,
  getPatientCheckInStatus,
  getPatientEpisodes,
  getPatientVault,
  grantAccess,
  leaveClinic,
  revokeAccess,
} from '@/services/api';
import AppLayout from '@/components/common/AppLayout';
import EmptyState from '@/components/common/EmptyState';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import QRDisplay from '@/components/common/QRDisplay';
import QRScanner from '@/components/common/QRScanner';
import StatusBadge from '@/components/common/StatusBadge';
import WalletAddress from '@/components/common/WalletAddress';
import { useToast } from '@/components/common/ToastNotification';

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

const NAV_ITEMS = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'records', label: 'My Records', icon: FileText },
  { id: 'episodes', label: 'Episodes', icon: FolderKanban },
  { id: 'access', label: 'Access Control', icon: ShieldCheck },
  { id: 'appointments', label: 'Appointments', icon: CalendarClock },
  { id: 'settings', label: 'Settings', icon: Settings },
];

const DURATION_OPTIONS = [
  { label: '24 Hours', value: 24 * 60 * 60 },
  { label: '7 Days', value: 7 * 24 * 60 * 60 },
  { label: '30 Days', value: 30 * 24 * 60 * 60 },
];

function monthBuckets(records) {
  const buckets = new Array(12).fill(0);
  records.forEach((record) => {
    const ts = record.timestamp ? new Date(record.timestamp).getTime() : Number.NaN;
    if (!Number.isNaN(ts)) {
      buckets[new Date(ts).getMonth()] += 1;
    }
  });
  return buckets;
}

function openIpfs(cid) {
  if (!cid) return;
  window.open(`https://gateway.pinata.cloud/ipfs/${cid}`, '_blank', 'noopener,noreferrer');
}

function formatDate(value) {
  if (!value) return 'â€”';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'â€”';
  return date.toLocaleString();
}

function remainingText(expiresAt) {
  if (!expiresAt) return 'No expiry';
  const delta = new Date(expiresAt).getTime() - Date.now();
  if (delta <= 0) return 'Expired';
  const hrs = Math.floor(delta / (1000 * 60 * 60));
  const mins = Math.floor((delta % (1000 * 60 * 60)) / (1000 * 60));
  return `Expires in ${hrs}h ${mins}m`;
}

export default function PatientDashboard() {
  const account = useActiveAccount();
  const wallet = useActiveWallet();
  const { disconnect } = useDisconnect();
  const { user, logout } = useAuth();
  const { toast } = useToast();

  const [activeNav, setActiveNav] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [records, setRecords] = useState([]);
  const [episodes, setEpisodes] = useState([]);
  const [grants, setGrants] = useState([]);
  const [activeCheckIn, setActiveCheckIn] = useState(null);
  const [doctorInput, setDoctorInput] = useState('');
  const [isCheckingIn, setIsCheckingIn] = useState(false);
  const [recordSort, setRecordSort] = useState('newest');
  const [grantDoctorInput, setGrantDoctorInput] = useState('');
  const [selectedRecordIds, setSelectedRecordIds] = useState([]);
  const [selectedDuration, setSelectedDuration] = useState(DURATION_OPTIONS[0].value);
  const [granting, setGranting] = useState(false);
  const [claimQrEpisode, setClaimQrEpisode] = useState(null);
  const [showPatientQr, setShowPatientQr] = useState(false);
  const [scanMode, setScanMode] = useState(null);

  const walletAddress = account?.address || user?.walletAddress || '';
  const walletConnected = Boolean(walletAddress);

  const refreshData = useCallback(async () => {
    setLoading(true);
    try {
      const [vaultRes, episodesRes, grantsRes, checkinRes] = await Promise.allSettled([
        getPatientVault(),
        getPatientEpisodes(walletAddress),
        getActiveGrants(),
        getPatientCheckInStatus(),
      ]);

      if (vaultRes.status === 'fulfilled') {
        setRecords(vaultRes.value.data || []);
        if (grantsRes.status !== 'fulfilled' && (vaultRes.value.accessGrants || []).length > 0) {
          setGrants(vaultRes.value.accessGrants);
        }
      }

      if (episodesRes.status === 'fulfilled') {
        setEpisodes(episodesRes.value.data || []);
      }

      if (grantsRes.status === 'fulfilled') {
        setGrants(grantsRes.value.data || []);
      }

      if (checkinRes.status === 'fulfilled') {
        const doctor = checkinRes.value?.data?.doctorAddress || checkinRes.value?.doctorAddress || null;
        setActiveCheckIn(doctor);
      }
    } catch {
      toast('Failed to load patient dashboard data.', 'error');
    } finally {
      setLoading(false);
    }
  }, [toast, walletAddress]);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  useEffect(() => {
    const interval = window.setInterval(async () => {
      try {
        const status = await getPatientCheckInStatus();
        const doctor = status?.data?.doctorAddress || status?.doctorAddress || null;
        setActiveCheckIn(doctor);
      } catch {
        // silent background refresh
      }
    }, 5000);
    return () => window.clearInterval(interval);
  }, []);

  const handleLogout = () => {
    if (wallet) disconnect(wallet);
    logout();
    window.setTimeout(() => {
      window.location.href = '/';
    }, 200);
  };

  const analyticsData = useMemo(() => {
    const buckets = monthBuckets(records);
    return {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
      datasets: [
        {
          label: 'Records',
          data: buckets,
          backgroundColor: '#4f46e5',
          borderRadius: 6,
        },
      ],
    };
  }, [records]);

  const chartOptions = useMemo(
    () => ({
      responsive: true,
      plugins: { legend: { display: false } },
      scales: {
        x: { ticks: { color: '#737373' }, grid: { color: '#e5e7eb' } },
        y: { ticks: { color: '#737373' }, grid: { color: '#e5e7eb' } },
      },
    }),
    []
  );

  const sortedRecords = useMemo(() => {
    const list = [...records];
    if (recordSort === 'oldest') {
      list.sort((a, b) => new Date(a.timestamp || 0).getTime() - new Date(b.timestamp || 0).getTime());
      return list;
    }
    if (recordSort === 'type') {
      list.sort((a, b) => String(a.recordType || '').localeCompare(String(b.recordType || '')));
      return list;
    }
    list.sort((a, b) => new Date(b.timestamp || 0).getTime() - new Date(a.timestamp || 0).getTime());
    return list;
  }, [records, recordSort]);

  const ungroupedRecords = useMemo(() => records.filter((record) => !record.episodeId), [records]);

  const handleCheckIn = async () => {
    if (!doctorInput.trim()) return;
    setIsCheckingIn(true);
    try {
      await checkInToClinic(doctorInput.trim());
      setActiveCheckIn(doctorInput.trim().toLowerCase());
      setDoctorInput('');
      toast('You are now checked in to the clinic.', 'success');
    } catch (error) {
      toast(error.message || 'Check-in failed.', 'error');
    } finally {
      setIsCheckingIn(false);
    }
  };

  const handleLeaveClinic = async () => {
    try {
      await leaveClinic();
      setActiveCheckIn(null);
      toast('You have left the clinic waiting room.', 'info');
    } catch (error) {
      toast(error.message || 'Could not leave clinic.', 'error');
    }
  };

  const handleGrantAccess = async () => {
    if (!grantDoctorInput.trim() || selectedRecordIds.length === 0) {
      toast('Select doctor wallet and at least one record.', 'warning');
      return;
    }
    setGranting(true);
    try {
      await grantAccess(grantDoctorInput.trim(), selectedRecordIds, selectedDuration);
      setGrantDoctorInput('');
      setSelectedRecordIds([]);
      await refreshData();
      toast('Access granted successfully.', 'success');
    } catch (error) {
      toast(error.message || 'Could not grant access.', 'error');
    } finally {
      setGranting(false);
    }
  };

  const handleRevoke = async (grant) => {
    const ids = grant.recordIds?.length ? grant.recordIds : [grant.recordId];
    const target = grant.doctorAddress || grant.viewerAddress;
    try {
      for (const id of ids) {
        await revokeAccess(target, id);
      }
      await refreshData();
      toast('Access revoked successfully.', 'success');
    } catch (error) {
      toast(error.message || 'Could not revoke access.', 'error');
    }
  };

  const sidebarActions = (
    <Button
      type="button"
      className="w-full bg-indigo-600 text-white hover:bg-indigo-500"
      onClick={() => setShowPatientQr(true)}
    >
      <QrCode className="mr-2 h-4 w-4" />
      My QR Code
    </Button>
  );

  const renderOverview = () => (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-xl border border-neutral-200 bg-white p-4">
          <p className="text-sm text-neutral-500">Total Vaulted Files</p>
          <p className="mt-2 text-3xl font-bold text-neutral-900">{records.length}</p>
        </div>
        <div className="rounded-xl border border-neutral-200 bg-white p-4">
          <p className="text-sm text-neutral-500">Active Permissions</p>
          <p className="mt-2 text-3xl font-bold text-neutral-900">{grants.length}</p>
        </div>
        <div className="rounded-xl border border-neutral-200 bg-white p-4">
          <p className="text-sm text-neutral-500">Episodes</p>
          <p className="mt-2 text-3xl font-bold text-neutral-900">{episodes.length}</p>
        </div>
      </div>

      <div className="rounded-xl border border-neutral-200 bg-white p-4">
        <p className="mb-3 text-sm font-semibold text-neutral-900">Activity Analytics</p>
        <Bar data={analyticsData} options={chartOptions} />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-neutral-200 bg-white p-4">
          <p className="mb-3 text-sm font-semibold text-neutral-900">Recent Activity</p>
          {records.length === 0 ? (
            <p className="text-sm text-neutral-500">No recent records.</p>
          ) : (
            <div className="space-y-2">
              {sortedRecords.slice(0, 4).map((record) => (
                <button
                  type="button"
                  key={record.recordId || record.id}
                  className="flex w-full items-center justify-between rounded-md border border-neutral-200 px-3 py-2 text-left hover:bg-neutral-50"
                  onClick={() => openIpfs(record.ipfsCid)}
                >
                  <div>
                    <p className="text-sm font-semibold text-neutral-900">{record.filename || record.recordType}</p>
                    <p className="text-xs text-neutral-500">{record.recordType}</p>
                  </div>
                  <Eye className="h-4 w-4 text-indigo-600" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-xl border border-neutral-200 bg-white p-4">
          <p className="mb-3 text-sm font-semibold text-neutral-900">Clinic Direct-Connect</p>
          {activeCheckIn ? (
            <div className="space-y-3 rounded-lg border border-emerald-200 bg-emerald-50 p-4">
              <p className="text-sm text-emerald-700">
                You are now in waiting room of <WalletAddress address={activeCheckIn} className="text-emerald-700" />.
              </p>
              <Button className="bg-rose-50 text-rose-600 hover:bg-rose-100" onClick={handleLeaveClinic}>
                Leave Clinic
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex gap-2">
                <input
                  className="w-full rounded-md border border-neutral-200 bg-neutral-50 px-3 py-2 text-sm text-neutral-900 outline-none"
                  placeholder="0x... doctor wallet address"
                  value={doctorInput}
                  onChange={(event) => setDoctorInput(event.target.value)}
                />
                <Button type="button" variant="outline" className="border-neutral-200 text-neutral-900" onClick={() => setScanMode('checkin')}>
                  <ScanLine className="h-4 w-4" />
                </Button>
              </div>
              <Button className="bg-indigo-600 text-white hover:bg-indigo-500" disabled={isCheckingIn} onClick={handleCheckIn}>
                {isCheckingIn ? 'Checking in...' : 'Secure Check-In'}
              </Button>
            </div>
          )}
        </div>
      </div>

      <div className="rounded-xl border border-neutral-200 bg-white p-4">
        <p className="mb-3 text-sm font-semibold text-neutral-900">Chain-of-Custody Audit Log</p>
        {records.length === 0 ? (
          <p className="text-sm text-neutral-500">No audit events yet.</p>
        ) : (
          <div className="max-h-[420px] overflow-auto rounded-md border border-neutral-200">
            <table className="w-full text-left text-sm">
              <thead className="bg-neutral-50 text-neutral-500">
                <tr>
                  <th className="px-3 py-2">Activity</th>
                  <th className="px-3 py-2">Record ID</th>
                  <th className="px-3 py-2">Type</th>
                  <th className="px-3 py-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {sortedRecords.slice(0, 8).map((record) => (
                  <tr key={record.recordId || record.id} className="border-t border-neutral-200 text-neutral-900">
                    <td className="px-3 py-2">{record.previousRecordId ? 'Amendment Issued' : 'Record Minted'}</td>
                    <td className="px-3 py-2">#{record.recordId || record.id}</td>
                    <td className="px-3 py-2">{record.recordType}</td>
                    <td className="px-3 py-2">
                      <StatusBadge status={record.superseded ? 'superseded' : 'verified'} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );

  const renderRecords = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold text-neutral-900">My Records</h2>
        <select
          className="rounded-md border border-neutral-200 bg-white px-2 py-1 text-sm text-neutral-900"
          value={recordSort}
          onChange={(event) => setRecordSort(event.target.value)}
        >
          <option value="newest">Newest First</option>
          <option value="oldest">Oldest First</option>
          <option value="type">By Type</option>
        </select>
      </div>
      {sortedRecords.length === 0 ? (
        <EmptyState icon={FolderOpen} title="No records yet" description="Visit a clinic to get started." />
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {sortedRecords.map((record) => (
            <div
              key={record.recordId || record.id}
              className={`rounded-xl border border-neutral-200 bg-white p-4 ${record.superseded ? 'opacity-60' : ''}`}
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-sm font-semibold text-neutral-900">{record.filename || 'Medical Record'}</p>
                  <p className="text-xs text-neutral-500">{record.recordType}</p>
                </div>
                <StatusBadge status={record.superseded ? 'superseded' : 'verified'} />
              </div>
              <p className="mt-2 text-xs text-neutral-500">Minted: {formatDate(record.timestamp)}</p>
              <p className="mt-1 text-xs text-neutral-500">
                Doctor: <WalletAddress address={record.doctorAddress} />
              </p>
              <Button className="mt-3 bg-indigo-600 text-white hover:bg-indigo-500" onClick={() => openIpfs(record.ipfsCid)}>
                <Eye className="mr-2 h-4 w-4" />
                View Record
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderEpisodes = () => (
    <div className="space-y-4">
      <h2 className="text-base font-semibold text-neutral-900">Episodes of Care</h2>
      {episodes.length === 0 ? (
        <EmptyState
          icon={FolderKanban}
          title="No episodes yet"
          description="Your doctor will create an episode at your next appointment."
        />
      ) : (
        <Accordion type="multiple" className="rounded-xl border border-neutral-200 bg-white p-4">
          {episodes.map((episode) => (
            <AccordionItem key={episode.id} value={String(episode.id)} className="border-b border-neutral-200">
              <AccordionTrigger className="py-3 text-neutral-900 hover:no-underline">
                <div className="flex w-full items-center justify-between pr-4">
                  <div className="border-l-4 border-violet-500 pl-3 text-left">
                    <p className="font-semibold">{episode.title}</p>
                    <p className="text-xs text-neutral-500">
                      {episode.records.length} records · {formatDate(episode.createdAt)} ·{' '}
                      <WalletAddress address={episode.doctorAddress} />
                    </p>
                  </div>
                  <Button
                    type="button"
                    className="bg-indigo-600 text-white hover:bg-indigo-500"
                    onClick={(event) => {
                      event.stopPropagation();
                      setClaimQrEpisode(episode);
                    }}
                  >
                    Generate Claim QR
                  </Button>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-2 pb-3">
                  {episode.records.map((record) => (
                    <div key={record.recordId || record.id} className="rounded-md border border-neutral-200 bg-neutral-50 p-3">
                      <div className="flex items-center justify-between gap-2">
                        <div>
                          <p className="text-sm font-semibold text-neutral-900">{record.filename || record.recordType}</p>
                          <p className="text-xs text-neutral-500">{formatDate(record.timestamp)}</p>
                        </div>
                        <Button size="sm" className="bg-indigo-600 text-white hover:bg-indigo-500" onClick={() => openIpfs(record.ipfsCid)}>
                          <Eye className="mr-1 h-4 w-4" />
                          View
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      )}

      <Accordion type="single" collapsible className="rounded-xl border border-neutral-200 bg-white p-4">
        <AccordionItem value="ungrouped" className="border-b-0">
          <AccordionTrigger className="text-neutral-900 hover:no-underline">Ungrouped Records</AccordionTrigger>
          <AccordionContent>
            {ungroupedRecords.length === 0 ? (
              <p className="text-sm text-neutral-500">No ungrouped records.</p>
            ) : (
              <div className="space-y-2">
                {ungroupedRecords.map((record) => (
                  <div key={record.recordId || record.id} className="rounded-md border border-neutral-200 bg-neutral-50 p-3">
                    <p className="text-sm font-semibold text-neutral-900">{record.filename || record.recordType}</p>
                    <p className="text-xs text-neutral-500">{record.recordType}</p>
                  </div>
                ))}
              </div>
            )}
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );

  const renderAccessControl = () => (
    <div className="grid gap-4 lg:grid-cols-2">
      <section className="rounded-xl border border-neutral-200 bg-white p-4">
        <h2 className="mb-3 text-base font-semibold text-neutral-900">Live Permissions</h2>
        {grants.length === 0 ? (
          <EmptyState icon={ShieldCheck} title="No live permissions" description="Grant access to a doctor from the right panel." />
        ) : (
          <div className="space-y-2">
            {grants.map((grant) => {
              const warning = grant.expiresAt ? new Date(grant.expiresAt).getTime() - Date.now() < 60 * 60 * 1000 : false;
              return (
                <div key={grant.id} className="rounded-md border border-neutral-200 bg-neutral-50 p-3">
                  <p className="text-sm font-semibold text-neutral-900">
                    <WalletAddress address={grant.doctorAddress || grant.viewerAddress} className="text-neutral-900" />
                  </p>
                  <p className="mt-1 text-xs text-neutral-500">{(grant.recordIds || []).length || 1} records included</p>
                  <p className={`mt-1 text-xs ${warning ? 'text-rose-600' : 'text-neutral-500'}`}>{remainingText(grant.expiresAt)}</p>
                  <Button className="mt-2 bg-rose-50 text-rose-600 hover:bg-rose-100" onClick={() => handleRevoke(grant)}>
                    Revoke
                  </Button>
                </div>
              );
            })}
          </div>
        )}
      </section>

      <section className="rounded-xl border border-neutral-200 bg-white p-4">
        <h2 className="mb-3 text-base font-semibold text-neutral-900">Grant New Access</h2>
        <div className="space-y-3">
          <div className="flex gap-2">
            <input
              className="w-full rounded-md border border-neutral-200 bg-neutral-50 px-3 py-2 text-sm text-neutral-900 outline-none"
              placeholder="Doctor wallet address"
              value={grantDoctorInput}
              onChange={(event) => setGrantDoctorInput(event.target.value)}
            />
            <Button type="button" variant="outline" className="border-neutral-200 text-neutral-900" onClick={() => setScanMode('grant')}>
              <ScanLine className="h-4 w-4" />
            </Button>
          </div>

          <div className="rounded-md border border-neutral-200 bg-neutral-50 p-2">
            <p className="mb-2 text-xs text-neutral-500">Select records</p>
            <div className="max-h-40 space-y-1 overflow-auto">
              {records.map((record) => {
                const checked = selectedRecordIds.includes(record.recordId);
                return (
                  <label key={record.recordId || record.id} className="flex items-center gap-2 text-sm text-neutral-900">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={(event) => {
                        const id = record.recordId;
                        if (!id) return;
                        setSelectedRecordIds((prev) =>
                          event.target.checked ? [...prev, id] : prev.filter((item) => item !== id)
                        );
                      }}
                    />
                    <span>{record.recordType}</span>
                  </label>
                );
              })}
            </div>
          </div>

          <select
            className="w-full rounded-md border border-neutral-200 bg-neutral-50 px-3 py-2 text-sm text-neutral-900"
            value={selectedDuration}
            onChange={(event) => setSelectedDuration(Number(event.target.value))}
          >
            {DURATION_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          <Button className="w-full bg-indigo-600 text-white hover:bg-indigo-500" disabled={granting} onClick={handleGrantAccess}>
            <PlusCircle className="mr-2 h-4 w-4" />
            {granting ? 'Granting...' : 'Grant Access'}
          </Button>
        </div>
      </section>
    </div>
  );

  const renderAppointments = () => (
    <div className="rounded-xl border border-neutral-200 bg-white p-4">
      <h2 className="mb-3 text-base font-semibold text-neutral-900">Appointments & Clinic Access</h2>
      {activeCheckIn ? (
        <div className="space-y-3 rounded-lg border border-emerald-200 bg-emerald-50 p-4">
          <p className="text-sm text-emerald-700">
            Active check-in with <WalletAddress address={activeCheckIn} className="text-emerald-700" />
          </p>
          <Button className="bg-rose-50 text-rose-600 hover:bg-rose-100" onClick={handleLeaveClinic}>
            Leave Clinic
          </Button>
        </div>
      ) : (
        <p className="text-sm text-neutral-500">No active check-in right now.</p>
      )}
    </div>
  );

  const renderSettings = () => (
    <div className="rounded-xl border border-neutral-200 bg-white p-4">
      <h2 className="mb-2 text-base font-semibold text-neutral-900">Settings</h2>
      <p className="text-sm text-neutral-500">Dashboard settings and preferences will appear here.</p>
    </div>
  );

  let content = null;
  if (loading) {
    content = <LoadingSpinner message="Loading patient dashboard..." />;
  } else if (activeNav === 'overview') {
    content = renderOverview();
  } else if (activeNav === 'records') {
    content = renderRecords();
  } else if (activeNav === 'episodes') {
    content = renderEpisodes();
  } else if (activeNav === 'access') {
    content = renderAccessControl();
  } else if (activeNav === 'appointments') {
    content = renderAppointments();
  } else {
    content = renderSettings();
  }

  return (
    <>
      <AppLayout
        title="Patient Dashboard"
        role="PATIENT"
        navItems={NAV_ITEMS}
        activeNav={activeNav}
        onNavChange={setActiveNav}
        onLogout={handleLogout}
        walletAddress={walletAddress}
        walletConnected={walletConnected}
        sidebarActions={sidebarActions}
      >
        {content}
      </AppLayout>

      <QRDisplay
        open={showPatientQr}
        payload={{ type: 'PATIENT_ID', patientAddress: walletAddress, name: user?.name || 'Patient' }}
        title="My Patient QR"
        subtitle="Show this to your doctor to share your records."
        onClose={() => setShowPatientQr(false)}
      />

      <QRDisplay
        open={Boolean(claimQrEpisode)}
        payload={{
          type: 'CLAIM_ACCESS',
          patientAddress: walletAddress,
          episodeId: claimQrEpisode?.id,
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        }}
        title={claimQrEpisode ? `Claim QR â€” ${claimQrEpisode.title}` : 'Claim QR'}
        subtitle="Valid for 24 hours."
        onClose={() => setClaimQrEpisode(null)}
      />

      <QRScanner
        open={Boolean(scanMode)}
        expectedType={scanMode === 'grant' ? 'PATIENT_ID' : 'CLINIC_CHECKIN'}
        onClose={() => setScanMode(null)}
        onScanSuccess={(payload) => {
          if (scanMode === 'checkin') {
            setDoctorInput(payload.doctorAddress || '');
            toast(payload.clinicName ? `Clinic detected: ${payload.clinicName}` : 'Doctor address added.', 'info');
          } else if (scanMode === 'grant') {
            setGrantDoctorInput(payload.doctorAddress || payload.patientAddress || '');
          }
        }}
      />
    </>
  );
}

