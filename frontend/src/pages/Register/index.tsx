import { Link } from "react-router";
import styles from "../../styles/AuthForm.module.css";
import { useState } from "react";
import { ApiError } from "../../services/ApiError";
import { registerUser } from "../../services/authService";
import type { RegisterData } from "../../types/auth";


type RegisterForm = RegisterData & {
  confirmPassword: string;
};

const initialForm: RegisterForm = {
  name: "",
  email: "",
  password: "",
  confirmPassword: "",
};

export default function Register() {
  const [form, setForm] = useState<RegisterForm>(initialForm);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  function updateField(field: keyof RegisterForm, value: string) {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  }

  function validateForm(): string | null {

    if (
      !form.name.trim() ||
      !form.email.trim() ||
      !form.password ||
      !form.confirmPassword
    ) {
      return "Preencha todos os campos.";
    }

    if (form.name.trim().length < 3 || form.name.trim().length > 120) {
      return "O nome deve ter entre 3 e 120 caracteres.";
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      return "Informe um e-mail válido.";
    }

    if (form.password.length < 8) {
        return "A senha deve ter pelo menos 8 caracteres.";
    }

    if (new TextEncoder().encode(form.password).length > 72) {
        return "A senha deve ter no máximo 72 bytes.";
    }

    if (form.password !== form.confirmPassword) {
        return "As senhas não coincidem.";
    }

    return null;
  }

  async function handleSubmit() {
    if (loading) return;

    setError("");
    setMessage("");

    const validationError = validateForm();

    if (validationError) {
        setError(validationError);
        return;
    }

    setLoading(true);

    try {
        const response = await registerUser({
            name: form.name.trim(),
            email: form.email.trim().toLowerCase(),
            password: form.password,
        });

        setMessage(response.message);
        setForm(initialForm);
    } catch (error) {
        if (error instanceof ApiError) {
            setError(error.message);
        } else {
            setError(
                "Não foi possível concluir o cadastro. Tente novamente."
            );
        }
    } finally {
        setLoading(false);
    }
  }

  return (
    <>
        <h1 className={styles.title}>Criar conta</h1>

        <p className={styles.subtitle}>
            Comece a organizar suas finanças.
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
                <label className={styles.label} htmlFor="register-name">
                    Nome completo
                </label>
                <input
                    className={styles.input}
                    id="register-name"
                    type="text"
                    autoComplete="name"
                    maxLength={120}
                    disabled={loading}
                    value={form.name}
                    onChange={(event) =>
                        updateField("name", event.target.value)
                    }
                    placeholder="Seu nome"
                />
            </div>

            <div className={styles.field}>
                <label className={styles.label} htmlFor="register-email">
                    E-mail
                </label>
                <input
                    className={styles.input}
                    id="register-email"
                    type="email"
                    autoComplete="email"
                    disabled={loading}
                    value={form.email}
                    onChange={(event) => 
                        updateField("email", event.target.value)
                    }
                    placeholder="seu@email.com"
                />
            </div>

            <div className={styles.field}>
                <label className={styles.label} htmlFor="register-password">
                    Senha
                </label>
                <input
                    className={styles.input}
                    id="register-password"
                    type="password"
                    autoComplete="new-password"
                    disabled={loading}
                    value={form.password}
                    onChange={(event) =>
                        updateField("password", event.target.value)
                    }
                    placeholder="Mínimo 8 caracteres"
                />
            </div>

            <div className={styles.field}>
                <label
                    className={styles.label}
                    htmlFor="register-confirm-password"
                >
                    Confirmar senha
                </label>
                <input
                    className={styles.input}
                    id="register-confirm-password"
                    type="password"
                    autoComplete="new-password"
                    disabled={loading}
                    value={form.confirmPassword}
                    onChange={(event) =>
                        updateField("confirmPassword", event.target.value)
                    }
                    placeholder="Repita sua senha"
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
                {loading ? "Cadastrando" : "Criar conta"}
             </button>
        </form>

        <p className={styles.footer}>
            Já possui uma conta? <Link to="/login">Entrar</Link>
        </p>
    </>
  );
}
