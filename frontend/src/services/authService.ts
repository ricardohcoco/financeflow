import { apiRequest } from "./api";
import type { LoginData, LoginResponse, RegisterData, RegisterResponse, User } from "../types/auth";

export function registerUser(
    data: RegisterData
): Promise<RegisterResponse> {
    return apiRequest<RegisterResponse>("/users", {
        method: "POST",
        body: data,
    });
}

export function loginUser(
    data: LoginData
): Promise<LoginResponse> {
    return apiRequest<LoginResponse>("/login", {
        method: "POST",
        body: data,
    });
}

export function getCurrentUser(
    token: string,
    signal?: AbortSignal
): Promise<{ user: User }> {
    return apiRequest<{ user: User }>("/users/me", {
        token,
        signal,
    });
}