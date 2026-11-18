import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import Button from "../Button/Button";
import { restApi } from "../../api/restApi";
import style from "./Header.module.css";

export default function Header() {
    const navigate = useNavigate();
    const location = useLocation();
    const [currentUser, setCurrentUser] = useState(null);

    const token = localStorage.getItem("jwt_token");

    useEffect(() => {
        if (!token) {
            setCurrentUser(null);
            return;
        }

        async function fetchMe() {
            try {
                const res = await restApi.users.getMe();
                setCurrentUser(res.data);
            } catch (err) {
                console.error("Не удалось загрузить данные пользователя в шапке:", err);
            }
        }
        fetchMe();
    }, [token, location.pathname]);

    const handleLogout = async () => {
        try {
            await restApi.auth.logout();
        } catch (e) {
            // Игнорируем ошибку сети при логауте, главное удалить токен локально
        }
        localStorage.removeItem("jwt_token");
        setCurrentUser(null);
        navigate("/auth");
    };

    return (
        <header className={style.header}>
            <Link to="/feed" style={{ textDecoration: "none", color: "inherit" }}>
                <h1>Соцсеть</h1>
            </Link>

            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                {token ? (
                    <>
                        <Link
                            to="/profile/me"
                            title={currentUser?.username || "Мой профиль"}
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "8px",
                                textDecoration: "none",
                                color: "inherit",
                                fontWeight: "bold"
                            }}
                        >
                            <span>{currentUser?.username}</span>
                            <img
                                src={currentUser?.avatarUrl || "https://placehold.co/100x100"}
                                alt="Мой профиль"
                                style={{
                                    width: "40px",
                                    height: "40px",
                                    borderRadius: "50%",
                                    objectFit: "cover",
                                    cursor: "pointer"
                                }}
                            />
                        </Link>
                        <Button text="Выйти" onClick={handleLogout} />
                    </>
                ) : (
                    <Link to="/auth">
                        <Button text="Войти" />
                    </Link>
                )}
            </div>
        </header>
    );
}