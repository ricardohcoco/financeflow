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
} from "@testing-library/react";

import {
  MemoryRouter,
  Route,
  Routes,
} from "react-router";

import ProtectedRoute from "./ProtectedRoute";
import { useAuth } from "../hooks/useAuth";

vi.mock("../hooks/useAuth", () => ({
  useAuth: vi.fn(),
}));

const mockedUseAuth = vi.mocked(useAuth);

function renderProtectedRoute() {
  return render(
    <MemoryRouter initialEntries={["/dashboard"]}>
      <Routes>
        <Route path="/login" element={<h1>Login</h1>} />

        <Route element={<ProtectedRoute />}>
          <Route
            path="/dashboard"
            element={<h1>Dashboard privado</h1>}
          />
        </Route>
      </Routes>
    </MemoryRouter>
  );
}

beforeEach(() => {
  mockedUseAuth.mockReset();
});

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe("ProtectedRoute", () => {
  it("permite acesso quando existe sessão válida", () => {
    mockedUseAuth.mockReturnValue({
      user: {
        id: 1,
        name: "Usuário Teste",
        email: "teste@example.com",
      },
      token: "token-ficticio",
      loading: false,
      verificationError: false,
      signIn: vi.fn(),
      signOut: vi.fn(),
      retrySession: vi.fn(),
    });

    renderProtectedRoute();

    expect(
      screen.getByText("Dashboard privado")
    ).toBeTruthy();
  });

  it("redireciona para Login sem sessão", () => {
    mockedUseAuth.mockReturnValue({
      user: null,
      token: null,
      loading: false,
      verificationError: false,
      signIn: vi.fn(),
      signOut: vi.fn(),
      retrySession: vi.fn(),
    });

    renderProtectedRoute();

    expect(screen.getByText("Login")).toBeTruthy();

    expect(
      screen.queryByText("Dashboard privado")
    ).toBeNull();
  });

  it("mostra carregamento enquanto verifica a sessão", () => {
    mockedUseAuth.mockReturnValue({
      user: null,
      token: "token-ficticio",
      loading: true,
      verificationError: false,
      signIn: vi.fn(),
      signOut: vi.fn(),
      retrySession: vi.fn(),
    });

    renderProtectedRoute();

    expect(
      screen.getByText("Verificando sessão...")
    ).toBeTruthy();

    expect(
      screen.queryByText("Dashboard privado")
    ).toBeNull();
  });

  it("permite tentar novamente após falha temporária", () => {
    const retrySession = vi.fn();

    mockedUseAuth.mockReturnValue({
      user: null,
      token: "token-ficticio",
      loading: false,
      verificationError: true,
      signIn: vi.fn(),
      signOut: vi.fn(),
      retrySession,
    });

    renderProtectedRoute();

    expect(
      screen.getByText("Serviço temporariamente indisponível")
    ).toBeTruthy();

    expect(
      screen.queryByText("Dashboard privado")
    ).toBeNull();

    fireEvent.click(
      screen.getByRole("button", {
        name: "Tentar novamente",
      })
    );

    expect(retrySession).toHaveBeenCalledOnce();
  });
});
