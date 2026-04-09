import React, { useMemo } from 'react';
import { Copy } from 'lucide-react';
import { cn } from '@/lib/utils';

function truncateAddress(address = '') {
  if (!address) return '—';
  if (address.length <= 12) return address;
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export default function WalletAddress({ address, showCopy = false, className, onCopy }) {
  const shortAddress = useMemo(() => truncateAddress(address), [address]);

  const handleCopy = async () => {
    if (!address) return;
    try {
      await navigator.clipboard.writeText(address);
      if (onCopy) onCopy();
    } catch {
      // noop
    }
  };

  return (
    <span className={cn('inline-flex items-center gap-1.5 font-mono text-[12px] text-[#94A3B8]', className)} title={address || ''}>
      <span>{shortAddress}</span>
      {showCopy ? (
        <button
          type="button"
          onClick={handleCopy}
          className="rounded p-0.5 text-[#94A3B8] hover:bg-[#1E293B] hover:text-[#F1F5F9]"
          aria-label="Copy wallet address"
        >
          <Copy className="h-3.5 w-3.5" />
        </button>
      ) : null}
    </span>
  );
}
