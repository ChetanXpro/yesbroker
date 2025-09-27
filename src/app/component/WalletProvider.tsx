// components/WalletProvider.tsx
"use client";

import { useEffect } from "react";
import { useAtom } from "jotai";
import {
    checkWalletConnectionAtom,
    disconnectWalletAtom,
    isWalletConnectedAtom,
    walletAddressAtom,
} from "@/app/atoms/wallet";

export default function WalletProvider({ children }: { children: React.ReactNode }) {
    const [, checkWalletConnection] = useAtom(checkWalletConnectionAtom);
    const [walletAddress, setWalletAddress] = useAtom(walletAddressAtom);
    const [isWalletConnected, setIsWalletConnected] = useAtom(isWalletConnectedAtom);
    const [, disconnectWallet] = useAtom(disconnectWalletAtom);

    useEffect(() => {
        // Check wallet connection on mount
        checkWalletConnection();

        // Setup MetaMask event listeners
        if (typeof window !== "undefined" && (window as any).ethereum) {
            const handleAccountsChanged = (accounts: string[]) => {
                if (accounts.length > 0) {
                    setWalletAddress(accounts[0]);
                    setIsWalletConnected(true);
                } else {
                    disconnectWallet();
                }
            };

            const handleChainChanged = () => {
                // Reload the page when chain changes
                window.location.reload();
            };

            const handleDisconnect = () => {
                disconnectWallet();
            };

            // Add event listeners
            (window as any).ethereum.on("accountsChanged", handleAccountsChanged);
            (window as any).ethereum.on("chainChanged", handleChainChanged);
            (window as any).ethereum.on("disconnect", handleDisconnect);

            // Cleanup event listeners
            return () => {
                if ((window as any).ethereum?.removeListener) {
                    (window as any).ethereum.removeListener(
                        "accountsChanged",
                        handleAccountsChanged
                    );
                    (window as any).ethereum.removeListener("chainChanged", handleChainChanged);
                    (window as any).ethereum.removeListener("disconnect", handleDisconnect);
                }
            };
        }
    }, [checkWalletConnection, setWalletAddress, setIsWalletConnected, disconnectWallet]);

    return <>{children}</>;
}
