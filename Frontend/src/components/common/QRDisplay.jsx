import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function QRDisplay({ isOpen, onClose, payload, title = "Scan QR Code" }) {
    if (!isOpen) return null;

    const qrDataString = typeof payload === 'string' ? payload : JSON.stringify(payload);

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm"
                onClick={onClose}
            >
                <motion.div
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.95, opacity: 0 }}
                    onClick={(e) => e.stopPropagation()}
                    className="bg-background border border-border shadow-2xl rounded-2xl w-full max-w-sm overflow-hidden"
                >
                    <div className="flex items-center justify-between p-4 border-b border-border">
                        <h3 className="font-semibold text-sm">{title}</h3>
                        <button onClick={onClose} className="p-1 rounded-md hover:bg-muted text-muted-foreground transition-colors">
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                    
                    <div className="p-8 flex flex-col items-center justify-center bg-white">
                        <div className="p-4 bg-white rounded-xl shadow-sm border border-slate-100">
                            <QRCodeSVG 
                                value={qrDataString} 
                                size={220} 
                                bgColor="#ffffff" 
                                fgColor="#000000" 
                                level="H"
                            />
                        </div>
                    </div>
                    
                    <div className="p-4 bg-muted/30 border-t border-border text-center">
                        <p className="text-xs text-muted-foreground">Scan with MediChain App or compatible scanner</p>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}
