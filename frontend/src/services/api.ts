import { ApiError } from "./ApiError";

const API_URL = import.meta.env.VITE_API_URL;

type RequestOptions = {
  method?: "GET" | "POST" | "PUT" | "DELETE";
  body?: unknown;
  token?: string;
  signal?: AbortSignal;
};

export async function apiRequest<T>(
  endpoint: string,
  options: RequestOptions = {},
): Promise<T> {
  const { method = "GET", body, token, signal } = options;

  const headers: Record<string, string> = {};

  if (body !== undefined) {
    headers["Content-Type"] = "application/json";
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  let response: Response;

  try {
    response = await fetch(`${API_URL}${endpoint}`, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
      signal,
    });
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      throw error;
    }

    throw new Error("Não foi possível conectar à API. Verifique sua conexão.", {
      cause: error,
    });
  }

  if (response.status === 204) {
    return undefined as T;
  }

  const contentType = response.headers.get("content-type");

  let data: unknown;

  try {
    data = contentType?.includes("application/json")
      ? await response.json()
      : await response.text();
  } catch (error) {
    throw new Error("A API retornou uma resposta inválida.", { cause: error });
  }

  if (!response.ok) {
    let message = "Ocorreu um erro na requisição.";

    if (
      typeof data === "object" &&
      data !== null &&
      "message" in data &&
      typeof data.message === "string"
    ) {
      message = data.message;
    }

    throw new ApiError(response.status, message);
  }

  return data as T;
}
