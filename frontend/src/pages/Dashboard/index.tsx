import { useEffect, useState } from "react";
import RecentTransactions from "../../components/RecentTransactions";
import SummaryCard from "../../components/SummaryCard";
import { useAuth } from "../../hooks/useAuth";
import styles from "./Dashboard.module.css";
import type { Transaction } from "../../types/transaction";
import { getTransactions } from "../../services/transactionService";
import { ApiError } from "../../services/ApiError";
import {
  calculateSummary,
  getCurrentMonth,
  getLocalDate,
} from "../../utils/finance";

export default function Dashboard() {
  const { token, signOut } = useAuth();

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    if (!token) return;

    const controller = new AbortController();

    async function loadDashboard(authToken: string) {
      try {
        const data = await getTransactions(authToken, controller.signal);

        if (controller.signal.aborted) return;

        setTransactions(data);
        setError("");
      } catch (error) {
        if (controller.signal.aborted) return;

        if (error instanceof ApiError && error.status === 401) {
          signOut();
          return;
        }

        setError(
          error instanceof ApiError
            ? error.message
            : "Não foi possível carregar o Dashboard. Tente novamente.",
        );
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    void loadDashboard(token);

    return () => controller.abort();
  }, [token, signOut, retry]);

  function handleRetry() {
    setError("");
    setLoading(true);
    setRetry((previous) => previous + 1);
  }

  const referenceDate = getLocalDate();

  const summary = calculateSummary(transactions, referenceDate);

  const recentTransactions = [...transactions]
    .sort((a, b) => b.date.localeCompare(a.date) || b.id - a.id)
    .slice(0, 5);

  const [year, month] = getCurrentMonth().split("-");

  const periodLabel = new Intl.DateTimeFormat("pt-BR", {
    month: "long",
    year: "numeric",
  }).format(new Date(Number(year), Number(month) - 1, 1));

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1>Dashboard</h1>
        <p>Resumo Financeiro até a data atual — {periodLabel}</p>
      </header>

      {loading ? (
        <section className={styles.feedback}>
          <p role="status">Carregando seu resumo financeiro...</p>
        </section>
      ) : error ? (
        <section className={styles.feedback}>
          <p className={styles.error} role="alert">
            {error}
          </p>

          <button
            type="button"
            className={styles.retryButton}
            onClick={handleRetry}
          >
            Tentar novamente
          </button>
        </section>
      ) : (
        <>
          <section className={styles.summary} aria-label="Resumo financeiro">
            <SummaryCard
              title="Receitas"
              amount={summary.income}
              variant="income"
            />

            <SummaryCard
              title="Despesas"
              amount={summary.expense}
              variant="expense"
            />

            <SummaryCard
              title="Saldo"
              amount={summary.balance}
              variant="balance"
            />
          </section>

          <RecentTransactions transactions={recentTransactions} />
        </>
      )}
    </div>
  );
}
