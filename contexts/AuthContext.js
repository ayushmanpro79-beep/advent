"use client";

import { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import { onAuthStateChanged, signInWithPopup, signOut } from "firebase/auth";
import { authedFetch } from "@/lib/http";
import { getClientAuth, googleProvider, hasFirebaseConfig } from "@/lib/firebase/client";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [character, setCharacter] = useState(null);
  const [loading, setLoading] = useState(true);
  const firebaseReady = hasFirebaseConfig();
  const profileUnsubRef = useRef(null);
  const characterUnsubRef = useRef(null);

  useEffect(() => {
    if (!firebaseReady) {
      setProfile(null);
      setCharacter(null);
      setLoading(false);
      return undefined;
    }

    const auth = getClientAuth();
    const authUnsub = onAuthStateChanged(auth, async (nextUser) => {
      profileUnsubRef.current?.();
      characterUnsubRef.current?.();
      setUser(nextUser);
      if (!nextUser) {
        setProfile(null);
        setCharacter(null);
        setLoading(false);
        return;
      }

      try {
        const result = await authedFetch("/api/auth/session", { user: nextUser });
        setProfile(
          result.profile || {
            uid: nextUser.uid,
            email: nextUser.email || "",
            displayName: nextUser.displayName || nextUser.email || "Adventurer",
            photoURL: nextUser.photoURL || "",
            hasCharacter: Boolean(result.character),
          },
        );
        setCharacter(result.character || null);
        setLoading(false);
      } catch {
        setProfile({
          uid: nextUser.uid,
          email: nextUser.email || "",
          displayName: nextUser.displayName || nextUser.email || "Adventurer",
          photoURL: nextUser.photoURL || "",
          hasCharacter: false,
        });
        setCharacter(null);
        setLoading(false);
      }
    });

    return () => {
      authUnsub();
      profileUnsubRef.current?.();
      characterUnsubRef.current?.();
    };
  }, [firebaseReady]);

  async function login() {
    if (!firebaseReady) return null;
    return signInWithPopup(getClientAuth(), googleProvider);
  }

  async function logout() {
    if (!firebaseReady) return;
    await signOut(getClientAuth());
  }

  const value = useMemo(
    () => ({ user, profile, character, loading, firebaseReady, login, logout }),
    [user, profile, character, loading, firebaseReady],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error("useAuth must be used inside AuthProvider.");
  return value;
}
