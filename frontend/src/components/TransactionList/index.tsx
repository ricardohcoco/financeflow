import type { Transaction } from "../../types/transaction";
import styles from "./TransactionList.module.css";

type TransactionListProps = {
  transactions: Transaction[];
  onEdit?: (transaction: Transaction) => void;
  onDelete?: (id: number) => void;
};

const currencyFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

export default function TransactionList({
  transactions,
  onEdit,
  onDelete,
}: TransactionListProps) {
  if (transactions.length === 0) {
    return <p className={styles.empty}>Nenhuma movimentação encontrada.</p>;
  }

  return (
    <ul className={styles.list}>
      {transactions.map((transaction) => {
        const [year, month, day] = transaction.date.split("-");

        return (
          <li className={styles.item} key={transaction.id}>
            <div className={styles.details}>
              <strong>{transaction.description}</strong>

              <span className={styles.meta}>
                {transaction.category_name} · {day}/{month}/{year}
              </span>

              <span
                className={
                  transaction.type === "receita"
                    ? styles.income
                    : styles.expense
                }
              >
                {transaction.type === "receita" ? "+ " : "- "}
                {currencyFormatter.format(Number(transaction.amount))}
              </span>
            </div>

            {(onEdit || onDelete) && (
              <div className={styles.actions}>
                {onEdit && (
                  <button
                    type="button"
                    aria-label={`Editar ${transaction.description}`}
                    onClick={() => onEdit(transaction)}
                  >
                    Editar
                  </button>
                )}

                {onDelete && (
                  <button
                    type="button"
                    className={styles.delete}
                    aria-label={`Excluir ${transaction.description}`}
                    onClick={() => onDelete(transaction.id)}
                  >
                    Excluir
                  </button>
                )}
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );
}
