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
import { analyzeEpisode, verifyRecord } from '@/services/api';
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
  window.open(`https://gateway.pinata.cloud/ipfs/${cid}`, '_blank', 'noopener,noreferrer');
}

function getTrustScore(verificationResult, aiResult) {
  if (typeof aiResult?.score === 'number') return aiResult.score;
  if (typeof aiResult?.trustScore === 'number') return aiResult.trustScore;

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
    notSuperseded: !(recordData.isSuperseded ?? recordData.is_superseded ?? false),
    recommendation: data.recommendation || null,
    primaryCid: recordData.ipfsCid || recordData.ipfs_cid || recordData.cid || null,
    auditTrail: Array.isArray(trail)
      ? trail.map((entry, index) => ({
          id: entry.recordId || entry.record_id || `${index}`,
          recordId: entry.recordId || entry.record_id || 'â€”',
          filename: entry.filename || entry.fileName || entry.recordType || 'Medical Record',
          doctorAddress: entry.doctorAddress || entry.doctor_address || '',
          timestamp: entry.timestamp || entry.createdAt || entry.created_at || null,
          superseded: entry.isSuperseded ?? entry.is_superseded ?? index !== 0,
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
    if (!patientAddress.trim() || !recordId.trim()) {
      toast('Enter patient wallet and record/token ID.', 'warning');
      return;
    }

    setIsVerifying(true);
    setVerificationResult(null);
    setAiResult(null);
    try {
      const verifyRes = await verifyRecord(patientAddress.trim(), Number(recordId), walletAddress);
      const parsed = parseVerificationResponse(verifyRes);
      setVerificationResult(parsed);

      if (episodeId.trim()) {
        try {
          const aiRes = await analyzeEpisode(episodeId.trim());
          setAiResult(aiRes.data || aiRes);
        } catch {
          setAiResult({ riskLevel: 'UNKNOWN' });
        }
      } else {
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
      <div className="rounded-xl border border-neutral-200 bg-white p-4">
        <p className="text-sm text-neutral-500">Last Trust Score</p>
        <p className="mt-2 text-3xl font-bold text-neutral-900">{verificationResult ? `${trustScore}/100` : 'â€”'}</p>
      </div>
      <div className="rounded-xl border border-neutral-200 bg-white p-4">
        <p className="text-sm text-neutral-500">Verification Status</p>
        <p className="mt-2 text-sm font-semibold text-neutral-900">{verificationResult ? 'Ready' : 'Awaiting input'}</p>
      </div>
      <div className="rounded-xl border border-neutral-200 bg-white p-4">
        <p className="text-sm text-neutral-500">Claim Input</p>
        <p className="mt-2 text-sm font-semibold text-neutral-900">{episodeId ? 'Episode-scoped' : 'Record-scoped'}</p>
      </div>
    </div>
  );

  const renderVerification = () => (
    <div className="grid gap-4 lg:grid-cols-[360px_1fr]">
      <section className="rounded-xl border border-neutral-200 bg-white p-4">
        <h2 className="mb-3 text-base font-semibold text-neutral-900">Verification Engine</h2>

        <div className="mb-3 flex justify-end">
          <Button
            variant="outline"
            className="border-neutral-200 text-neutral-900"
            onClick={() => setScanOpen(true)}
          >
            <ScanLine className="mr-2 h-4 w-4" />
            Scan Claim QR
          </Button>
        </div>

        <div className="space-y-3">
          <input
            className="w-full rounded-md border border-neutral-200 bg-neutral-50 px-3 py-2 text-sm text-neutral-900 outline-none"
            placeholder="Patient wallet address"
            value={patientAddress}
            onChange={(event) => setPatientAddress(event.target.value)}
          />
          <input
            className="w-full rounded-md border border-neutral-200 bg-neutral-50 px-3 py-2 text-sm text-neutral-900 outline-none"
            placeholder="Record / Token ID"
            value={recordId}
            onChange={(event) => setRecordId(event.target.value)}
          />
          <input
            className="w-full rounded-md border border-neutral-200 bg-neutral-50 px-3 py-2 text-sm text-neutral-900 outline-none"
            placeholder="Episode ID (optional for AI)"
            value={episodeId}
            onChange={(event) => setEpisodeId(event.target.value)}
          />
          <Button className="w-full bg-indigo-600 text-white hover:bg-indigo-500" disabled={isVerifying} onClick={handleVerify}>
            <ShieldCheck className="mr-2 h-4 w-4" />
            {isVerifying ? 'Verifying...' : 'Execute Triple-Check'}
          </Button>
        </div>
      </section>

      <section className="rounded-xl border border-neutral-200 bg-white p-4">
        <h2 className="mb-3 text-base font-semibold text-neutral-900">Triple-Check Results</h2>
        {!verificationResult ? (
          <EmptyState
            icon={FileSearch}
            title="No verification yet"
            description="Execute Triple-Check to view results."
          />
        ) : (
          <div className="space-y-4">
            <div className="rounded-md border border-neutral-200 bg-neutral-50 p-3">
              <TrustScoreBadge score={trustScore} showBar />
              <p className="mt-2 text-sm text-neutral-500">
                {aiResult?.recommendation || verificationResult?.recommendation || 'Review based on trust score and anomalies.'}
              </p>
            </div>

            <div className="space-y-2">
              <div className="rounded-md border border-neutral-200 bg-neutral-50 p-3">
                <p className="flex items-center gap-2 text-sm font-semibold text-neutral-900">
                  <Fingerprint className="h-4 w-4" />
                  Provider Authenticity
                </p>
                <p className="mt-1 text-sm text-neutral-500">
                  {verificationResult.signature
                    ? 'Verified signature of issuing professional.'
                    : 'Signature validation failed for issuing professional.'}
                </p>
              </div>
              <div className="rounded-md border border-neutral-200 bg-neutral-50 p-3">
                <p className="flex items-center gap-2 text-sm font-semibold text-neutral-900">
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
                <p className="flex items-center gap-2 text-sm font-semibold text-neutral-900">
                  <AlertTriangle className="h-4 w-4" />
                  Version Control
                </p>
                <p className="mt-1 text-sm text-neutral-500">
                  {verificationResult.notSuperseded ? 'Latest un-amended version.' : 'A newer version exists.'}
                </p>
              </div>
            </div>

            <div className="rounded-md border border-teal-200 bg-teal-50 p-3">
              <p className="flex items-center gap-2 text-sm font-semibold text-teal-700">
                <Brain className="h-4 w-4" />
                AI Analysis — Gemini Engine
              </p>
              {aiResult?.riskLevel === 'UNKNOWN' ? (
                <p className="mt-2 text-sm text-neutral-500">AI analysis unavailable. Cryptographic checks only.</p>
              ) : (
                <>
                  <p className="mt-2 text-sm text-teal-700">
                    Risk: {aiResult?.riskLevel || aiResult?.risk || 'N/A'} · Confidence: {aiResult?.confidence ?? 'N/A'}%
                  </p>
                  <p className="mt-1 text-sm text-neutral-500">{aiResult?.reasoning || aiResult?.summary || 'No reasoning provided.'}</p>
                  {(aiResult?.additional_anomalies || aiResult?.additionalAnomalies || []).length > 0 ? (
                    <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-rose-600">
                      {(aiResult?.additional_anomalies || aiResult?.additionalAnomalies || []).map((item, index) => (
                        <li key={`${item}-${index}`}>{item}</li>
                      ))}
                    </ul>
                  ) : null}
                </>
              )}
            </div>

            <div className="rounded-md border border-neutral-200 bg-neutral-50 p-3">
              <button
                type="button"
                className="flex w-full items-center justify-between text-left text-sm font-semibold text-neutral-900"
                onClick={() => setRuleOpen((prev) => !prev)}
              >
                Rule Engine Findings
                {ruleOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </button>
              {ruleOpen ? (
                <div className="mt-2 space-y-2">
                  {verificationResult.ruleFindings.length === 0 ? (
                    <p className="rounded-md bg-emerald-50 px-2 py-1 text-sm text-emerald-700">No anomalies detected by rule engine.</p>
                  ) : (
                    verificationResult.ruleFindings.map((finding, index) => (
                      <div key={`${finding?.code || index}`} className="rounded-md border border-neutral-200 bg-white px-2 py-1 text-sm text-rose-600">
                        {finding.description || finding.message || 'Rule violation'} {finding.pointsDeducted ? `(-${finding.pointsDeducted})` : ''}
                      </div>
                    ))
                  )}
                </div>
              ) : null}
            </div>

            <div className="rounded-md border border-neutral-200 bg-neutral-50 p-3">
              <p className="mb-2 text-sm font-semibold text-neutral-900">Chain of Custody Audit Trail</p>
              {verificationResult.auditTrail.length === 0 ? (
                <p className="text-sm text-neutral-500">No audit trail data.</p>
              ) : (
                <div className="space-y-2">
                  {verificationResult.auditTrail.map((entry) => (
                    <div key={entry.id} className="rounded-md border border-neutral-200 bg-white p-3">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div>
                          <p className="text-sm font-semibold text-neutral-900">#{entry.recordId} · {entry.filename}</p>
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
                  ))}
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

  const renderClaimHistory = () => (
    <section className="rounded-xl border border-neutral-200 bg-white p-4">
      <h2 className="mb-2 text-base font-semibold text-neutral-900">Claim History</h2>
      <p className="text-sm text-neutral-500">Session-level verification results are shown in the Verify Claims tab.</p>
    </section>
  );

  const renderSettings = () => (
    <section className="rounded-xl border border-neutral-200 bg-white p-4">
      <h2 className="mb-2 text-base font-semibold text-neutral-900">Settings</h2>
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

