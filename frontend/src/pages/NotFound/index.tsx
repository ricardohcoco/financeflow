import { Link } from "react-router";

export default function NotFound() {
    return (
        <section>
            <h1>404 - Página não encontrada</h1>
            <p>O endereço solicitado não existe.</p>

            <Link to="/dashboard">
                Voltar ao Dashboard
            </Link>
        </section>
    );
}