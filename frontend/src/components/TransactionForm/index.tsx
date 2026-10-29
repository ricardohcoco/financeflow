import type {
  TransactionFormData,
  TransactionType,
} from "../../types/transaction";
import type { Category } from "../../types/category";
import styles from "./TransactionForm.module.css";
import { useState } from "react";
import type { FormEvent } from "react";

type TransactionFormProps = {
  categories: Category[];
  initialData?: TransactionFormData;
  onSave: (data: TransactionFormData) => void;
  onCancel: () => void;
  saving?: boolean;
};

function getTodayDate(): string {
  const today = new Date();

  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

const emptyForm: TransactionFormData = {
  description: "",
  amount: "",
  type: "despesa",
  category_id: 0,
  date: getTodayDate(),
};

function isValidDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }

  const [year, month, day] = value.split("-").map(Number);

  const date = new Date(Date.UTC(year, month - 1, day));

  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
}

export default function TransactionForm({
  categories,
  initialData,
  onSave,
  onCancel,
  saving = false,
}: TransactionFormProps) {
  const [form, setForm] = useState<TransactionFormData>(
    initialData ?? emptyForm,
  );
  const [error, setError] = useState("");

  const availableCategories = categories.filter(
    (category) => category.type === form.type,
  );

  function changeType(type: TransactionType) {
    setForm((previous) => ({
      ...previous,
      type,
      category_id: 0,
    }));
  }

  function updateField(
    field: keyof TransactionFormData,
    value: string | number,
  ) {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    const description = form.description.trim();
    if (!form.description || description.length > 200) {
      setError("Informe uma descrição até 200 caracteres.");
      return;
    }

    if (
      !/^(?:0|[1-9]\d{0,9})(?:\.\d{1,2})?$/.test(form.amount) ||
      Number(form.amount) <= 0
    ) {
      setError("Informe um valor positivo com até duas casas decimais.");
      return;
    }

    const categoryIsValid = availableCategories.some(
      (category) => category.id === form.category_id,
    );

    if (!categoryIsValid) {
      setError("Selecione uma categoria válida.");
      return;
    }

    if (!isValidDate(form.date)) {
      setError("Informe uma data válida.");
      return;
    }

    onSave({
      ...form,
      description: form.description.trim(),
    });
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <div className={styles.field}>
        <label htmlFor="transaction-description">Descrição</label>
        <input
          id="transaction-description"
          max-length={200}
          value={form.description}
          onChange={(event) => updateField("description", event.target.value)}
          placeholder="Ex.: Compras no supermercado."
          aria-describedby={error ? "transaction-form-error" : undefined}
          disabled={saving}
        />
      </div>

      <div className={styles.field}>
        <label htmlFor="transaction-amount">Valor (R$)</label>
        <input
          id="transaction-amount"
          type="text"
          inputMode="decimal"
          placeholder="Ex.: 150.50"
          value={form.amount}
          onChange={(event) => updateField("amount", event.target.value)}
          aria-describedby={error ? "transaction-form-error" : undefined}
          disabled={saving}
        />
      </div>
      <div className={styles.field}>
        <label htmlFor="transaction-type">Tipo</label>
        <select
          id="transaction-type"
          value={form.type}
          onChange={(event) =>
            changeType(event.target.value as TransactionType)
          }
          aria-describedby={error ? "transaction-form-error" : undefined}
          disabled={saving}
        >
          <option value="despesa">Despesa</option>
          <option value="receita">Receita</option>
        </select>
      </div>

      <div className={styles.field}>
        <label htmlFor="transaction-category">Categoria</label>
        <select
          id="transaction-category"
          value={form.category_id}
          onChange={(event) =>
            updateField("category_id", Number(event.target.value))
          }
          aria-describedby={error ? "transaction-form-error" : undefined}
          disabled={saving}
        >
          <option value={0}>Selecione</option>
          {availableCategories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
      </div>

      <div className={styles.field}>
        <label htmlFor="transaction-date">Data</label>
        <input
          id="transaction-date"
          type="date"
          required
          value={form.date}
          onChange={(event) => updateField("date", event.target.value)}
          aria-describedby={error ? "transaction-form-error" : undefined}
          disabled={saving}
        />
      </div>

      {error && (
        <p id="transaction-form-error" className={styles.error} role="alert">
          {error}
        </p>
      )}

      <div className={styles.actions}>
        <button type="button" className={styles.cancel} onClick={onCancel} disabled={saving}>
          Cancelar
        </button>

        <button type="submit" className={styles.save} disabled={saving}>
          {saving ? "Salvando..." : initialData ? "Salvar alterações" : "Cadastrar"}
        </button>
      </div>
    </form>
  );
}
