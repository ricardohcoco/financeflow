import { afterEach, describe, expect, it, vi } from "vitest";
import { apiRequest } from "./api";
import { ApiError } from "./ApiError";

function jsonResponse(
    data: unknown,
    status = 200
): Response {
    return new Response(JSON.stringify(data), {
        status,
        headers: {
            "Content-Type": "application/json",
        },
    });
}

afterEach(() => {
    vi.unstubAllGlobals();
});

describe("apiRequest", () => {
    it("retorn os dados quando a API responde 200", async () => {
        const data = {
            message: "API funcionando",
        };

        const fetchMock = vi.fn().mockResolvedValue(
            jsonResponse(data)
        );

        vi.stubGlobal("fetch", fetchMock);

        const result = await apiRequest<typeof data>("/health");

        expect(result).toEqual(data);
        expect(fetchMock).toHaveBeenCalledOnce();
    });

    it("lança ApiError quando recebe HTTP 401", async () => {
        vi.stubGlobal(
            "fetch",
            vi.fn().mockResolvedValue(
                jsonResponse(
                    { message: "Token inválido." },
                    401
                )
            )
        );

        const request = apiRequest("/users/me");

        await expect(request).rejects.toMatchObject({
            name: "ApiError",
            status: 401,
            message: "Token inválido.",
        });
    });

    it("lnaça ApiError quando recebe HTTP 503", async () => {
        vi.stubGlobal(
            "fetch",
            vi.fn().mockResolvedValue(
                jsonResponse(
                    { message: "Banco indisponível." },
                    503
                )
            )
        );

        await expect(
            apiRequest("/health/db")
        ).rejects.toMatchObject({
            name: "ApiError",
            status: 503,
            message: "Banco indisponível.",
        });
    });

    it("retorna undefined para HTTP 204", async () => {
        const fetchMock = vi.fn().mockResolvedValue(
            new Response(null, { status: 204 })
        );

        vi.stubGlobal("fetch", fetchMock);

        const result = await apiRequest<void>(
            "/transactions/1",
            { method: "DELETE" }
        );

        expect(result).toBeUndefined();
    });

    it("envia método POST e corpo JSON corretamente", async () => {
        const fetchMock = vi.fn().mockResolvedValue(
            jsonResponse({ message: "Criado." }, 201)
        );

        vi.stubGlobal("fetch", fetchMock);

        const body = {
            description: "Supermercado",
            amount: "150.50",
            type: "despesa",
            category_id: 5,
            date: "206-10-29",
        };

        await apiRequest("/transactions", {
            method: "POST",
            body,
        });

        expect(fetchMock).toHaveBeenCalledWith(
            expect.stringContaining("/transactions"),
            expect.objectContaining({
                method: "POST",
                body: JSON.stringify(body),
                headers: expect.objectContaining({
                    "Content-Type": "application/json",
                }),
            })
        );
    });

    it("envia o JWT no cabeçalho Authorization", async () => {
        const fetchMock = vi.fn().mockResolvedValue(
            jsonResponse({ transactions: [] })
        );

        vi.stubGlobal("fetch", fetchMock);

        await apiRequest("/transactions", {
            token: "token-ficticio-para-teste",
        });

        expect(fetchMock).toHaveBeenCalledWith(
            expect.stringContaining("/transactions"),
            expect.objectContaining({
                headers: expect.objectContaining({
                    Authorization: "Bearer token-ficticio-para-teste",
                }),
            })
        );
    });

    it("trata falha de conexão e preserva a causa", async () => {
        const originalError = new TypeError(
            "Failed to fetch"
        );

        vi.stubGlobal(
            "fetch",
            vi.fn().mockRejectedValue(originalError)
        );

        let receivedError: unknown;

        try {
            await apiRequest("/health");
        } catch (error) {
            receivedError = error;
        }

        expect(receivedError).toBeInstanceOf(Error);
        expect(receivedError).not.toBeInstanceOf(ApiError);
        expect(receivedError).toMatchObject({
            message: 
            "Não foi possível conectar à API. Verifique sua conexão.",
            cause: originalError,
        });
    });

    it("trata uma resposta JSON inválida", async () => {
        vi.stubGlobal(
            "fetch",
            vi.fn().mockResolvedValue(
                new Response("{json inválido", {
                    status: 200,
                    headers: {
                        "Content-Type": "application/json",
                    },
                })
            )
        );

        await expect(
            apiRequest("/health")
        ).rejects.toThrow(
            "A API retornou uma resposta inválida."
        );
    });

    it("usa mensagem genérica quando o erro não tem JSON", async () => {
        vi.stubGlobal(
            "fetch",
            vi.fn().mockResolvedValue(
                new Response("Serviço indisponível", {
                    status: 503,
                    headers: {
                        "Content-Type": "text/plain",
                    },
                })
            )
        );

        await expect(
            apiRequest("/health/db")
        ).rejects.toMatchObject({
            name: "ApiError",
            status: 503,
            message: "Ocorreu um erro na requisição.",
        });
    });
});