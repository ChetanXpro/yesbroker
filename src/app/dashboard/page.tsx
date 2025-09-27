"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAtom } from "jotai";
import { isAuthenticatedAtom, userAtom } from "@/app/atoms/auth";
import OwnerDashboard from "@/app/component/OwnerDashboard";
import RenterDashboard from "@/app/component/RenterDashboard";

export default function Dashboard() {
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    const [user] = useAtom(userAtom);
    const [isAuthenticated] = useAtom(isAuthenticatedAtom);

    useEffect(() => {
        // Check authentication and redirect if needed
        const checkAuth = async () => {
            // Wait a bit for AuthProvider to load from localStorage
            await new Promise((resolve) => setTimeout(resolve, 100));

            if (!isAuthenticated) {
                router.push("/auth");
                return;
            }

            setIsLoading(false);
        };

        checkAuth();
    }, [isAuthenticated, router]);

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-xl shadow-lg p-8 max-w-lg mx-auto text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {user?.userType === "owner" ? <OwnerDashboard /> : <RenterDashboard />}
            </div>
        </div>
    );
}
