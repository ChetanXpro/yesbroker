"use client";
import React, { useState, useEffect, useCallback, useRef } from "react";
import { SelfQRcodeWrapper, SelfAppBuilder, type SelfApp } from "@selfxyz/qrcode";
import { useAtom } from "jotai";
import { ethers } from "ethers";
import { useRouter } from "next/navigation";
import { setAuthDataAtom } from "@/app/atoms/auth";
import { api } from "@/app/libs/api";

interface VerificationError {
    error_code?: string;
    reason?: string;
}

export default function SelfLogin() {
    // Wallet connection state
    const [walletAddress, setWalletAddress] = useState<string>("");
    const [isWalletConnected, setIsWalletConnected] = useState(false);
    const [walletError, setWalletError] = useState("");

    // User type selection
    const [userType, setUserType] = useState<"renter" | "owner">("renter");

    // Self verification state
    const [selfApp, setSelfApp] = useState<SelfApp | null>(null);
    const [isVerifying, setIsVerifying] = useState(false);
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [verificationComplete, setVerificationComplete] = useState(false);
    const [redirecting, setRedirecting] = useState(false);

    const router = useRouter();
    const successHandled = useRef(false);
    const [, setAuthData] = useAtom(setAuthDataAtom);

    // Check if wallet is already connected on component mount
    useEffect(() => {
        checkWalletConnection();
    }, []);

    // Initialize Self app when wallet is connected
    useEffect(() => {
        if (isWalletConnected && walletAddress) {
            checkVerificationStatus();
        }
    }, [isWalletConnected, walletAddress, userType]);

    const checkVerificationStatus = async () => {
        try {
            setIsLoading(true);

            // Try the existing session endpoint
            const response = await api.login(walletAddress);

            if (response.success) {
                // User exists and is verified - set auth and redirect
                setAuthData({
                    token: response.data.token,
                    user: response.data.user,
                });

                // Redirect to appropriate page
                const redirectTo = response.data.redirect || "/dashboard";
                setTimeout(() => {
                    router.push(redirectTo);
                }, 1000);

                setVerificationComplete(true);
                setRedirecting(true);
                return;
            } else {
                // User doesn't exist or not verified - show QR code
                console.log("User not found or not verified:", response.error);
                initializeSelfApp();
            }
        } catch (error) {
            console.error("Error checking verification:", error);
            // User doesn't exist or not verified - show QR code
            initializeSelfApp();
        } finally {
            setIsLoading(false);
        }
    };

    const checkWalletConnection = async () => {
        if (typeof window !== "undefined" && (window as any).ethereum) {
            try {
                // First check if accounts are already connected
                const accounts = await (window as any).ethereum.request({
                    method: "eth_accounts",
                });

                if (accounts.length > 0) {
                    setWalletAddress(accounts[0]);
                    setIsWalletConnected(true);
                    return;
                }

                // If no accounts found, try to reconnect if user previously connected
                const wasConnected = localStorage.getItem("wallet_was_connected");
                if (wasConnected === "true") {
                    try {
                        // Attempt to request accounts (this will prompt if needed)
                        const requestedAccounts = await (window as any).ethereum.request({
                            method: "eth_requestAccounts",
                        });

                        if (requestedAccounts.length > 0) {
                            setWalletAddress(requestedAccounts[0]);
                            setIsWalletConnected(true);
                        }
                    } catch (error) {
                        // User denied connection, clear the flag
                        localStorage.removeItem("wallet_was_connected");
                        console.log("User denied wallet connection");
                    }
                }
            } catch (error) {
                console.error("Error checking wallet connection:", error);
            }
        }
    };

    const connectWallet = async () => {
        if (typeof window === "undefined" || !(window as any).ethereum) {
            setWalletError("MetaMask is not installed. Please install MetaMask to continue.");
            return;
        }

        try {
            setWalletError("");

            // Request account access
            const accounts = await (window as any).ethereum.request({
                method: "eth_requestAccounts",
            });

            if (accounts.length > 0) {
                setWalletAddress(accounts[0]);
                setIsWalletConnected(true);

                // Store flag to remember user connected wallet
                localStorage.setItem("wallet_was_connected", "true");

                // Listen for account changes
                (window as any).ethereum.on("accountsChanged", (accounts: string[]) => {
                    if (accounts.length > 0) {
                        setWalletAddress(accounts[0]);
                        setIsWalletConnected(true);
                        setSelfApp(null);
                    } else {
                        setWalletAddress("");
                        setIsWalletConnected(false);
                        setSelfApp(null);
                        // Clear the connection flag when wallet is disconnected
                        localStorage.removeItem("wallet_was_connected");
                    }
                });
            }
        } catch (error: any) {
            console.error("Wallet connection error:", error);
            setWalletError(error.message || "Failed to connect wallet");
        }
    };

    const disconnectWallet = () => {
        setWalletAddress("");
        setIsWalletConnected(false);
        setSelfApp(null);
        setVerificationComplete(false);
        setRedirecting(false);
        successHandled.current = false;

        // Clear the wallet connection persistence flag
        localStorage.removeItem("wallet_was_connected");
    };

    const initializeSelfApp = async () => {
        try {
            setIsLoading(true);
            setError("");

            const app = new SelfAppBuilder({
                version: 2,
                appName: "YesBroker",
                scope: "self-workshop",
                endpoint: `https://crafts-checking-bridal-camcorders.trycloudflare.com/api/verify`,
                logoBase64: "https://i.postimg.cc/mrmVf9hm/self.png",
                userId: walletAddress,
                endpointType: "https",
                userIdType: "hex",
                userDefinedData: userType,
                disclosures: {
                    minimumAge: 18,
                    nationality: true,
                },
            }).build();

            console.log("Self app initialized with wallet:", walletAddress);
            setSelfApp(app);
        } catch (error) {
            console.error("Failed to initialize Self app:", error);
            setError("Failed to initialize verification system");
        } finally {
            setIsLoading(false);
        }
    };

    // Handle successful Self verification
    const handleSelfSuccess = useCallback(async () => {
        console.log("Self verification successful for wallet:", walletAddress);

        if (successHandled.current) {
            console.log("Success already handled, ignoring duplicate call");
            return;
        }

        successHandled.current = true;
        setIsVerifying(true);

        try {
            // Call auth session API to get JWT token
            const authResponse = await fetch("/api/auth/session", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    walletAddress: walletAddress,
                }),
            });

            const authData = await authResponse.json();

            if (authData.success) {
                // Update Jotai atoms with auth data
                setAuthData({
                    token: authData.token,
                    user: authData.user,
                });

                // Use redirect from auth response
                const redirectTo = authData.redirect || "/dashboard";

                setTimeout(() => {
                    handleSuccess(redirectTo);
                }, 500); // Wait 500ms for atoms to update
            } else {
                console.error("Auth session failed:", authData.error);
                setError("Failed to create session. Please try again.");
                setIsVerifying(false);
            }
        } catch (authError) {
            console.error("Auth session request failed:", authError);
            setError("Network error. Please try again.");
            setIsVerifying(false);
        }
    }, [walletAddress, setAuthData]);

    const handleSuccess = useCallback(
        (redirectTo: string = "/dashboard") => {
            console.log("Redirecting to:", redirectTo);

            setIsVerifying(false);
            setError("");
            setVerificationComplete(true);
            setRedirecting(true);

            setTimeout(() => {
                router.push(redirectTo);
            }, 1500);
        },
        [router]
    );

    const handleError = useCallback((errorData: VerificationError) => {
        console.error("Verification error:", errorData);
        let errorMessage = "Verification failed. Please try again.";

        if (errorData?.error_code) {
            switch (errorData.error_code) {
                case "VERIFICATION_FAILED":
                    errorMessage = "Identity verification failed. Please check your documents.";
                    break;
                case "NETWORK_ERROR":
                    errorMessage = "Network error. Please check your connection.";
                    break;
                case "TIMEOUT":
                    errorMessage = "Verification timed out. Please try again.";
                    break;
                default:
                    errorMessage = errorData.reason || errorMessage;
            }
        }

        setError(errorMessage);
        setIsVerifying(false);
        successHandled.current = false;
    }, []);

    const handleRetry = useCallback(() => {
        setError("");
        setIsVerifying(false);
        setVerificationComplete(false);
        setRedirecting(false);
        successHandled.current = false;
        setSelfApp(null);

        if (isWalletConnected && walletAddress) {
            initializeSelfApp();
        }
    }, [isWalletConnected, walletAddress]);

    // Wallet connection UI
    if (!isWalletConnected) {
        return (
            <div className="bg-white rounded-xl shadow-lg p-6 max-w-md mx-auto">
                <div className="text-center mb-6">
                    <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg
                            className="w-8 h-8 text-indigo-600"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                        >
                            <path
                                fillRule="evenodd"
                                d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z"
                                clipRule="evenodd"
                            />
                        </svg>
                    </div>
                    <h2 className="text-xl font-bold text-gray-900 mb-2">Connect Your Wallet</h2>
                    <p className="text-gray-600 text-sm">
                        Please connect your wallet to proceed with identity verification
                    </p>
                </div>

                {/* User Type Selection */}
                <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-3">I am a:</label>
                    <div className="grid grid-cols-2 gap-3">
                        <button
                            onClick={() => setUserType("renter")}
                            className={`p-3 rounded-lg border-2 transition-colors text-sm font-medium ${
                                userType === "renter"
                                    ? "border-indigo-600 bg-indigo-50 text-indigo-700"
                                    : "border-gray-300 bg-white text-gray-700 hover:border-gray-400"
                            }`}
                        >
                            Renter
                        </button>
                        <button
                            onClick={() => setUserType("owner")}
                            className={`p-3 rounded-lg border-2 transition-colors text-sm font-medium ${
                                userType === "owner"
                                    ? "border-indigo-600 bg-indigo-50 text-indigo-700"
                                    : "border-gray-300 bg-white text-gray-700 hover:border-gray-400"
                            }`}
                        >
                            Property Owner
                        </button>
                    </div>
                </div>

                {walletError && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                        <div className="flex items-center">
                            <svg
                                className="w-4 h-4 text-red-400 mr-2"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                            >
                                <path
                                    fillRule="evenodd"
                                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                                    clipRule="evenodd"
                                />
                            </svg>
                            <p className="text-red-800 text-sm">{walletError}</p>
                        </div>
                    </div>
                )}

                <button
                    onClick={connectWallet}
                    className="w-full bg-indigo-600 text-white px-4 py-3 rounded-lg hover:bg-indigo-700 transition-colors font-medium"
                >
                    Connect MetaMask
                </button>

                <div className="text-center mt-4">
                    <p className="text-xs text-gray-500">
                        Dont have MetaMask?
                        <a
                            href="https://metamask.io/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-indigo-600 hover:text-indigo-700 ml-1"
                        >
                            Download here
                        </a>
                    </p>
                </div>
            </div>
        );
    }

    // Loading state
    if (isLoading) {
        return (
            <div className="bg-white rounded-xl shadow-lg p-6 max-w-md mx-auto text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
                <p className="text-gray-600 text-sm mt-4">
                    {isWalletConnected
                        ? "Checking verification status..."
                        : "Loading verification system..."}
                </p>
            </div>
        );
    }

    // Success state
    if (verificationComplete || redirecting) {
        return (
            <div className="bg-white rounded-xl shadow-lg p-6 max-w-md mx-auto text-center">
                <div className="text-green-500 mb-4">
                    <svg className="w-16 h-16 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                        <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                            clipRule="evenodd"
                        />
                    </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    Verification Successful!
                </h3>
                <p className="text-gray-600 text-sm mb-2">
                    Your identity has been verified as a {userType} for wallet:
                </p>
                <p className="text-xs text-gray-500 font-mono bg-gray-50 p-2 rounded mb-4">
                    {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
                </p>
                <p className="text-gray-600 text-sm mb-4">Redirecting...</p>
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600 mx-auto"></div>
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <div className="bg-white rounded-xl shadow-lg p-6 max-w-md mx-auto text-center">
                <div className="text-red-500 mb-4">
                    <svg className="w-12 h-12 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                        <path
                            fillRule="evenodd"
                            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                            clipRule="evenodd"
                        />
                    </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Verification Error</h3>
                <p className="text-gray-600 text-sm mb-4">{error}</p>
                <div className="space-y-2">
                    <button
                        onClick={handleRetry}
                        className="w-full bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
                    >
                        Try Again
                    </button>
                    <button
                        onClick={disconnectWallet}
                        className="w-full bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors"
                    >
                        Disconnect Wallet
                    </button>
                </div>
            </div>
        );
    }

    // QR Code display
    return (
        <div className="bg-white rounded-xl shadow-lg p-6 max-w-md mx-auto">
            {/* Wallet info header */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center">
                        <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                        <span className="text-green-800 text-sm font-medium">Wallet Connected</span>
                    </div>
                    <button
                        onClick={disconnectWallet}
                        className="text-green-600 hover:text-green-700 text-sm"
                    >
                        Disconnect
                    </button>
                </div>
                <p className="text-xs text-green-700 font-mono mt-1">
                    {walletAddress.slice(0, 10)}...{walletAddress.slice(-8)}
                </p>
                <p className="text-xs text-green-700 mt-1">
                    Signing up as: <span className="font-medium">{userType}</span>
                </p>
            </div>

            <div className="text-center mb-6">
                <h2 className="text-xl font-bold text-gray-900 mb-2">Identity Verification</h2>
                <p className="text-gray-600 text-sm">
                    Scan the QR code with the Self app to verify your identity
                </p>
            </div>

            {selfApp ? (
                <div className="space-y-4">
                    <ErrorBoundary onError={() => setError("QR component failed to load")}>
                        <SelfQRcodeWrapper
                            selfApp={selfApp}
                            onSuccess={handleSelfSuccess}
                            onError={handleError}
                        />
                    </ErrorBoundary>

                    {isVerifying && (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
                            <div className="flex items-center justify-center space-x-2">
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                                <span className="text-blue-800 text-sm">
                                    Verifying your identity...
                                </span>
                            </div>
                        </div>
                    )}

                    <div className="text-center space-y-2">
                        <p className="text-xs text-gray-500">
                            Dont have the Self app?
                            <a
                                href="https://www.self.xyz"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-indigo-600 hover:text-indigo-700 ml-1"
                            >
                                Download here
                            </a>
                        </p>
                        <div className="text-xs text-gray-400">
                            Secure identity verification powered by Self Protocol
                        </div>
                    </div>
                </div>
            ) : (
                <div className="text-center p-8 text-gray-500">
                    <div className="animate-pulse">
                        <div className="h-64 w-64 bg-gray-200 rounded-lg mx-auto mb-4"></div>
                        <p>Loading verification...</p>
                    </div>
                </div>
            )}
        </div>
    );
}

// Error boundary component
class ErrorBoundary extends React.Component<
    { children: React.ReactNode; onError: () => void },
    { hasError: boolean }
> {
    constructor(props: any) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(error: Error) {
        return { hasError: true };
    }

    componentDidCatch(error: Error, errorInfo: any) {
        console.error("QR Component Error Caught:", error, errorInfo);
        this.props.onError();
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="text-center p-8 border-2 border-dashed border-gray-300 rounded-lg">
                    <div className="text-gray-500 mb-4">
                        <svg className="w-12 h-12 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                            <path
                                fillRule="evenodd"
                                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                                clipRule="evenodd"
                            />
                        </svg>
                    </div>
                    <p className="text-gray-600 text-sm">QR component encountered an error.</p>
                </div>
            );
        }

        return this.props.children;
    }
}
