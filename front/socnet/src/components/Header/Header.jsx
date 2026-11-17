import { Link } from "react-router-dom";
import Button from "../Button/Button";
import style from "./Header.module.css";

export default function Header() {
    return (
        <header className={style.header}>
            <Link to="/feed" style={{ textDecoration: "none", color: "inherit" }}>
                <h1>Соцсеть</h1>
            </Link>

            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <Link to="/profile/me" title="Мой профиль">
                    <img
                        src="https://placehold.co/100x100"
                        alt="Мой профиль"
                        style={{
                            width: "40px",
                            height: "40px",
                            borderRadius: "50%",
                            objectFit: "cover",
                            cursor: "pointer",
                            display: "block"
                        }}
                    />
                </Link>

                <Link to="/auth">
                    <Button text="Войти" />
                </Link>
            </div>
        </header>
    );
}