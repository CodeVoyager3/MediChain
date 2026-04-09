import React from 'react';
import { ShieldCheck, TriangleAlert, ShieldX } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

function getTrustMeta(score) {
  if (score >= 90) {
    return {
      label: 'HIGH TRUST',
      className: 'bg-[#16A34A]/20 text-[#16A34A] border-[#16A34A]/40',
      icon: ShieldCheck,
    };
  }

  if (score >= 65) {
    return {
      label: 'MEDIUM RISK',
      className: 'bg-[#D97706]/20 text-[#D97706] border-[#D97706]/40',
      icon: TriangleAlert,
    };
  }

  return {
    label: 'HIGH RISK',
    className: 'bg-[#DC2626]/20 text-[#DC2626] border-[#DC2626]/40',
    icon: ShieldX,
  };
}

export default function TrustScoreBadge({ score = 0, showBar = false, className }) {
  const safeScore = Math.max(0, Math.min(100, Number(score) || 0));
  const meta = getTrustMeta(safeScore);
  const Icon = meta.icon;

  return (
    <div className={cn('space-y-2', className)}>
      <div className={cn('inline-flex items-center gap-1.5 rounded-md border px-2 py-1 text-xs font-semibold', meta.className)}>
        <Icon className="h-3.5 w-3.5" />
        <span>{meta.label}</span>
        <span>({safeScore}/100)</span>
      </div>
      {showBar ? (
        <Progress
          value={safeScore}
          className="h-2 bg-[#334155]/40 [&>div]:bg-[#16A34A] data-[risk=medium]:[&>div]:bg-[#D97706] data-[risk=high]:[&>div]:bg-[#DC2626]"
          data-risk={safeScore >= 90 ? 'low' : safeScore >= 65 ? 'medium' : 'high'}
        />
      ) : null}
    </div>
  );
}
