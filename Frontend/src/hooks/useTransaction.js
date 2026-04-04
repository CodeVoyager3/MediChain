import { useState, useCallback } from 'react';

export function useTransaction() {
  const [txState, setTxState] = useState('IDLE'); // 'IDLE', 'SIGNING', 'PENDING', 'CONFIRMED', 'ERROR'
  const [txHash, setTxHash] = useState(null);
  const [txError, setTxError] = useState(null);
  const [txTitle, setTxTitle] = useState('');

  const startTransaction = useCallback((title) => {
    setTxState('SIGNING');
    setTxTitle(title);
    setTxHash(null);
    setTxError(null);
  }, []);

  const setPending = useCallback((hash) => {
    setTxState('PENDING');
    setTxHash(hash);
  }, []);

  const setConfirmed = useCallback(() => {
    setTxState('CONFIRMED');
  }, []);

  const setFailed = useCallback((error) => {
    setTxState('ERROR');
    setTxError(error?.message || error || 'Transaction failed');
  }, []);

  const reset = useCallback(() => {
    setTxState('IDLE');
    setTxHash(null);
    setTxError(null);
    setTxTitle('');
  }, []);

  return {
    txState,
    txHash,
    txError,
    txTitle,
    startTransaction,
    setPending,
    setConfirmed,
    setFailed,
    setTxState,
    reset
  };
}
