import { useEffect, useState } from "react";
import TransactionList from "../../components/TransactionList";
import { useAuth } from "../../hooks/useAuth";
import { ApiError } from "../../services/ApiError";
import { getCategories } from "../../services/categoryService";
import {
  createTransaction,
  deleteTransaction,
  getTransactions,
  updateTransaction,
} from "../../services/transactionService";
import type { Category } from "../../types/category";
import type {
  Transaction,
  TransactionFormData,
  TransactionType,
} from "../../types/transaction";
import styles from "./Transactions.module.css";
import TransactionForm from "../../components/TransactionForm";

type TypeFilter = TransactionType | "todos";

export default function Transactions() {
  const { token, signOut } = useAuth();

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  const [typeFilter, setTypeFilter] = useState<TypeFilter>("todos");
  const [categoryFilter, setCategoryFilter] = useState(0);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refresh, setRefresh] = useState(0);

  const [showForm, setShowForm] = useState(false);
  const [editingTransaction, setEditingTransaction] =
    useState<Transaction | null>(null);

  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const [actionError, setActionError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!token) return;

    const controller = new AbortController();

    async function loadData(authToken: string) {
      try {
        const [categoriesData, transactionsData] = await Promise.all([
          getCategories(authToken, controller.signal),
          getTransactions(authToken, controller.signal),
        ]);

        if (controller.signal.aborted) return;

        setCategories(categoriesData);
        setTransactions(transactionsData);
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
            : "Não foi possível carregar as movimentações. Tente novamente.",
        );
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    void loadData(token);

    return () => controller.abort();
  }, [token, signOut, refresh]);

  function reloadData() {
    setError("");
    setLoading(true);
    setRefresh((previous) => previous + 1);
  }

  function handleTypeFilter(value: TypeFilter) {
    setTypeFilter(value);
    setCategoryFilter(0);
  }

  const availableCategories = categories.filter(
    (category) => typeFilter === "todos" || category.type === typeFilter,
  );

  const filteredTransactions = transactions
    .filter((transaction) => {
      const matchesType =
        typeFilter === "todos" || transaction.type === typeFilter;

      const matchesCategory =
        categoryFilter === 0 || transaction.category_id === categoryFilter;

      return matchesType && matchesCategory;
    })
    .sort((a, b) => b.date.localeCompare(a.date) || b.id - a.id);

  function openCreateForm() {
    setEditingTransaction(null);
    setActionError("");
    setMessage("");
    setShowForm(true);
  }

  function openEditForm(transaction: Transaction) {
    setEditingTransaction(transaction);
    setActionError("");
    setMessage("");
    setShowForm(true);
  }

  function closeForm() {
    if (saving) return;
    setShowForm(false);
    setEditingTransaction(null);
    setActionError("");
  }

  async function handleSave(data: TransactionFormData) {
    if (!token || saving || deletingId !== null) return;

    setSaving(true);
    setActionError("");
    setMessage("");

    try {
      if (editingTransaction) {
        await updateTransaction(editingTransaction.id, data, token);

        setMessage("Movimentação atualizada com sucesso.");
      } else {
        await createTransaction(data, token);

        setMessage("Movimentação cadastrada com sucesso.");
      }

      setShowForm(false);
      setEditingTransaction(null);

      reloadData();
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        signOut();
        return;
      }

      setActionError(
        error instanceof ApiError
          ? error.message
          : "Não foi possível salvar. Tente novamente.",
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: number) {
    if (!token || saving || deletingId !== null) return;

    const confirmed = window.confirm(
      "Deseja realmente excluir esta movimentação?",
    );

    if (!confirmed) return;

    setDeletingId(id);
    setActionError("");
    setMessage("");

    try {
      await deleteTransaction(id, token);

      setMessage("Movimentação excluída com sucesso.");
      reloadData();
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        signOut();
        return;
      }

      setActionError(
        error instanceof ApiError
          ? error.message
          : "Não foi possível excluir. Tente novamente.",
      );
    } finally {
      setDeletingId(null);
    }
  }

  const initialFormData: TransactionFormData | undefined = editingTransaction
    ? {
        description: editingTransaction.description,
        amount: editingTransaction.amount,
        type: editingTransaction.type,
        category_id: editingTransaction.category_id,
        date: editingTransaction.date,
      }
    : undefined;

  const busy = saving || deletingId !== null;

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div>
          <h1>Movimentações</h1>
          <p>Gerencie suas receitas e despesas.</p>
        </div>

        <button
          type="button"
          className={styles.primaryButton}
          onClick={openCreateForm}
          disabled={busy || loading || Boolean(error)}
        >
          + Nova movimentação
        </button>
      </header>

      {message && (
        <p className={styles.message} role="status">
          {message}
        </p>
      )}

      {actionError && (
        <p className={styles.error} role="alert">
          {actionError}
        </p>
      )}

      {loading ? (
        <section className={styles.panel}>
          <p role="status">Carregando movimentações...</p>
        </section>
      ) : error ? (
        <section className={styles.panel}>
          <p className={styles.error} role="alert">
            {error}
          </p>

          <button
            type="button"
            className={styles.primaryButton}
            onClick={reloadData}
          >
            Tentar Novamente
          </button>
        </section>
      ) : (
        <>
          {showForm && (
            <section
              className={styles.panel}
              aria-labelledby="transaction-form-title"
            >
              <h2 id="transaction-form-title">
                {editingTransaction
                  ? "Editar movimentação"
                  : "Nova movimentação"}
              </h2>

              <TransactionForm
                key={editingTransaction?.id ?? "new"}
                categories={categories}
                initialData={initialFormData}
                onSave={(data) => {
                  void handleSave(data);
                }}
                onCancel={closeForm}
                saving={saving}
              />
            </section>
          )}

          <section className={styles.panel}>
            <h2>Filtrar movimentações</h2>

            <div className={styles.filters}>
              <div className={styles.field}>
                <label htmlFor="filter-type">Tipo</label>

                <select
                  id="filter-type"
                  value={typeFilter}
                  onChange={(event) =>
                    handleTypeFilter(event.target.value as TypeFilter)
                  }
                >
                  <option value="todos">Todos os tipos</option>
                  <option value="receita">Receitas</option>
                  <option value="despesa">Despesas</option>
                </select>
              </div>

              <div className={styles.field}>
                <label htmlFor="filter-category">Categoria</label>

                <select
                  id="filter-category"
                  value={categoryFilter}
                  onChange={(event) =>
                    setCategoryFilter(Number(event.target.value))
                  }
                >
                  <option value={0}>Todas as categorias</option>

                  {availableCategories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </section>

          <section className={styles.panel}>
            <h2>Movimentações ({filteredTransactions.length})</h2>

            <TransactionList
              transactions={filteredTransactions}
              onEdit={busy ? undefined : openEditForm}
              onDelete={
                busy
                  ? undefined
                  : (id) => {
                      void handleDelete(id);
                    }
              }
            />

            {deletingId !== null && (
              <p role="status">Excluindo movimentação...</p>
            )}
          </section>
        </>
      )}
    </div>
  );
}
