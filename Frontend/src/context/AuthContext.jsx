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
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [showRegister, setShowRegister] = useState(false);

    const { disconnect } = useDisconnect();
    const account = useActiveAccount();
    const chain = useActiveWalletChain();
    const { switchChain } = useSwitchActiveWalletChain();

    const isCorrectNetwork = chain?.id === AMOY_CHAIN_ID;
    const isAuthenticated = !!token && !!user;

    useEffect(() => {
        try {
            const savedToken = localStorage.getItem(JWT_KEY);
            const savedUser = localStorage.getItem(USER_KEY);

            if (savedToken && savedUser) {
                const parsedUser = JSON.parse(savedUser);
                setToken(savedToken);
                setUser(parsedUser);
                if (parsedUser.role === 'UNREGISTERED') setShowRegister(true);
            }
        } catch {
            localStorage.removeItem(JWT_KEY);
            localStorage.removeItem(USER_KEY);
        } finally {
            setIsLoading(false);
        }
    }, []);

    const login = useCallback(async (activeAccount) => {
        if (!activeAccount) throw new Error('No active wallet account');
        const walletAddress = activeAccount.address;

        if (chain?.id !== AMOY_CHAIN_ID) throw new Error('Please switch to Polygon Amoy Testnet to continue.');

        const nonceRes = await requestNonce(walletAddress);
        const signature = await signMessage({ message: nonceRes.messageToSign, account: activeAccount });
        const verifyRes = await verifySignature(walletAddress, signature);
        const jwt = verifyRes.token;

        localStorage.setItem(JWT_KEY, jwt);
        setToken(jwt);

        try {
            const profileRes = await getUserProfile(walletAddress);
            const userData = profileRes.user;

            if (userData.role === 'UNREGISTERED') {
                const unregUser = { walletAddress, name: null, role: 'UNREGISTERED' };
                setUser(unregUser);
                localStorage.setItem(USER_KEY, JSON.stringify(unregUser));
                setShowRegister(true);
                return { role: 'UNREGISTERED' };
            }

            const fullUser = { walletAddress: userData.walletAddress, name: userData.name, role: userData.role };
            setUser(fullUser);
            localStorage.setItem(USER_KEY, JSON.stringify(fullUser));
            return fullUser;

        } catch (err) {
            const unregUser = { walletAddress, name: null, role: 'UNREGISTERED' };
            setUser(unregUser);
            localStorage.setItem(USER_KEY, JSON.stringify(unregUser));
            setShowRegister(true);
            return { role: 'UNREGISTERED' };
        }
    }, [chain]);

    const register = useCallback(async (name, role) => {
        const res = await registerUser(name, role);
        const updatedUser = { walletAddress: res.user.walletAddress, name: res.user.name, role: res.user.role };
        setUser(updatedUser);
        localStorage.setItem(USER_KEY, JSON.stringify(updatedUser));
        setShowRegister(false);
        return updatedUser;
    }, []);

    const logout = useCallback(() => {
        localStorage.removeItem(JWT_KEY);
        localStorage.removeItem(USER_KEY);
        setToken(null);
        setUser(null);
        setShowRegister(false);
        if (disconnect) { try { disconnect(); } catch { /* ignore */ } }
    }, [disconnect]);

    const value = { user, token, isAuthenticated, isLoading, showRegister, setShowRegister, login, register, logout, isCorrectNetwork, switchNetwork: () => switchChain(polygonAmoy) };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
    return ctx;
}
