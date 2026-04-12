import { createContext, useEffect, useMemo, useState } from "react";
import {
  signInWithPopup,
  signOut,
  updateProfile
} from "firebase/auth";
import api, { registerUnauthorizedHandler } from "../api/api";
import { auth, googleProvider } from "../lib/firebase";

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = async () => {
    const { data } = await api.get("/auth/me", { skipAuthRedirect: true });
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
    const { data } = await api.post("/auth/register", { name, email, password });
    setUser(data.user);
    return data.user;
  };

  const login = async ({ email, password }) => {
    const { data } = await api.post("/auth/login", { email, password });
    setUser(data.user);
    return data.user;
  };

  const loginWithGoogle = async () => {
    const credential = await signInWithPopup(auth, googleProvider);
    if (credential.user?.displayName) {
      try {
        await updateProfile(credential.user, { displayName: credential.user.displayName });
      } catch {
        // Ignore profile sync failure because backend session exchange is the source of truth.
      }
    }
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
      localStorage.removeItem("token");
      setUser(null);
    }
  };

  useEffect(() => {
    registerUnauthorizedHandler(async () => {
      try {
        await signOut(auth);
      } catch {
        // Ignore because server-side session handling is primary.
      }
      setUser(null);
    });

    return () => {
      registerUnauthorizedHandler(null);
    };
  }, []);

  useEffect(() => {
    let active = true;

    const bootstrap = async () => {
      try {
        await refreshUser();
      } catch {
        try {
          await api.post("/auth/refresh", null, { skipAuthRedirect: true });
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
