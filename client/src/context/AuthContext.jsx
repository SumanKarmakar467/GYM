import { createContext, useEffect, useMemo, useState } from "react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile
} from "firebase/auth";
import api from "../api/api";
import { auth, googleProvider } from "../lib/firebase";

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = async () => {
    const { data } = await api.get("/auth/me");
    setUser(data.user);
    return data.user;
  };

  const exchangeFirebaseSession = async (firebaseUser) => {
    const idToken = await firebaseUser.getIdToken();
    const { data } = await api.post("/auth/firebase", { idToken });
    setUser(data.user);
    return data.user;
  };

  const register = async ({ name, email, password }) => {
    const credential = await createUserWithEmailAndPassword(auth, email, password);

    try {
      if (name) {
        await updateProfile(credential.user, { displayName: name });
      }

      return exchangeFirebaseSession(credential.user);
    } catch (error) {
      try {
        await credential.user.delete();
      } catch {
        // Keep original error because session exchange failure is more actionable.
      }

      throw error;
    }
  };

  const login = async ({ email, password }) => {
    const credential = await signInWithEmailAndPassword(auth, email, password);
    return exchangeFirebaseSession(credential.user);
  };

  const loginWithGoogle = async () => {
    const credential = await signInWithPopup(auth, googleProvider);
    return exchangeFirebaseSession(credential.user);
  };

  const loginAsAdmin = async ({ email, password }) => {
    const { data } = await api.post("/auth/admin-login", { email, password });
    setUser(data.user);
    return data.user;
  };

  const logout = async () => {
    try {
      await api.post("/auth/logout");
    } finally {
      await signOut(auth);
      setUser(null);
    }
  };

  useEffect(() => {
    let active = true;

    const bootstrap = async () => {
      try {
        await refreshUser();
      } catch {
        try {
          await api.post("/auth/refresh");
          await refreshUser();
        } catch {
          const firebaseUser = auth.currentUser;

          if (firebaseUser) {
            try {
              await exchangeFirebaseSession(firebaseUser);
            } catch {
              setUser(null);
            }
          } else {
            setUser(null);
          }
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    bootstrap();

    return () => {
      active = false;
    };
  }, []);

  const value = useMemo(
    () => ({ user, loading, register, login, loginAsAdmin, loginWithGoogle, logout, refreshUser, setUser }),
    [user, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
