import React, { useMemo } from 'react';
import { Download, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function QRDisplay({ open, payload, title, subtitle, onClose }) {
  const value = useMemo(() => JSON.stringify(payload || {}), [payload]);
  const qrUrl = useMemo(
    () => `https://api.qrserver.com/v1/create-qr-code/?size=256x256&data=${encodeURIComponent(value)}`,
    [value]
  );

  if (!open) return null;

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = `https://api.qrserver.com/v1/create-qr-code/?size=512x512&data=${encodeURIComponent(value)}`;
    link.download = 'MediChain-QR.png';
    link.click();
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/70 p-4">
      <div className="relative w-full max-w-md rounded-xl border border-[#334155] bg-[#0F172A] p-6 text-center">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-3 top-3 rounded p-1 text-[#94A3B8] hover:bg-[#1E293B] hover:text-[#F1F5F9]"
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>

        <h3 className="text-base font-semibold text-[#F1F5F9]">{title}</h3>
        <p className="mt-1 text-sm text-[#94A3B8]">{subtitle}</p>

        <div className="mt-4 inline-flex rounded-lg bg-white p-3">
          <img src={qrUrl} alt="Generated QR Code" width={256} height={256} />
        </div>

        <Button
          type="button"
          onClick={handleDownload}
          className="mt-4 bg-[#1A73E8] text-white hover:bg-[#1A73E8]/90"
        >
          <Download className="mr-2 h-4 w-4" />
          Download QR
        </Button>
      </div>
    </div>
  );
}
