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
                const userData = res.data;

                // Проверяем роль через бэкенд: эндпоинт /api/admin/test отвечает 200 только для ADMIN
                try {
                    await restApi.admin.checkAdmin();
                    userData.role = "ADMIN";
                } catch {
                    userData.role = userData.role || "USER";
                }

                setCurrentUser(userData);
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

    const navLinkStyle = (path) => ({
        textDecoration: "none",
        color: location.pathname === path ? "#1d3557" : "#555",
        fontWeight: location.pathname === path ? "bold" : "normal",
        fontSize: "15px",
        padding: "4px 2px",
        borderBottom: location.pathname === path ? "2px solid #457b9d" : "2px solid transparent",
    });

    const isModeratorOrAdmin =
        currentUser?.role === "ADMIN" || currentUser?.role === "MODERATOR";

    return (
        <header className={style.header}>
            <Link to="/feed" style={{ textDecoration: "none", color: "inherit" }}>
                <h1 style={{ margin: 0, fontSize: "20px" }}>Соцсеть</h1>
            </Link>

            {token && (
                <nav className={style.nav}>
                    <Link to="/feed" style={navLinkStyle("/feed")}>Лента</Link>
                    <Link to="/friends" style={navLinkStyle("/friends")}>Друзья</Link>
                    <Link to="/chats" style={navLinkStyle("/chats")}>Сообщения</Link>
                    <Link to="/search" style={navLinkStyle("/search")}>Поиск</Link>
                    {isModeratorOrAdmin && (
                        <Link to="/admin" style={navLinkStyle("/admin")}>Админ</Link>
                    )}
                </nav>
            )}

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
                            {currentUser?.role === "ADMIN" && (
                                <span className={style.roleBadgeAdmin}>Админ</span>
                            )}
                            {currentUser?.role === "MODERATOR" && (
                                <span className={style.roleBadgeMod}>Модератор</span>
                            )}
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
