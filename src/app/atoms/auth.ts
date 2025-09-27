// lib/auth-store.ts
import { atom } from "jotai";

export interface User {
    id: number;
    walletAddress: string;
    userType: "renter" | "owner";
    verified: boolean;
    name: string;
}

// Auth atoms
export const authTokenAtom = atom<string | null>(null);
export const userAtom = atom<User | null>(null);
export const isAuthenticatedAtom = atom<boolean>(false);

// Auth actions
export const setAuthDataAtom = atom(
    null,
    (get, set, { token, user }: { token: string; user: User }) => {
        set(authTokenAtom, token);
        set(userAtom, user);
        set(isAuthenticatedAtom, true);

        // Store in localStorage
        localStorage.setItem("yesbroker_token", token);
        localStorage.setItem("yesbroker_user", JSON.stringify(user));
    }
);

export const clearAuthAtom = atom(null, (get, set) => {
    set(authTokenAtom, null);
    set(userAtom, null);
    set(isAuthenticatedAtom, false);

    // Clear localStorage
    localStorage.removeItem("yesbroker_token");
    localStorage.removeItem("yesbroker_user");
});

export const initAuthFromStorageAtom = atom(null, (get, set) => {
    try {
        const token = localStorage.getItem("yesbroker_token");
        const userStr = localStorage.getItem("yesbroker_user");

        if (token && userStr) {
            const user = JSON.parse(userStr);
            set(authTokenAtom, token);
            set(userAtom, user);
            set(isAuthenticatedAtom, true);
        }
    } catch (error) {
        console.error("Error loading auth from storage:", error);
        set(clearAuthAtom);
    }
});
