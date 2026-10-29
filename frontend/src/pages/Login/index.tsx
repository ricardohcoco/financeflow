import { Link, useLocation, useNavigate } from "react-router";
import styles from "../../styles/AuthForm.module.css";
import { useState } from "react";
import { ApiError } from "../../services/ApiError";
import { loginUser } from "../../services/authService";
import { useAuth } from "../../hooks/useAuth";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const { signIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const requestedPath = (location.state as { from?: string } | null)?.from;

  const destination = requestedPath === "/transactions" ? "/transactions" : "/dashboard";

  async function handleSubmit() {
    if (loading) return;

    setError("");
    setMessage("");

    if (!email.trim() || !password) {
      setError("Preencha o e-mail e a senha.");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError("Informe um e-mail válido.");
      return;
    }

    setLoading(true);

    try {
      const response = await loginUser({
        email: email.trim().toLowerCase(),
        password,
      });

      if (!response.token || !response.user) {
        throw new Error("Resposta de autenticação inválida.");
      }

      signIn(response);
      setPassword("");

      navigate(destination, { replace: true });

    } catch (error) {
      if (error instanceof ApiError) {
        if (error.status === 429) {
          setError("Muitas tentativas de login. Tente novamente mais tarde.");
        } else {
          setError(error.message);
        }
      } else {
        setError("Não foi possível realizar o login. Tente novamente.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <h1 className={styles.title}>Bem-vindo de volta</h1>

      <p className={styles.subtitle}>
        Entre na sua conta para organizar suas finanças.
      </p>

      <form
        className={styles.form}
        noValidate
        onSubmit={(event) => {
          event.preventDefault();
          void handleSubmit();
        }}
      >
        <div className={styles.field}>
          <label className={styles.label} htmlFor="login-email">
            E-mail
          </label>
          <input
            className={styles.input}
            id="login-email"
            type="email"
            autoComplete="email"
            placeholder="seu@email.com"
            disabled={loading}
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
        </div>

        <div className={styles.field}>
          <label className={styles.label} htmlFor="login-password">
            Senha
          </label>
          <input
            className={styles.input}
            id="login-password"
            type="password"
            autoComplete="current-password"
            placeholder="Digite sua senha"
            disabled={loading}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
        </div>

        {error && (
          <p className={styles.error} role="alert">
            {error}
          </p>
        )}

        {message && (
          <p className={styles.message} role="status">
            {message}
          </p>
        )}

        <button className={styles.button} type="submit" disabled={loading}>
          {loading ? "Entrando..." : "Entrar"}
        </button>
      </form>

      <p className={styles.footer}>
        Ainda não possui uma conta?{" "} 
        <Link to="/register">Cadastre-se</Link>
      </p>
    </>
  );
}
