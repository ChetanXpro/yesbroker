"use client";

import { useEffect } from "react";
import { useAtom } from "jotai";
import { initAuthFromStorageAtom } from "@/app/atoms/auth";

export default function AuthProvider({ children }: { children: React.ReactNode }) {
    const [, initAuth] = useAtom(initAuthFromStorageAtom);

    useEffect(() => {
        // Initialize auth from localStorage on mount
        initAuth();
    }, [initAuth]);

    return <>{children}</>;
}
