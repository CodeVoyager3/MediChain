import React from 'react';
import { cn } from '@/lib/utils';

const STATUS_STYLES = {
  verified: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  superseded: 'bg-amber-50 text-amber-700 border-amber-200',
  latest: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  pending: 'bg-neutral-100 text-neutral-600 border',
  waiting: 'bg-neutral-100 text-neutral-600 border',
};

export default function StatusBadge({ status = 'pending', className }) {
  const key = String(status).toLowerCase();
  const label = key.toUpperCase();

  return (
    <span
      className={cn(
        'inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-semibold tracking-wide border',
        STATUS_STYLES[key] || STATUS_STYLES.pending,
        className
      )}
    >
      {label}
    </span>
  );
}
