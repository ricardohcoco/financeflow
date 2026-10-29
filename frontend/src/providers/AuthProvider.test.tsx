// @vitest-environment jsdom

import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";

import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";

import AuthProvider from "./AuthProvider";
import { useAuth } from "../hooks/useAuth";
import { getCurrentUser } from "../services/authService";
import { ApiError } from "../services/ApiError";

vi.mock("../services/authService", () => ({
  getCurrentUser: vi.fn(),
}));

const mockedGetCurrentUser = vi.mocked(getCurrentUser);

function AuthStatus() {
  const {
    user,
    token,
    loading,
    verificationError,
    retrySession,
    signOut,
  } = useAuth();

  if (loading) {
    return <p>Verificando sessão...</p>;
  }

  return (
    <div>
      <p>Usuário: {user?.name ?? "Nenhum"}</p>
      <p>Token: {token ? "Presente" : "Ausente"}</p>
      <p>
        Erro de verificação: {verificationError ? "Sim" : "Não"}
      </p>

      <button type="button" onClick={retrySession}>
        Tentar novamente
      </button>

      <button type="button" onClick={signOut}>
        Sair
      </button>
    </div>
  );
}

function renderAuthProvider() {
  return render(
    <AuthProvider>
      <AuthStatus />
    </AuthProvider>
  );
}

beforeEach(() => {
  sessionStorage.clear();
  mockedGetCurrentUser.mockReset();
});

afterEach(() => {
  cleanup();
  sessionStorage.clear();
  vi.clearAllMocks();
});

describe("AuthProvider", () => {
  it("recupera o usuário quando o JWT é válido", async () => {
    sessionStorage.setItem(
      "financeflow_token",
      "token-valido-ficticio"
    );

    mockedGetCurrentUser.mockResolvedValue({
      user: {
        id: 1,
        name: "Usuário Teste",
        email: "teste@example.com",
      },
    });

    renderAuthProvider();

    expect(
      screen.getByText("Verificando sessão...")
    ).toBeTruthy();

    expect(
      await screen.findByText("Usuário: Usuário Teste")
    ).toBeTruthy();

    expect(
      screen.getByText("Token: Presente")
    ).toBeTruthy();
  });

  it("remove a sessão quando a API retorna 401", async () => {
    sessionStorage.setItem(
      "financeflow_token",
      "token-invalido"
    );

    mockedGetCurrentUser.mockRejectedValue(
      new ApiError(401, "Token inválido.")
    );

    renderAuthProvider();

    expect(
      await screen.findByText("Token: Ausente")
    ).toBeTruthy();

    expect(
      sessionStorage.getItem("financeflow_token")
    ).toBeNull();
  });

  it("preserva o token quando a API retorna 503", async () => {
    sessionStorage.setItem(
      "financeflow_token",
      "token-valido-ficticio"
    );

    mockedGetCurrentUser.mockRejectedValue(
      new ApiError(503, "Banco indisponível.")
    );

    renderAuthProvider();

    expect(
      await screen.findByText("Erro de verificação: Sim")
    ).toBeTruthy();

    expect(
      screen.getByText("Token: Presente")
    ).toBeTruthy();

    expect(
      sessionStorage.getItem("financeflow_token")
    ).toBe("token-valido-ficticio");
  });

  it("recupera a sessão depois de uma falha temporária", async () => {
    sessionStorage.setItem(
      "financeflow_token",
      "token-valido-ficticio"
    );

    mockedGetCurrentUser
      .mockRejectedValueOnce(
        new ApiError(503, "Banco indisponível.")
      )
      .mockResolvedValueOnce({
        user: {
          id: 1,
          name: "Usuário Recuperado",
          email: "teste@example.com",
        },
      });

    renderAuthProvider();

    expect(
      await screen.findByText("Erro de verificação: Sim")
    ).toBeTruthy();

    fireEvent.click(
      screen.getByRole("button", {
        name: "Tentar novamente",
      })
    );

    expect(
      await screen.findByText("Usuário: Usuário Recuperado")
    ).toBeTruthy();

    await waitFor(() => {
      expect(mockedGetCurrentUser).toHaveBeenCalledTimes(2);
    });

    expect(
      screen.getByText("Erro de verificação: Não")
    ).toBeTruthy();
  });

  it("remove o JWT quando o usuário faz logout", async () => {
    sessionStorage.setItem(
      "financeflow_token",
      "token-valido-ficticio"
    );

    mockedGetCurrentUser.mockResolvedValue({
      user: {
        id: 1,
        name: "Usuário Teste",
        email: "teste@example.com",
      },
    });

    renderAuthProvider();

    await screen.findByText("Usuário: Usuário Teste");

    fireEvent.click(
      screen.getByRole("button", { name: "Sair" })
    );

    expect(
      screen.getByText("Token: Ausente")
    ).toBeTruthy();

    expect(
      sessionStorage.getItem("financeflow_token")
    ).toBeNull();
  });
});
