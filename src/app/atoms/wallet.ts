// lib/wallet-store.ts
import { atom } from "jotai";

export const walletAddressAtom = atom<string>("");
export const isWalletConnectedAtom = atom<boolean>(false);
export const walletErrorAtom = atom<string>("");

// Derived atom for checking if wallet was previously connected
export const walletWasConnectedAtom = atom<boolean>(false);

// Actions
export const connectWalletAtom = atom(null, async (get, set) => {
    if (typeof window === "undefined" || !(window as any).ethereum) {
        set(walletErrorAtom, "MetaMask is not installed. Please install MetaMask to continue.");
        return false;
    }

    try {
        set(walletErrorAtom, "");

        const accounts = await (window as any).ethereum.request({
            method: "eth_requestAccounts",
        });

        if (accounts.length > 0) {
            set(walletAddressAtom, accounts[0]);
            set(isWalletConnectedAtom, true);
            localStorage.setItem("wallet_was_connected", "true");
            return true;
        }
        return false;
    } catch (error: any) {
        console.error("Wallet connection error:", error);
        set(walletErrorAtom, error.message || "Failed to connect wallet");
        return false;
    }
});

export const disconnectWalletAtom = atom(null, (get, set) => {
    set(walletAddressAtom, "");
    set(isWalletConnectedAtom, false);
    set(walletErrorAtom, "");
    localStorage.removeItem("wallet_was_connected");
});

export const checkWalletConnectionAtom = atom(null, async (get, set) => {
    if (typeof window === "undefined" || !(window as any).ethereum) {
        return;
    }

    try {
        // Check if accounts are already connected
        const accounts = await (window as any).ethereum.request({
            method: "eth_accounts",
        });

        if (accounts.length > 0) {
            set(walletAddressAtom, accounts[0]);
            set(isWalletConnectedAtom, true);
            return;
        }

        // Check if user previously connected
        const wasConnected = localStorage.getItem("wallet_was_connected");
        if (wasConnected === "true") {
            set(walletWasConnectedAtom, true);
            // Optionally auto-reconnect or just show reconnect option
            // For better UX, just set the flag and let user manually reconnect
        }
    } catch (error) {
        console.error("Error checking wallet connection:", error);
    }
});
