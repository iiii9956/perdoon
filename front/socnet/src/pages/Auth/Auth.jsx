import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../../components/Button/Button";
import Input from "../../components/Input/Input";
import Box from "../../components/Box/Box";
import style from "./Auth.module.css";
import { restApi } from "../../api/restApi";

export default function Auth() {
    const navigate = useNavigate();
    const [isLogin, setIsLogin] = useState(true);

    // Общее поле для почты или телефона (и для входа, и для регистрации)
    const [contact, setContact] = useState("");
    const [password, setPassword] = useState("");

    // Поля только для регистрации
    const [username, setUsername] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    // Регулярные выражения (Regex)
    const USERNAME_REGEX = /^[a-zA-Zа-яА-ЯёЁ0-9_]{3,30}$/;
    const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const PHONE_REGEX = /^(\+7|8)\d{10}$/;

    const handleSubmit = async (e) => {
        e.preventDefault();

        const trimmedContact = contact.trim();
        const isEmail = trimmedContact.includes("@");
        // Очищаем телефон от пробелов, скобок и тире для проверки и отправки
        const cleanPhone = trimmedContact.replace(/[\s\-()]/g, "");

        // 1. Валидация поля "Почта или телефон"
        if (!trimmedContact) {
            alert("Введите почту или номер телефона!");
            return;
        }

        if (isEmail) {
            if (!EMAIL_REGEX.test(trimmedContact)) {
                alert("Некорректный формат почты (пример: user@mail.ru)");
                return;
            }
        } else {
            if (!PHONE_REGEX.test(cleanPhone)) {
                alert("Некорректный номер телефона (введите 11 цифр, начиная с +7 или 8)");
                return;
            }
        }

        // 2. Валидация пароля
        if (password.length < 6) {
            alert("Пароль должен содержать минимум 6 символов!");
            return;
        }

        try {
            if (isLogin) {
                // === ЛОГИН ===
                // Если это телефон, отправляем очищенный от пробелов и скобок вариант
                const loginValue = isEmail ? trimmedContact : cleanPhone;

                const response = await restApi.auth.login({
                    login: loginValue,
                    password
                });

                if (response.data?.token) {
                    localStorage.setItem("jwt_token", response.data.token);
                    navigate("/feed");
                } else {
                    alert("Сервер не вернул токен авторизации");
                }
            } else {
                // === РЕГИСТРАЦИЯ ===
                const trimmedUsername = username.trim();

                if (!USERNAME_REGEX.test(trimmedUsername)) {
                    alert("Никнейм должен быть от 3 до 30 символов и содержать только латиницу, кириллицу, цифры или _");
                    return;
                }

                if (password !== confirmPassword) {
                    alert("Пароли не совпадают!");
                    return;
                }

                await restApi.auth.register({
                    username: trimmedUsername,
                    email: isEmail ? trimmedContact : null,
                    phone: isEmail ? null : cleanPhone,
                    password
                });

                alert("Регистрация успешна! Теперь войдите в аккаунт.");
                setIsLogin(true);
                setPassword("");
                setConfirmPassword("");
            }
        } catch (error) {
            console.error("Ошибка авторизации:", error);
            alert(error.response?.data?.message || "Ошибка при запросе к серверу");
        }
    };

    return (
        <div className={style.authContainer}>
            <Box>
                <h1>{isLogin ? "Вход" : "Регистрация"}</h1>

                <form className={style.authForm} onSubmit={handleSubmit}>
                    {!isLogin && (
                        <Input
                            placeholder="Никнейм (3-30 символов)"
                            maxLength={30}
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                        />
                    )}

                    <Input
                        placeholder="Почта или телефон (+7...)"
                        value={contact}
                        onChange={(e) => setContact(e.target.value)}
                    />

                    <Input
                        placeholder="Пароль (от 6 символов)"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />

                    {!isLogin && (
                        <Input
                            placeholder="Подтвердите пароль"
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                        />
                    )}

                    <Button text={isLogin ? "Войти" : "Создать аккаунт"} type="submit" />
                </form>

                <div style={{ marginTop: "15px", textAlign: "center" }}>
                    <span>{isLogin ? "Нет аккаунта? " : "Уже есть аккаунт? "}</span>
                    <span
                        style={{ color: "blue", cursor: "pointer", textDecoration: "underline" }}
                        onClick={() => {
                            setIsLogin(!isLogin);
                            setPassword("");
                            setConfirmPassword("");
                        }}
                    >
                        {isLogin ? "Зарегистрироваться" : "Войти"}
                    </span>
                </div>
            </Box>
        </div>
    );
}