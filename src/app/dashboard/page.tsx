"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface UserData {
  userId: string;
  verified: boolean;
  userType?: string;
  nationality?: string;
}

export default function Dashboard() {
  const [user, setUser] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSelecting, setIsSelecting] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = () => {
      try {
        const token = getCookie("yesbroker_token");
        if (!token) {
          router.push("/");
          return;
        }

        // Decode JWT token
        const payload = JSON.parse(atob(token.split(".")[1]));

        // Check if token is expired
        if (payload.exp && payload.exp < Date.now() / 1000) {
          router.push("/");
          return;
        }

        setUser(payload);

        // If user already has a type, redirect to their dashboard
        if (payload.userType) {
          router.push(`/${payload.userType}/dashboard`);
          return;
        }
      } catch (error) {
        console.error("Auth check failed:", error);
        router.push("/");
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  const selectUserType = async (userType: "owner" | "renter") => {
    setIsSelecting(true);

    try {
      const response = await fetch("/api/update-user-type", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userType }),
      });

      if (response.ok) {
        const data = await response.json();

        // Update local state
        setUser({ ...user!, userType });

        // Redirect to the appropriate dashboard
        router.push(`/${userType}/dashboard`);
      } else {
        console.error("Failed to update user type");
        alert("Failed to update user type. Please try again.");
      }
    } catch (error) {
      console.error("Error updating user type:", error);
      alert("An error occurred. Please try again.");
    } finally {
      setIsSelecting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md mx-auto text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="text-gray-600 text-sm mt-4">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-lg p-8 max-w-lg mx-auto">
        <div className="text-center mb-8">
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
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Welcome to YesBroker!
          </h2>
          <p className="text-gray-600">
            Your identity has been verified successfully. Please choose how
            you'd like to use the platform:
          </p>
        </div>

        <div className="space-y-4">
          <button
            onClick={() => selectUserType("owner")}
            disabled={isSelecting}
            className="w-full bg-indigo-600 text-white p-6 rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div className="text-left">
              <h3 className="text-lg font-semibold mb-2">Property Owner</h3>
              <p className="text-indigo-100 text-sm">
                List your properties, manage tenants, and collect rent payments
              </p>
            </div>
          </button>

          <button
            onClick={() => selectUserType("renter")}
            disabled={isSelecting}
            className="w-full bg-green-600 text-white p-6 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div className="text-left">
              <h3 className="text-lg font-semibold mb-2">Renter</h3>
              <p className="text-green-100 text-sm">
                Search for properties, apply for rentals, and manage your
                tenancy
              </p>
            </div>
          </button>
        </div>

        {isSelecting && (
          <div className="mt-6 text-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600 mx-auto"></div>
            <p className="text-gray-600 text-sm mt-2">
              Setting up your account...
            </p>
          </div>
        )}

        <div className="mt-8 text-center">
          <p className="text-xs text-gray-500">
            You can change your role later in account settings
          </p>
        </div>
      </div>
    </div>
  );
}

function getCookie(name: string) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(";").shift();
  return null;
}
