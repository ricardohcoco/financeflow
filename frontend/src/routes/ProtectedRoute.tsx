import { Navigate, Outlet, useLocation } from "react-router";
import { useAuth } from "../hooks/useAuth";

export default function ProtectedRoute() {
  const { user, token, loading, verificationError, retrySession } = useAuth();
  const location = useLocation();

  if (loading) {
    return <p role="status">Verificando sessão...</p>;
  }

  if (token && !user && verificationError) {
    return (
      <section
        style={{
          maxWidth: 480,
          margin: "80px auto",
          padding: 24,
          textAlign: "center",
        }}
      >
        <h1>Serviço temporariamente indisponível</h1>

        <p role="alert">
          Não foi possível confirmar sua sessão. Verifique sua conexão e tente
          novamente.
        </p>

        <button type="button" onClick={retrySession}>
          Tentar novamente
        </button>
      </section>
    );
  }

  if (!user || !token) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  return <Outlet />;
}
