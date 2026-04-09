import React, { useEffect, useState } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { Camera, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function QRScanner({ isOpen, onClose, onScanSuccess }) {
    const [scannerInit, setScannerInit] = useState(false);

    useEffect(() => {
        if (!isOpen) return;

        // Small delay to ensure modal DOM is ready before injecting scanner
        const timer = setTimeout(() => {
            const scanner = new Html5QrcodeScanner("qr-reader-internal", {
                fps: 10,
                qrbox: { width: 250, height: 250 },
                aspectRatio: 1.0,
                showTorchButtonIfSupported: true
            }, false);

            scanner.render(
                (decodedText) => {
                    try {
                        const payload = JSON.parse(decodedText);
                        scanner.clear();
                        onScanSuccess(payload);
                    } catch (e) {
                        // If not valid JSON, pass raw string
                        scanner.clear();
                        onScanSuccess({ raw: decodedText });
                    }
                },
                (err) => {
                    // Ignore transient errors
                }
            );
            setScannerInit(true);

            return () => {
                scanner.clear().catch(e => console.error("Scanner cleanup failed", e));
            };
        }, 300);

        return () => clearTimeout(timer);
    }, [isOpen, onScanSuccess]);

    if (!isOpen) return null;

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
                        <h3 className="font-semibold text-sm flex items-center gap-2">
                            <Camera className="w-4 h-4" /> Scan QR Code
                        </h3>
                        <button onClick={onClose} className="p-1 rounded-md hover:bg-muted text-muted-foreground transition-colors">
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                    
                    <div className="p-4 bg-black/5" id="qr-reader-wrapper">
                        {/* The ID must match the Html5QrcodeScanner instantiation */}
                        <div id="qr-reader-internal" className="w-full rounded-xl overflow-hidden bg-black"></div>
                        {!scannerInit && (
                            <div className="h-[250px] flex items-center justify-center text-xs text-muted-foreground">
                                Initializing Camera...
                            </div>
                        )}
                    </div>
                    
                    <div className="p-4 bg-muted/30 border-t border-border text-center">
                        <p className="text-xs text-muted-foreground">Align the QR code within the frame to scan.</p>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}
