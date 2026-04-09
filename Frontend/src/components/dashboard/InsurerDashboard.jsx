import React, { useMemo, useState } from 'react';
import { useActiveAccount, useActiveWallet, useDisconnect } from 'thirdweb/react';
import {
  AlertTriangle,
  Brain,
  CheckCircle2,
  Eye,
  Fingerprint,
  Hash,
  LayoutDashboard,
  QrCode,
  ScanLine,
  Settings,
  ShieldCheck,
  ShieldX,
  FileSearch,
  History,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { analyzeEpisode, verifyRecord, verifyEpisode } from '@/services/api';
import AppLayout from '@/components/common/AppLayout';
import EmptyState from '@/components/common/EmptyState';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import QRScanner from '@/components/common/QRScanner';
import StatusBadge from '@/components/common/StatusBadge';
import TrustScoreBadge from '@/components/common/TrustScoreBadge';
import WalletAddress from '@/components/common/WalletAddress';
import { useToast } from '@/components/common/ToastNotification';

const NAV_ITEMS = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'verify-claims', label: 'Verify Claims', icon: FileSearch },
  { id: 'claim-history', label: 'Claim History', icon: History },
  { id: 'settings', label: 'Settings', icon: Settings },
];

function openIpfs(cid) {
  if (!cid) return;
  let cleanCid = String(cid).trim();
  if (cleanCid.startsWith('ipfs://')) cleanCid = cleanCid.replace('ipfs://', '');
  if (cleanCid.startsWith('ipfs/')) cleanCid = cleanCid.replace('ipfs/', '');
  window.open(`https://ipfs.io/ipfs/${cleanCid}`, '_blank', 'noopener,noreferrer');
}

function getTrustScore(verificationResult, aiResult) {
  if (typeof aiResult?.finalTrustScore === 'number') return aiResult.finalTrustScore;
  if (typeof aiResult?.trustScore === 'number') return aiResult.trustScore;
  if (typeof aiResult?.score === 'number') return aiResult.score;

  if (typeof verificationResult?.trustScore === 'number') return verificationResult.trustScore;

  let score = 100;
  if (!verificationResult.signature) score -= 40;
  if (!verificationResult.hashMatch) score -= 35;
  if (!verificationResult.notSuperseded) score -= 20;
  return Math.max(0, score);
}

function parseVerificationResponse(raw = {}) {
  const data = raw?.data || raw;
  const checks = data.securityChecks || data.security_checks || data.checks || {};
  const recordData = data.recordData || data.record_data || {};
  const trail = data.auditTrail || data.audit_trail || [];
  const findings = data.ruleFindings || data.rule_findings || [];

  return {
    signature: checks.authenticityVerified ?? checks.providerAuthenticity ?? checks.signatureValid ?? false,
    hashMatch: checks.integrityVerified ?? checks.hashMatch ?? false,
    notSuperseded: !(recordData.superseded ?? recordData.isSuperseded ?? recordData.is_superseded ?? false),
    recommendation: data.recommendation || null,
    primaryCid: recordData.ipfsCid || recordData.ipfs_cid || recordData.cid || null,
    auditTrail: Array.isArray(trail)
      ? trail.map((entry, index) => ({
          id: entry.recordId || entry.record_id || `${index}`,
          recordId: entry.recordId || entry.record_id || 'â€”',
          filename: entry.filename || entry.fileName || entry.recordType || 'Medical Record',
          doctorAddress: entry.doctorAddress || entry.doctor_address || '',
          timestamp: entry.timestamp || entry.createdAt || entry.created_at || null,
          superseded: entry.superseded ?? entry.isSuperseded ?? entry.is_superseded ?? index !== 0,
          ipfsCid: entry.ipfsCid || entry.ipfs_cid || entry.cid || null,
        }))
      : [],
    ruleFindings: Array.isArray(findings) ? findings : [],
  };
}

