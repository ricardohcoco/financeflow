import { Outlet } from "react-router";
import styles from "./AuthLayout.module.css";

export default function AuthLayout() {
    return (
        <div className={styles.container}>
            <div className={styles.wrapper}>
                <header className={styles.brand}>
                    <span className={styles.brandIcon} aria-hidden="true">
                        $
                    </span>
                    <span>FinanceFlow</span>
                </header>

                <main className={styles.card}>
                    <Outlet />
                </main>

                <p className={styles.footer}>
                    Organize suas finanças com simplicidade.
                </p>
            </div>
        </div>
    )
}