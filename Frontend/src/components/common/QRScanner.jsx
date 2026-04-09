import React, { useState } from 'react';
import { X, QrCode } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/common/ToastNotification';
import { motion, AnimatePresence } from 'framer-motion';

export default function QRScanner({ open, expectedType, onScanSuccess, onClose }) {
  const [value, setValue] = useState('');
  const { toast } = useToast();

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
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 backdrop-blur-[3px] bg-black/40 dark:bg-black/60"
          />

          {/* Dialog Container (Watermelon DialogStack Aesthetic) */}
          <motion.div
            initial={{ y: 50, opacity: 0, scale: 0.95 }}
            animate={{ y: 0, scale: 1, opacity: 1 }}
            exit={{ y: 50, opacity: 0, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300, damping: 28 }}
            className="relative w-full max-w-sm sm:max-w-md bg-white dark:bg-neutral-900 rounded-[20px] sm:rounded-[24px] shadow-2xl border-[1.6px] border-neutral-200 dark:border-neutral-800 flex flex-col overflow-hidden h-fit transition-colors"
          >
            {/* Header */}
            <div className="flex items-center justify-between bg-neutral-50 dark:bg-neutral-800 border-b-[1.5px] border-neutral-200 dark:border-neutral-700 px-4 sm:px-5 py-2.5 sm:py-3 transition-colors">
              <div className="flex items-center gap-2">
                <QrCode className="size-4 sm:size-5 text-indigo-500" />
                <h3 className="text-base sm:text-lg font-medium text-neutral-800 dark:text-neutral-200">
                  QR Scanner
                </h3>
              </div>
              <button
                title="close"
                onClick={onClose}
                className="p-1 rounded-full transition-colors hover:bg-neutral-200 dark:hover:bg-neutral-700"
              >
                <X size={20} className="sm:size-[22px] text-neutral-500 dark:text-neutral-400" />
              </button>
            </div>

            {/* Content Body */}
            <div className="flex-1 px-5 sm:px-6 pb-6 sm:pb-8 pt-4 sm:pt-6 space-y-4 sm:space-y-5">
              <div>
                <p className="text-sm sm:text-base font-normal text-neutral-600 dark:text-neutral-400">
                  Point your camera at the QR code.
                </p>
                <p className="mt-1 text-[12px] sm:text-[14px] text-amber-600 dark:text-amber-500/80">
                  Fallback: paste decoded QR JSON below.
                </p>
              </div>

              <div className="space-y-2.5 sm:space-y-3">
                <textarea
                  className="w-full p-3 sm:p-4 py-2.5 sm:py-3 rounded-lg sm:rounded-xl border-[1.5px] focus:outline-none focus:ring-1 focus:ring-indigo-500/30 transition-colors border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-black dark:text-white h-32 resize-none font-mono text-xs sm:text-sm shadow-sm"
                  value={value}
                  onChange={(event) => setValue(event.target.value)}
                  placeholder={`{"type":"${expectedType}", ...}`}
                />
              </div>

              <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 pt-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  className="rounded-xl py-3 border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 w-full sm:w-auto font-medium" 
                  onClick={onClose}
                >
                  Cancel
                </Button>
                <Button 
                  type="button" 
                  className="rounded-xl py-3 bg-indigo-600 outline-none border-none text-white hover:bg-indigo-500 w-full sm:w-auto shadow-md font-medium" 
                  onClick={handleSubmit}
                >
                  Use Payload
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
