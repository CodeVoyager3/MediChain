import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useActiveAccount, useDisconnect, useActiveWalletChain, useSwitchActiveWalletChain } from 'thirdweb/react';
import { polygonAmoy } from 'thirdweb/chains';
import { signMessage } from 'thirdweb/utils';
import { requestNonce, verifySignature, registerUser, getUserProfile } from '../services/api';

const AuthContext = createContext(null);

const JWT_KEY = 'medichain_jwt';
const USER_KEY = 'medichain_user';
const AMOY_CHAIN_ID = 80002;

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);       // { walletAddress, name, role }
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showRegister, setShowRegister] = useState(false);
  const { disconnect } = useDisconnect();
  const account = useActiveAccount();
  const chain = useActiveWalletChain();
  const { switchChain } = useSwitchActiveWalletChain();

  const isCorrectNetwork = chain?.id === AMOY_CHAIN_ID;

  const isAuthenticated = !!token && !!user;

  // ─── Hydrate from localStorage on mount ─────────────────
  useEffect(() => {
    try {
      const savedToken = localStorage.getItem(JWT_KEY);
      const savedUser = localStorage.getItem(USER_KEY);
      if (savedToken && savedUser) {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
      }
    } catch {
      localStorage.removeItem(JWT_KEY);
      localStorage.removeItem(USER_KEY);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // ─── Login: nonce → sign → verify → JWT ─────────────────
  const login = useCallback(async (activeAccount, thirdwebClient) => {
    if (!activeAccount) throw new Error('No active wallet account');

    const walletAddress = activeAccount.address;

    // Step 0: Check network
    if (chain?.id !== AMOY_CHAIN_ID) {
      try {
        await switchChain(polygonAmoy);
      } catch (err) {
        throw new Error('Please switch to Polygon Amoy Testnet to continue.');
      }
    }

    // Step 1: Request nonce from backend
    const nonceRes = await requestNonce(walletAddress);
    const messageToSign = nonceRes.messageToSign;

    // Step 2: Sign the message with the user's wallet
    const signature = await signMessage({
      message: messageToSign,
      account: activeAccount,
    });

    // Step 3: Send signature to backend → get JWT
    const verifyRes = await verifySignature(walletAddress, signature);
    const jwt = verifyRes.token;

    // Step 4: Store JWT
    localStorage.setItem(JWT_KEY, jwt);
    setToken(jwt);

    // Step 5: Fetch user profile
    try {
      const profileRes = await getUserProfile(walletAddress);
      const userData = profileRes.user;

      if (userData.role === 'UNREGISTERED') {
        // First time user — needs to complete registration
        setUser({ walletAddress, name: null, role: 'UNREGISTERED' });
        localStorage.setItem(USER_KEY, JSON.stringify({ walletAddress, name: null, role: 'UNREGISTERED' }));
        setShowRegister(true);
        return { role: 'UNREGISTERED' };
      }

      const fullUser = {
        walletAddress: userData.walletAddress,
        name: userData.name,
        role: userData.role,
      };
      setUser(fullUser);
      localStorage.setItem(USER_KEY, JSON.stringify(fullUser));
      return fullUser;
    } catch {
      // Profile fetch failed, treat as unregistered
      setUser({ walletAddress, name: null, role: 'UNREGISTERED' });
      localStorage.setItem(USER_KEY, JSON.stringify({ walletAddress, name: null, role: 'UNREGISTERED' }));
      setShowRegister(true);
      return { role: 'UNREGISTERED' };
    }
  }, []);

  // ─── Register: complete profile ─────────────────────────
  const register = useCallback(async (name, role) => {
    const res = await registerUser(name, role);
    const updatedUser = {
      walletAddress: res.user.walletAddress,
      name: res.user.name,
      role: res.user.role,
    };
    setUser(updatedUser);
    localStorage.setItem(USER_KEY, JSON.stringify(updatedUser));
    setShowRegister(false);
    return updatedUser;
  }, []);

  // ─── Logout ─────────────────────────────────────────────
  const logout = useCallback(() => {
    localStorage.removeItem(JWT_KEY);
    localStorage.removeItem(USER_KEY);
    setToken(null);
    setUser(null);
    setShowRegister(false);
    // Disconnect the Thirdweb wallet
    if (disconnect) {
      try { disconnect(); } catch { /* ignore */ }
    }
  }, [disconnect]);

  const value = {
    user,
    token,
    isAuthenticated,
    isLoading,
    showRegister,
    setShowRegister,
    login,
    register,
    logout,
    isCorrectNetwork,
    switchNetwork: () => switchChain(polygonAmoy),
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
