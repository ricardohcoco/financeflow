import { createContext } from "react";
import type { User, LoginResponse } from "../types/auth";

export type AuthContextData = {
    user: User | null;
    token: string | null;
    loading: boolean;
    signIn: (session: LoginResponse) => void;
    signOut: () => void;
    verificationError: boolean;
    retrySession: () => void;
};

export const AuthContext = createContext<AuthContextData | undefined>(undefined);


