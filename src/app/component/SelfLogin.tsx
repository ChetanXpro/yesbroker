"use client";
import React, { useState, useEffect, useCallback, useRef } from "react";
import { getUniversalLink } from "@selfxyz/core";
import {
  SelfQRcodeWrapper,
  SelfAppBuilder,
  type SelfApp,
} from "@selfxyz/qrcode";
import { ethers } from "ethers";
import { useRouter } from "next/navigation";

interface VerificationError {
  error_code?: string;
  reason?: string;
}

export default function SelfLogin() {
  const [selfApp, setSelfApp] = useState<SelfApp | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState("");
  const [userId] = useState(ethers.ZeroAddress);
  const [isLoading, setIsLoading] = useState(true);
  const [verificationComplete, setVerificationComplete] = useState(false);
  const [redirecting, setRedirecting] = useState(false);
  const router = useRouter();
  const successHandled = useRef(false);

  useEffect(() => {
    const initializeSelfApp = async () => {
      try {
        setIsLoading(true);

        const app = new SelfAppBuilder({
          version: 2,
          appName: "YesBroker",
          scope: "self-workshop",
          endpoint: `https://indirect-garbage-edmonton-disco.trycloudflare.com/api/verify`,
          logoBase64: "https://i.postimg.cc/mrmVf9hm/self.png",
          userId: userId,
          endpointType: "https",
          userIdType: "hex",
          userDefinedData: "Hello World",
          disclosures: {
            minimumAge: 18,
            nationality: true,
          },
        }).build();

        console.log("app", app);
        setSelfApp(app);
        setError("");
      } catch (error) {
        console.error("Failed to initialize Self app:", error);
        setError("Failed to initialize verification system");
      } finally {
        setIsLoading(false);
      }
    };

    initializeSelfApp();
  }, [userId]);

  // Enhanced success handler to prevent race conditions
  const handleSuccess = useCallback(() => {
    console.log("Verification successful!");

    // Prevent multiple calls
    if (successHandled.current) {
      console.log("Success already handled, ignoring duplicate call");
      return;
    }

    successHandled.current = true;
    setIsVerifying(false);
    setError("");
    setVerificationComplete(true);
    setRedirecting(true);

    // Immediate redirect to prevent component re-render issues
    setTimeout(() => {
      router.push("/dashboard");
    }, 100); // Very short delay
  }, [router]);

  const handleError = useCallback((errorData: VerificationError) => {
    console.error("Verification error:", errorData);

    let errorMessage = "Verification failed. Please try again.";

    if (errorData?.error_code) {
      switch (errorData.error_code) {
        case "VERIFICATION_FAILED":
          errorMessage =
            "Identity verification failed. Please check your documents.";
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
  }, []);

  const handleRetry = useCallback(() => {
    setError("");
    setIsVerifying(false);
    setVerificationComplete(false);
    setRedirecting(false);
    successHandled.current = false;
    window.location.reload();
  }, []);

  // Listen for websocket events to catch success early
  useEffect(() => {
    const handleWebSocketMessage = (event: any) => {
      if (event.detail?.status === "proof_verified") {
        console.log("Caught proof_verified event, triggering success handler");
        handleSuccess();
      }
    };

    // Listen for custom events that might be dispatched
    window.addEventListener(
      "self-verification-success",
      handleWebSocketMessage
    );

    return () => {
      window.removeEventListener(
        "self-verification-success",
        handleWebSocketMessage
      );
    };
  }, [handleSuccess]);

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6 max-w-md mx-auto text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
        <p className="text-gray-600 text-sm mt-4">
          Loading verification system...
        </p>
      </div>
    );
  }

  // Show success/redirecting state immediately
  if (verificationComplete || redirecting) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6 max-w-md mx-auto text-center">
        <div className="text-green-500 mb-4">
          <svg
            className="w-16 h-16 mx-auto"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
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
        <p className="text-gray-600 text-sm mb-4">
          Your identity has been verified. Redirecting to dashboard...
        </p>
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600 mx-auto"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6 max-w-md mx-auto text-center">
        <div className="text-red-500 mb-4">
          <svg
            className="w-12 h-12 mx-auto"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Verification Error
        </h3>
        <p className="text-gray-600 text-sm mb-4">{error}</p>
        <button
          onClick={handleRetry}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 max-w-md mx-auto">
      <div className="text-center mb-6">
        <h2 className="text-xl font-bold text-gray-900 mb-2">
          Identity Verification
        </h2>
        <p className="text-gray-600 text-sm">
          Scan the QR code with the Self app to verify your identity
        </p>
      </div>

      {selfApp ? (
        <div className="space-y-4">
          {/* Wrap in error boundary to catch any rendering issues */}
          <ErrorBoundary
            onError={() => setError("QR component failed to load")}
          >
            <SelfQRcodeWrapper
              selfApp={selfApp}
              onSuccess={handleSuccess}
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
              Don't have the Self app?
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

// Simple error boundary component
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
            <svg
              className="w-12 h-12 mx-auto"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <p className="text-gray-600 text-sm">
            QR component encountered an error.
          </p>
        </div>
      );
    }

    return this.props.children;
  }
}
