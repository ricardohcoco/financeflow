import { NavLink, Outlet, useNavigate } from "react-router";
import styles from "./MainLayout.module.css";
import { useAuth } from "../hooks/useAuth";

export default function MainLayout() {
    const { user, signOut } = useAuth();
    const navigate = useNavigate();

    function handleLogout() {
        signOut();
        navigate("/login", { replace: true });
    }

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <h1 className={styles.logo}>FinanceFlow</h1>

                <nav 
                    className={styles.navigation}
                    aria-label="Navegação principal" 
                >
                    <NavLink
                        to="/dashboard"
                        className={({ isActive }) =>
                        isActive ? styles.active : styles.link
                    }
                >
                    Dashboard
                    </NavLink>

                    <NavLink
                        to="/transactions"
                        className={({ isActive }) =>
                        isActive ? styles.active: styles.link
                    }
                >
                    Movimentações
                </NavLink>
                </nav>

                <div className={styles.account}>
                    <span>Olá, {user?.name}</span>

                    <button 
                        type="button"
                        className={styles.logout}
                        onClick={handleLogout}
                    >
                        Sair
                    </button>
                </div>
            </header>

            <main className={styles.content}>
                <Outlet />
            </main>
        </div>
    );
}