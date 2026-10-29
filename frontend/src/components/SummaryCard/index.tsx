import styles from "./SummaryCard.module.css";

type SummaryCardProps = {
    title: string;
    amount: number;
    variant: "income" | "expense" | "balance";
};

export default function SummaryCard({
    title,
    amount,
    variant
}: SummaryCardProps) {
    const formattedAmount = new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL",
    }).format(amount);
    
    return (
        <article className={`${styles.card} ${styles[variant]}`}>
            <h2 className={styles.title}>{title}</h2>
            <p className={styles.amount}>{formattedAmount}</p>
        </article>
    )
}