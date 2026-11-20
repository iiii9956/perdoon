import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../../components/Button/Button";
import Input from "../../components/Input/Input";
import Box from "../../components/Box/Box";
import style from "./Auth.module.css";
import { restApi } from "../../api/restApi";
import { useToast } from "../../components/Toast/Toast";

export default function Auth() {
    const navigate = useNavigate();
    const toast = useToast();
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
    // Пароль: только ASCII-символы (без кириллицы), мин 8, макс 100
    const PASSWORD_NO_CYRILLIC = /^[^\u0400-\u04FF]+$/;

    const handleSubmit = async (e) => {
        e.preventDefault();

        const trimmedContact = contact.trim();
        const isEmail = trimmedContact.includes("@");
        // Очищаем телефон от пробелов, скобок и тире для проверки и отправки
        const cleanPhone = trimmedContact.replace(/[\s\-()]/g, "");

        // 1. Валидация поля "Почта или телефон"
        if (!trimmedContact) {
            toast("Введите почту или номер телефона!", "error");
            return;
        }

        if (isEmail) {
            if (!EMAIL_REGEX.test(trimmedContact)) {
                toast("Некорректный формат почты (пример: user@mail.ru)", "error");
                return;
            }
        } else {
            if (!PHONE_REGEX.test(cleanPhone)) {
                toast("Некорректный номер телефона (введите 11 цифр, начиная с +7 или 8)", "error");
                return;
            }
        }

        // 2. Валидация пароля
        if (password.length < 8) {
            toast("Пароль должен содержать минимум 8 символов!", "error");
            return;
        }
        if (!PASSWORD_NO_CYRILLIC.test(password)) {
            toast("Пароль не должен содержать кириллические символы!", "error");
            return;
        }

        try {
            if (isLogin) {
                // === ЛОГИН ===
                const loginValue = isEmail ? trimmedContact : cleanPhone;

                const response = await restApi.auth.login({
                    login: loginValue,
                    password
                });

                if (response.data?.token) {
                    localStorage.setItem("jwt_token", response.data.token);
                    toast("Добро пожаловать!", "success");
                    navigate("/feed");
                } else {
                    toast("Сервер не вернул токен авторизации", "error");
                }
            } else {
                // === РЕГИСТРАЦИЯ ===
                const trimmedUsername = username.trim();

                if (!USERNAME_REGEX.test(trimmedUsername)) {
                    toast("Никнейм должен быть от 3 до 30 символов (латиница, кириллица, цифры или _)", "error");
                    return;
                }

                if (password !== confirmPassword) {
                    toast("Пароли не совпадают!", "error");
                    return;
                }

                await restApi.auth.register({
                    username: trimmedUsername,
                    email: isEmail ? trimmedContact : null,
                    phone: isEmail ? null : cleanPhone,
                    password
                });

                toast("Регистрация успешна! Теперь войдите в аккаунт.", "success");
                setIsLogin(true);
                setPassword("");
                setConfirmPassword("");
            }
        } catch (error) {
            console.error("Ошибка авторизации:", error);
            toast(error.response?.data?.message || "Ошибка при запросе к серверу", "error");
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
                        maxLength={254}
                        value={contact}
                        onChange={(e) => setContact(e.target.value.replace(/[а-яА-ЯёЁ]/g, ""))}
                    />

                    <Input
                        placeholder="Пароль (от 8 символов)"
                        type="password"
                        maxLength={100}
                        value={password}
                        onChange={(e) => setPassword(e.target.value.replace(/[а-яА-ЯёЁ]/g, ""))}
                    />

                    {!isLogin && (
                        <Input
                            placeholder="Подтвердите пароль"
                            type="password"
                            maxLength={100}
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value.replace(/[а-яА-ЯёЁ]/g, ""))}
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
