// In src/context/AuthContext.jsx

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useActiveAccount, useActiveWalletChain, useSwitchActiveWalletChain } from "thirdweb/react";
import { signMessage } from "thirdweb/utils";
import { polygonAmoy } from "thirdweb/chains";
import { requestNonce, verifySignature, registerUser } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showRegister, setShowRegister] = useState(false);

  // Use Thirdweb hooks to track state
  const account = useActiveAccount();
  const activeChain = useActiveWalletChain();
  const switchChain = useSwitchActiveWalletChain();

  // Check token on mount
  useEffect(() => {
    const token = localStorage.getItem('medichain_jwt');
    const role = localStorage.getItem('role');
    const address = localStorage.getItem('walletAddress');

    if (token && role && address) {
      setUser({ role, walletAddress: address });
    }
    setLoading(false);
  }, []);

  const login = async (accountInstance, clientInstance) => {
    try {
      if (!accountInstance) throw new Error("No account connected");

      // 1. Enforce Network (Polygon Amoy Testnet)
      if (activeChain?.id !== 80002) {
        console.log("Wrong network detected. Attempting switch...");
        await switchChain(polygonAmoy);
      }

      console.log("Starting backend auth for:", accountInstance.address);

      // 2. Get Nonce
      const { messageToSign } = await requestNonce(accountInstance.address);

      // 3. Sign Message
      const signature = await signMessage({
        message: messageToSign,
        account: accountInstance,
      });

      // 4. Verify & Login
      const { token } = await verifySignature(accountInstance.address, signature);

      // 5. Store JWT and decode role from the token payload
      localStorage.setItem('medichain_jwt', token);
      const role = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')))?.role;
      
      if (!role || role === 'UNREGISTERED') {
        console.log("New user detected, showing registration modal.");
        setShowRegister(true);
        return null;
      }

      // 6. Complete profile storage
      localStorage.setItem('role', role);
      localStorage.setItem('walletAddress', accountInstance.address);

      setUser({ role, walletAddress: accountInstance.address });

      return role;
    } catch (error) {
      console.error("Auth flow error:", error);
      logout(); // Ensure clean state if it fails mid-way
      throw error;
    }
  };

  const register = async (name, role) => {
    try {
      if (!account) throw new Error("Wallet not connected");

      await registerUser(name, role);
      
      localStorage.setItem('role', role);
      localStorage.setItem('walletAddress', account.address);
      
      setUser({ role, walletAddress: account.address });
      setShowRegister(false);
      
      return role;
    } catch (error) {
      console.error("Registration failed:", error);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('medichain_jwt');
    localStorage.removeItem('role');
    localStorage.removeItem('walletAddress');
    setUser(null);
    setShowRegister(false);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, register, loading, showRegister, setShowRegister, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);