export default function InsurerDashboard() {
  const account = useActiveAccount();
  const wallet = useActiveWallet();
  const { disconnect } = useDisconnect();
  const { user, logout } = useAuth();
  const { toast } = useToast();

  const [activeNav, setActiveNav] = useState('verify-claims');
  const [patientAddress, setPatientAddress] = useState('');
  const [recordId, setRecordId] = useState('');
  const [episodeId, setEpisodeId] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState(null);
  const [episodeRecords, setEpisodeRecords] = useState([]);
  const [aiResult, setAiResult] = useState(null);
  const [scanOpen, setScanOpen] = useState(false);
  const [ruleOpen, setRuleOpen] = useState(true);

  const walletAddress = account?.address || user?.walletAddress || '';

  const handleLogout = () => {
    if (wallet) disconnect(wallet);
    logout();
    window.setTimeout(() => {
      window.location.href = '/';
    }, 200);
  };

  const handleVerify = async () => {
    if (!patientAddress.trim()) {
      toast('Enter patient wallet address.', 'warning');
      return;
    }
    if (!recordId.trim() && !episodeId.trim()) {
      toast('Enter either a Record ID or an Episode ID.', 'warning');
      return;
    }

    setIsVerifying(true);
    setVerificationResult(null);
    setEpisodeRecords([]);
    setAiResult(null);
    try {
      let verifyRes;
      if (episodeId.trim()) {
        // Episode-scoped verification
        verifyRes = await verifyEpisode(patientAddress.trim(), Number(episodeId));
        const episodeData = verifyRes?.data || verifyRes;
        
        // Track all valid records
        const validRecords = (episodeData.records || []).filter(r => r.accessGranted);
        if (validRecords.length > 0) {
          const parsed = validRecords.map(r => parseVerificationResponse(r));
          setEpisodeRecords(parsed);
          setVerificationResult(parsed[0]);
        } else {
          toast('No accessible records found in this episode.', 'warning');
        }

        // AI results are at the top level for episode verification
        setAiResult(episodeData.trustScoreResult || null);
      } else {
        // Single record verification
        verifyRes = await verifyRecord(patientAddress.trim(), Number(recordId), walletAddress);
        const parsed = parseVerificationResponse(verifyRes);
        setVerificationResult(parsed);

        const aiData = verifyRes?.data?.aiAnalysis || verifyRes?.aiAnalysis || null;
        setAiResult(aiData);
      }

      toast('Verification complete.', 'success');
    } catch (error) {
      toast(error.message || 'Verification failed.', 'error');
    } finally {
      setIsVerifying(false);
    }
  };

  const trustScore = useMemo(
    () => (verificationResult ? getTrustScore(verificationResult, aiResult || {}) : 0),
    [verificationResult, aiResult]
  );

  const latestRecord = useMemo(() => {
    if (!verificationResult?.auditTrail?.length) return null;
    return verificationResult.auditTrail.find((item) => !item.superseded) || verificationResult.auditTrail[0];
  }, [verificationResult]);

  const renderOverview = () => (
    <div className="grid gap-4 md:grid-cols-3">
      <div className="rounded-xl border border-neutral-200 bg-card p-4">
        <p className="text-sm text-neutral-500">Last Trust Score</p>
        <p className="mt-2 text-3xl font-bold text-foreground">{verificationResult ? `${trustScore}/100` : 'â€”'}</p>
      </div>
      <div className="rounded-xl border border-neutral-200 bg-card p-4">
        <p className="text-sm text-neutral-500">Verification Status</p>
        <p className="mt-2 text-sm font-semibold text-foreground">{verificationResult ? 'Ready' : 'Awaiting input'}</p>
      </div>
      <div className="rounded-xl border border-neutral-200 bg-card p-4">
        <p className="text-sm text-neutral-500">Claim Input</p>
        <p className="mt-2 text-sm font-semibold text-foreground">{episodeId ? 'Episode-scoped' : 'Record-scoped'}</p>
      </div>
    </div>
  );

  const renderVerification = () => {
    const actualAi = aiResult?.aiAnalysis || aiResult;
    const actualFindings = aiResult?.ruleFindings || verificationResult?.ruleFindings || [];

    return (
    <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
      <section className="rounded-2xl border border-neutral-200/60 dark:border-white/10 bg-white/60 dark:bg-card p-5 shadow-sm backdrop-blur-md">
        <h2 className="mb-4 text-lg font-bold tracking-tight text-foreground dark:text-white">Verification Engine</h2>

        <div className="mb-4 flex justify-end">
          <Button
            variant="outline"
            className="border-neutral-200 dark:border-white/10 bg-card dark:bg-white/5 text-foreground dark:text-neutral-300 transition-all hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700 dark:hover:border-indigo-500/30 dark:hover:bg-indigo-500/10 dark:hover:text-indigo-400"
            onClick={() => setScanOpen(true)}
          >
            <ScanLine className="mr-2 h-4 w-4" />
            Scan Claim QR
          </Button>
        </div>

        <div className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">Patient Wallet Address</label>
            <input
              className="w-full rounded-xl border border-neutral-200 dark:border-white/10 bg-card dark:bg-white/5 px-4 py-2.5 text-sm font-mono text-foreground dark:text-white shadow-sm outline-none transition-all focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              placeholder="0x..."
              value={patientAddress}
              onChange={(event) => setPatientAddress(event.target.value)}
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">Record / Token ID</label>
            <input
              className="w-full rounded-xl border border-neutral-200 dark:border-white/10 bg-card dark:bg-white/5 px-4 py-2.5 text-sm font-mono text-foreground dark:text-white shadow-sm outline-none transition-all focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              placeholder="E.g. 1"
              value={recordId}
              onChange={(event) => setRecordId(event.target.value)}
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">Episode ID (Optional for AI)</label>
            <input
              className="w-full rounded-xl border border-neutral-200 dark:border-white/10 bg-card dark:bg-white/5 px-4 py-2.5 text-sm font-mono text-foreground dark:text-white shadow-sm outline-none transition-all focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              placeholder="E.g. 12"
              value={episodeId}
              onChange={(event) => setEpisodeId(event.target.value)}
            />
          </div>
          <Button 
            className="mt-6 w-full shadow-lg shadow-indigo-500/20 bg-indigo-600 py-6 text-white transition-all hover:-translate-y-0.5 hover:bg-indigo-500 hover:shadow-indigo-500/30 font-bold" 
            disabled={isVerifying} 
            onClick={handleVerify}
          >
            <ShieldCheck className="mr-2 h-5 w-5" />
            {isVerifying ? 'Verifying...' : 'Execute Triple-Check'}
          </Button>
        </div>
      </section>

      <section className="rounded-2xl border border-neutral-200/60 dark:border-white/10 bg-white/60 dark:bg-card p-5 shadow-sm backdrop-blur-md">
        <h2 className="mb-4 text-lg font-bold tracking-tight text-foreground dark:text-white">Triple-Check Results</h2>
        {!verificationResult ? (
          <EmptyState
            icon={FileSearch}
            title="No verification yet"
            description="Execute Triple-Check to view results."
          />
        ) : (
          <div className="space-y-4">
            <div className="rounded-xl border border-indigo-100 dark:border-indigo-500/20 bg-gradient-to-br from-indigo-50 to-white dark:from-indigo-500/10 dark:to-card p-5 shadow-inner">
              <TrustScoreBadge score={trustScore} showBar />
              <p className="mt-4 border-t border-indigo-100 dark:border-white/10 pt-3 text-sm font-medium text-neutral-700 dark:text-neutral-300">
                <span className="font-bold text-indigo-900 dark:text-indigo-400">Recommendation:</span> {actualAi?.recommendation || verificationResult?.recommendation || 'Review based on trust score and anomalies.'}
              </p>
            </div>

            {episodeRecords.length > 1 ? (
              <div className="space-y-4">
                <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 border-b border-neutral-200 dark:border-white/10 pb-2">Cryptographic Checks by Record</h3>
                <div className="grid gap-3 sm:grid-cols-2">
                  {episodeRecords.map((rec, i) => (
                    <div key={i} className="group overflow-hidden rounded-xl border border-neutral-200 dark:border-white/10 bg-card dark:bg-card transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-indigo-500/10 dark:hover:shadow-indigo-500/20">
                      <div className="bg-neutral-50 dark:bg-white/5 px-4 py-3 border-b border-neutral-100 dark:border-white/10 flex items-center justify-between">
                        <span className="text-xs font-mono font-bold text-neutral-700 dark:text-neutral-300">{rec.auditTrail?.[0]?.filename || 'Record'}</span>
                        {rec.signature && rec.hashMatch ? <CheckCircle2 className="h-4 w-4 text-emerald-500 drop-shadow-sm" /> : <AlertTriangle className="h-4 w-4 text-rose-500 animate-pulse" />}
                      </div>
                      
              <div className="p-4 space-y-3">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-neutral-500 dark:text-neutral-400 flex items-center gap-1"><Fingerprint className="h-3 w-3"/> Provider</span>
                  <span className={`font-bold ${rec.signature ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>{rec.signature ? 'Verified' : 'Failed'}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-neutral-500 dark:text-neutral-400 flex items-center gap-1"><Hash className="h-3 w-3"/> Integrity</span>
                  <span className={`font-bold ${rec.hashMatch ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>{rec.hashMatch ? 'Valid' : 'Mismatch'}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-neutral-500 dark:text-neutral-400 flex items-center gap-1"><AlertTriangle className="h-3 w-3"/> Version</span>
                  <span className={`font-bold ${rec.notSuperseded ? 'text-neutral-700 dark:text-neutral-300' : 'text-amber-600 dark:text-amber-400'}`}>{rec.notSuperseded ? 'Latest' : 'Amended'}</span>
                </div>
              </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="rounded-md border border-neutral-200 bg-neutral-50 p-3">
                  <p className="flex items-center gap-2 text-sm font-semibold text-foreground">
                    <Fingerprint className="h-4 w-4" />
                    Provider Authenticity
                  </p>
                  <p className="mt-1 text-sm text-neutral-500">
                    {verificationResult.signature
                      ? 'Verified signature of issuing professional.'
                      : 'Signature validation failed. (Demo Note: Zero-Trust Provider Check fails if Doctor Wallet is unregistered)'}
                  </p>
                </div>
                <div className="rounded-md border border-neutral-200 bg-neutral-50 p-3">
                  <p className="flex items-center gap-2 text-sm font-semibold text-foreground">
                    <Hash className="h-4 w-4" />
                    Cryptographic Integrity
                  </p>
                  <p className="mt-1 text-sm text-neutral-500">
                    {verificationResult.hashMatch
                      ? 'CID hash matches immutable blockchain record.'
                      : 'Hash mismatch detected. Document may have been tampered.'}
                  </p>
                </div>
                <div className="rounded-md border border-neutral-200 bg-neutral-50 p-3">
                  <p className="flex items-center gap-2 text-sm font-semibold text-foreground">
                    <AlertTriangle className="h-4 w-4" />
                    Version Control
                  </p>
                  <p className="mt-1 text-sm text-neutral-500">
                    {verificationResult.notSuperseded ? 'Latest un-amended version.' : 'A newer version exists.'}
                  </p>
                </div>
              </div>
            )}

            <div className="overflow-hidden rounded-xl border border-teal-200 dark:border-teal-500/20 bg-gradient-to-r from-teal-50 to-emerald-50 dark:from-teal-900/10 dark:to-emerald-900/10 shadow-sm relative">
              <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-teal-400 to-emerald-500"></div>
              <div className="p-4">
                <p className="flex items-center gap-2 text-sm font-extrabold tracking-tight text-teal-800 dark:text-teal-400">
                  <Brain className="h-5 w-5 text-teal-500 dark:text-teal-400" />
                  AI Analysis — Gemini Engine
                </p>
                {actualAi?.riskLevel === 'UNKNOWN' || actualAi?.risk_level === 'UNKNOWN' ? (
                  <p className="mt-3 text-sm text-teal-600/80 dark:text-teal-500">AI analysis unavailable. Cryptographic checks only.</p>
                ) : (
                  <div className="mt-3">
                    <div className="flex items-center gap-3">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-bold ${actualAi?.riskLevel === 'HIGH' || actualAi?.risk_level === 'HIGH' ? 'bg-rose-100 dark:bg-rose-500/20 text-rose-800 dark:text-rose-300' : actualAi?.riskLevel === 'MEDIUM' || actualAi?.risk_level === 'MEDIUM' ? 'bg-amber-100 dark:bg-amber-500/20 text-amber-800 dark:text-amber-300' : 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300'}`}>
                        Risk: {actualAi?.riskLevel || actualAi?.risk_level || actualAi?.risk || 'N/A'}
                      </span>
                      <span className="text-sm font-semibold text-teal-700 dark:text-teal-500">Confidence: {actualAi?.confidence ?? 'N/A'}%</span>
                    </div>
                    
                    <p className="mt-3 text-sm font-medium leading-relaxed text-teal-900/80 dark:text-teal-100/80">
                      {actualAi?.reasoning || actualAi?.summary || 'No reasoning provided.'}
                    </p>
                    
                    {(actualAi?.additional_anomalies || actualAi?.additionalAnomalies || []).length > 0 ? (
                      <div className="mt-4 rounded-lg bg-teal-100/50 p-3">
                        <ul className="list-disc space-y-1.5 pl-5 text-sm font-medium text-rose-700">
                          {(actualAi?.additional_anomalies || actualAi?.additionalAnomalies || []).map((item, index) => (
                            <li key={`${item}-${index}`}>{item}</li>
                          ))}
                        </ul>
                      </div>
                    ) : null}
                  </div>
                )}
              </div>
            </div>

            <div className="overflow-hidden rounded-xl border border-indigo-100 dark:border-white/10 bg-card dark:bg-card shadow-sm">
              <button
                type="button"
                className="flex w-full items-center justify-between bg-indigo-50/50 dark:bg-white/5 px-4 py-3 text-left text-sm font-bold text-indigo-900 dark:text-indigo-400 transition-colors hover:bg-indigo-50 dark:hover:bg-card/10"
                onClick={() => setRuleOpen((prev) => !prev)}
              >
                Rule Engine Findings
                {ruleOpen ? <ChevronUp className="h-5 w-5 text-indigo-400" /> : <ChevronDown className="h-5 w-5 text-indigo-400" />}
              </button>
              {ruleOpen ? (
                <div className="p-4 bg-card dark:bg-card">
                  {actualFindings.length === 0 ? (
                    <p className="rounded-lg bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20 px-3 py-2.5 text-sm font-semibold text-emerald-700 dark:text-emerald-400 flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4" />
                      No anomalies detected by rule engine.
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {actualFindings.map((finding, index) => (
                        <div key={`${finding?.code || index}`} className="flex items-start gap-3 rounded-lg border border-rose-100 dark:border-rose-500/20 bg-rose-50 dark:bg-rose-500/10 px-3 py-2.5 text-sm text-rose-700 dark:text-rose-400">
                          <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0 text-rose-500 dark:text-rose-400" />
                          <div>
                            <span className="font-semibold">{finding.description || finding.message || 'Rule violation'}</span>
                            {finding.pointsDeducted ? <span className="ml-2 inline-flex items-center rounded-full bg-rose-200 dark:bg-rose-500/30 px-2.5 py-0.5 text-xs font-bold text-rose-800 dark:text-rose-200">-{finding.pointsDeducted} pts</span> : ''}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : null}
            </div>

            <div className="rounded-xl border border-neutral-200 dark:border-white/10 bg-neutral-50 dark:bg-white/5 p-4">
              <p className="mb-4 text-sm font-bold tracking-tight text-foreground dark:text-white uppercase">Chain of Custody Audit Trail</p>
              {verificationResult.auditTrail.length === 0 ? (
                <p className="text-sm text-neutral-500 dark:text-neutral-400">No audit trail data available.</p>
              ) : (
                <div className="space-y-3">
                  {episodeRecords.length > 1 ? (
                    episodeRecords.flatMap(rec => rec.auditTrail).map((entry, idx) => (
                      <div key={`${entry.id}-${idx}`} className="rounded-xl border border-neutral-200 dark:border-white/10 bg-card dark:bg-card p-4 shadow-sm">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <div>
                            <p className="text-sm font-bold text-foreground dark:text-white">#{entry.recordId} · {entry.filename}</p>
                            <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
                              <WalletAddress address={entry.doctorAddress} /> · {entry.timestamp ? new Date(entry.timestamp).toLocaleString() : '—'}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <StatusBadge status={entry.superseded ? 'superseded' : 'latest'} />
                            <Button className="bg-indigo-600 dark:bg-indigo-500 text-white hover:bg-indigo-500 dark:hover:bg-indigo-400 h-9 px-4 text-xs font-bold" onClick={() => openIpfs(entry.ipfsCid)}>
                              <Eye className="mr-2 h-4 w-4" />
                              View
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    verificationResult.auditTrail.map((entry) => (
                      <div key={entry.id} className="rounded-md border border-neutral-200 bg-card p-3">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div>
                            <p className="text-sm font-semibold text-foreground">#{entry.recordId} · {entry.filename}</p>
                            <p className="text-xs text-neutral-500">
                              <WalletAddress address={entry.doctorAddress} /> · {entry.timestamp ? new Date(entry.timestamp).toLocaleString() : '—'}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <StatusBadge status={entry.superseded ? 'superseded' : 'latest'} />
                            <Button className="bg-indigo-600 text-white hover:bg-indigo-500" onClick={() => openIpfs(entry.ipfsCid)}>
                              <Eye className="mr-2 h-4 w-4" />
                              View
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              <Button
                className="mt-3 w-full bg-emerald-600 text-white hover:bg-emerald-500"
                disabled={!latestRecord}
                onClick={() => openIpfs(latestRecord?.ipfsCid || verificationResult.primaryCid)}
              >
                Open Verified Document
              </Button>
            </div>
          </div>
        )}
      </section>
    </div>
    );
  };

  const renderClaimHistory = () => (
    <section className="rounded-xl border border-neutral-200 bg-card p-4">
      <h2 className="mb-2 text-base font-semibold text-foreground">Claim History</h2>
      <p className="text-sm text-neutral-500">Session-level verification results are shown in the Verify Claims tab.</p>
    </section>
  );

  const renderSettings = () => (
    <section className="rounded-xl border border-neutral-200 bg-card p-4">
      <h2 className="mb-2 text-base font-semibold text-foreground">Settings</h2>
      <p className="text-sm text-neutral-500">Insurer dashboard settings will appear here.</p>
    </section>
  );

  let content = null;
  if (activeNav === 'overview') {
    content = renderOverview();
  } else if (activeNav === 'verify-claims') {
    content = isVerifying && !verificationResult ? <LoadingSpinner message="Running cryptographic checks..." /> : renderVerification();
  } else if (activeNav === 'claim-history') {
    content = renderClaimHistory();
  } else {
    content = renderSettings();
  }

  return (
    <>
      <AppLayout
        title="Insurer Dashboard"
        role="INSURER"
        navItems={NAV_ITEMS}
        activeNav={activeNav}
        onNavChange={setActiveNav}
        onLogout={handleLogout}
        walletAddress={walletAddress}
        walletConnected={Boolean(walletAddress)}
        sidebarActions={null}
      >
        {content}
      </AppLayout>

      <QRScanner
        open={scanOpen}
        expectedType="CLAIM_ACCESS"
        onClose={() => setScanOpen(false)}
        onScanSuccess={(payload) => {
          const expiresAt = payload?.expiresAt ? new Date(payload.expiresAt).getTime() : null;
          if (expiresAt && expiresAt < Date.now()) {
            toast('This claim QR has expired. Ask the patient to generate a new one.', 'error');
            return;
          }

          setPatientAddress(payload.patientAddress || '');
          setEpisodeId(payload.episodeId || '');
          if (payload.recordId != null) {
            setRecordId(String(payload.recordId));
          }
          toast('Claim QR loaded into verification form.', 'success');
        }}
      />
    </>
  );
}

