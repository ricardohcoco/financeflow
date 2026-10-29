import type { Transaction } from "../../types/transaction";
import styles from "./RecentTransactions.module.css";

type RecentTransactionsProps = {
    transactions: Transaction[];
};

export default function RecentTransactions({
    transactions,
}: RecentTransactionsProps) {
    function formatCurrency(amount: string) {
        return new Intl.NumberFormat("pt-BR", {
            style: "currency",
            currency: "BRL",
        }).format(Number(amount));
    }

    function formatDate(date: string) {
        const [year, month, day] = date.split("-");
        return `${day}/${month}/${year}`;
    }

    return (
        <section className={styles.container}>
            <h2 className={styles.title}>
                Últimas movimentações
            </h2>

            {transactions.length === 0 ? (
                <p className={styles.empty}>
                    Nenhuma movimentação encontrada.
                </p>
            ) : (
                <ul className={styles.list}>
                    {transactions.map((transaction) => (
                        <li
                            className={styles.item}
                            key={transaction.id}
                        >
                            <div className={styles.information}>
                                <strong>{transaction.description}</strong>

                                <span className={styles.details}>
                                    {transaction.category_name} ·{" "}
                                    {formatDate(transaction.date)}
                                </span>
                            </div>

                            <span
                                className={
                                    transaction.type === "receita"
                                    ? styles.income
                                    : styles.expense
                                }
                            >
                                {transaction.type === "receita" ? "+ " : "- "}
                                {formatCurrency(transaction.amount)}
                            </span>
                        </li>
                    ))}
                </ul>
            )}
        </section>
    )
}