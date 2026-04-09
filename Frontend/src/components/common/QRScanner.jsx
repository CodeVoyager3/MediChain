import React, { useState } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/common/ToastNotification';

export default function QRScanner({ open, expectedType, onScanSuccess, onClose }) {
  const [value, setValue] = useState('');
  const { toast } = useToast();

  if (!open) return null;

  const handleSubmit = () => {
    try {
      const parsed = JSON.parse(value);
      if (parsed?.type !== expectedType) {
        toast(`Wrong QR type. Expected ${expectedType}.`, 'error');
        return;
      }
      onScanSuccess(parsed);
      setValue('');
      onClose();
    } catch {
      toast('Invalid QR payload. Paste valid JSON data.', 'error');
    }
  };

  return (
    <div className="fixed inset-0 z-[111] flex items-center justify-center bg-black/70 p-4">
      <div className="relative w-full max-w-lg rounded-xl border border-[#334155] bg-[#0F172A] p-6">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-3 top-3 rounded p-1 text-[#94A3B8] hover:bg-[#1E293B] hover:text-[#F1F5F9]"
          aria-label="Close scanner"
        >
          <X className="h-4 w-4" />
        </button>

        <h3 className="text-base font-semibold text-[#F1F5F9]">QR Scanner</h3>
        <p className="mt-1 text-sm text-[#94A3B8]">Point your camera at the QR code.</p>
        <p className="mt-1 text-xs text-[#D97706]">Camera scanner fallback: paste decoded QR JSON below.</p>

        <textarea
          className="mt-4 h-40 w-full rounded-md border border-[#334155] bg-[#1E293B] p-3 text-sm text-[#F1F5F9] outline-none placeholder:text-[#94A3B8]"
          value={value}
          onChange={(event) => setValue(event.target.value)}
          placeholder={`{"type":"${expectedType}"}`}
        />

        <div className="mt-4 flex justify-end gap-2">
          <Button type="button" variant="outline" className="border-[#334155] text-[#F1F5F9]" onClick={onClose}>
            Cancel
          </Button>
          <Button type="button" className="bg-[#1A73E8] text-white hover:bg-[#1A73E8]/90" onClick={handleSubmit}>
            Use Payload
          </Button>
        </div>
      </div>
    </div>
  );
}
