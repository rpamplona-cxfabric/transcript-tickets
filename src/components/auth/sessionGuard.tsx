"use client";

import { useEffect } from "react";
import api from "@/lib/axios";
import {
  redirectToSignIn,
  sessionExpiredStorageKey,
} from "@/lib/auth/sessionExpiry";

export const SessionGuard = () => {
  useEffect(() => {
    const checkSession = () => {
      void api.get("/session").catch(() => undefined);
    };
    const handleStorage = (event: StorageEvent) => {
      if (event.key === sessionExpiredStorageKey && event.newValue) {
        redirectToSignIn();
      }
    };
    checkSession();
    window.addEventListener("storage", handleStorage);

    return () => {
      window.removeEventListener("storage", handleStorage);
    };
  }, []);

  return null;
};
