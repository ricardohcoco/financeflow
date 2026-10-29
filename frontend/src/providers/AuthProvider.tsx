import { useEffect, useState, useCallback } from "react";
import type { ReactNode } from "react";
import type { LoginResponse, User } from "../types/auth";
import { getCurrentUser } from "../services/authService";
import { ApiError } from "../services/ApiError";
import { AuthContext } from "../contexts/AuthContext";

const TOKEN_KEY = "financeflow_token";

type AuthProviderProps = {
  children: ReactNode;
};

export default function AuthProvider({ children }: AuthProviderProps) {
  const [token, setToken] = useState<string | null>(() =>
    sessionStorage.getItem(TOKEN_KEY),
  );

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(Boolean(token));
  const [verificationError, setVerificationError] = useState(false);
  const [retry, setRetry] = useState(0);

  const signIn = useCallback((session: LoginResponse) => {
    sessionStorage.setItem(TOKEN_KEY, session.token);

    setToken(session.token);
    setUser(session.user);
    setVerificationError(false);
    setLoading(false);
  }, []);

  const signOut = useCallback(() => {
    sessionStorage.removeItem(TOKEN_KEY);

    setToken(null);
    setUser(null);
    setVerificationError(false);
    setLoading(false);
  }, []);

  const retrySession = useCallback(() => {
    setVerificationError(false);
    setLoading(true);
    setRetry((previous) => previous + 1);
  }, []);

  useEffect(() => {
    if (!token || user) return;

    const controller = new AbortController();

    async function restoreSession(authToken: string) {
      try {
        const response = await getCurrentUser(
          authToken,
          controller.signal,
        );

        if (controller.signal.aborted) return;

        setUser(response.user);
        setVerificationError(false);
        
      } catch (error) {
        if (controller.signal.aborted) return;

        if (error instanceof ApiError && error.status === 401) {
          signOut();
          return;
        }

        setVerificationError(true);
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    void restoreSession(token);

    return () => 
      controller.abort();
    }, [token, user, retry, signOut]);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        verificationError,
        signIn,
        signOut,
        retrySession
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
