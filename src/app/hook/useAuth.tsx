"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

// Simple auth check hook
export function useAuth() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = () => {
      try {
        const token = getCookie("yesbroker_token");
        if (token) {
          // Simple decode without verification for client-side
          const payload = JSON.parse(atob(token.split(".")[1]));
          if (payload && payload.userId && payload.exp > Date.now() / 1000) {
            setUser(payload);
          }
        }
      } catch (error) {
        console.error("Auth check failed:", error);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const logout = () => {
    document.cookie =
      "yesbroker_token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;";
    setUser(null);
    window.location.reload();
  };

  return { user, isLoading, logout };
}

function getCookie(name: string) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(";").shift();
  return null;
}
