import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, CheckCircle2, FileSignature, Wallet, ExternalLink, X } from 'lucide-react';
import { ShimmerButton } from '../magicui/shimmer-button';

/**
 * Transaction steps: 
 * 'IDLE' | 'SIGNING' | 'PENDING' | 'CONFIRMED' | 'ERROR'
 */

export function TransactionModal({ 
  state, 
  onClose, 
  title, 
  txHash, 
  error 
}) {
  if (state === 'IDLE') return null;

  const steps = [
    { id: 'SIGNING', label: 'Signature Required', icon: FileSignature, color: 'text-amber-400' },
    { id: 'PENDING', label: 'Transaction Pending', icon: Loader2, color: 'text-secondary', animate: true },
    { id: 'CONFIRMED', label: 'Transaction Confirmed', icon: CheckCircle2, color: 'text-emerald-500' },
  ];

  const currentStepIndex = steps.findIndex(s => s.id === state);

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/80 backdrop-blur-md"
          onClick={state === 'CONFIRMED' || state === 'ERROR' ? onClose : undefined}
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative w-full max-w-sm bg-card border border-border rounded-3xl shadow-2xl overflow-hidden p-8 text-center"
        >
          {/* Close button (only error/success) */}
          {(state === 'CONFIRMED' || state === 'ERROR') && (
            <button 
              onClick={onClose}
              className="absolute top-4 right-4 p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-full transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}

          <div className="flex flex-col items-center">
            {/* Action Icon */}
            <div className={`w-20 h-20 rounded-2xl bg-muted flex items-center justify-center mb-6 relative`}>
              {state === 'SIGNING' && (
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="text-amber-400"
                >
                  <FileSignature className="w-10 h-10" />
                </motion.div>
              )}
              {state === 'PENDING' && (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                  className="text-secondary"
                >
                  <Loader2 className="w-10 h-10" />
                </motion.div>
              )}
              {state === 'CONFIRMED' && (
                <motion.div
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: 'spring', damping: 12 }}
                  className="text-emerald-500"
                >
                  <CheckCircle2 className="w-10 h-10" />
                </motion.div>
              )}
              {state === 'ERROR' && (
                <motion.div
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="text-red-500"
                >
                  <X className="w-10 h-10" />
                </motion.div>
              )}
              
              {/* Outer Pulse */}
              {state === 'PENDING' && (
                <span className="absolute inset-0 rounded-2xl border-2 border-secondary/30 animate-ping" />
              )}
            </div>

            <h3 className="text-xl font-bold text-foreground mb-2">
              {state === 'ERROR' ? 'Action Failed' : (title || 'Processing…')}
            </h3>
            
            <p className="text-[13px] text-muted-foreground mb-8 leading-relaxed px-4">
              {state === 'SIGNING' && 'Please confirm the request in your connected wallet app (MetaMask, Coinbase, etc.).'}
              {state === 'PENDING' && 'Your transaction has been broadcast to the network. Waiting for confirmation on Polygon Amoy.'}
              {state === 'CONFIRMED' && 'Great! Your medical data has been immutable secured on the blockchain.'}
              {state === 'ERROR' && (error || 'An unexpected error occurred during the transaction.')}
            </p>

            {/* Steps Progress */}
            {state !== 'ERROR' && (
              <div className="flex items-center gap-2 mb-8 w-full max-w-[200px] justify-center">
                {steps.map((step, i) => {
                  const isActive = steps.findIndex(s => s.id === state) >= i;
                  return (
                    <React.Fragment key={step.id}>
                      <div className={`w-2.5 h-2.5 rounded-full transition-colors duration-500 ${isActive ? step.color.replace('text-', 'bg-') : 'bg-muted'}`} />
                      {i < steps.length - 1 && (
                        <div className={`h-[2px] w-8 rounded-full transition-colors duration-500 ${steps.findIndex(s => s.id === state) > i ? 'bg-secondary' : 'bg-muted'}`} />
                      )}
                    </React.Fragment>
                  );
                })}
              </div>
            )}

            {/* Actions */}
            <div className="w-full space-y-3">
              {txHash && (
                <a 
                  href={`https://amoy.polygonscan.com/tx/${txHash}`}
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 text-[12px] font-semibold text-secondary hover:underline"
                >
                  View on PolygonScan
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
              
              {state === 'CONFIRMED' && (
                <ShimmerButton 
                  onClick={onClose}
                  className="w-full py-3 rounded-2xl text-[14px] font-bold border-none"
                  background='hsl(var(--secondary))'
                >
                  <span className="text-background">Done</span>
                </ShimmerButton>
              )}

              {state === 'ERROR' && (
                <button
                  onClick={onClose}
                  className="w-full py-3 rounded-2xl text-[14px] font-bold bg-muted text-foreground hover:bg-muted/80 transition-colors"
                >
                  Close
                </button>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
