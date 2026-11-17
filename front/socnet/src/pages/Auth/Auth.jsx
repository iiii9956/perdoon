import { useState } from "react";
import Button from "../../components/Button/Button";
import Input from "../../components/Input/Input";
import Box from "../../components/Box/Box";
import style from "./Auth.module.css";
import { restApi } from "../../api/restApi"; // Не забудь проверить путь

export default function Auth(){
    // Состояние, определяющее режим: true = Логин, false = Регистрация
    const [isLogin, setIsLogin] = useState(true); 
    
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState(""); // Для регистрации

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        try {
            if (isLogin) {
                // Вызываем логин
                const response = await restApi.auth.login({ username, password });
                console.log("Успешный вход:", response.data);
            } else {
                // Проверяем, совпадают ли пароли при регистрации
                if (password !== confirmPassword) {
                    console.error("Пароли не совпадают!");
                    alert("Пароли не совпадают!"); // Пока выведем простой alert
                    return;
                }
                
                // Вызываем регистрацию
                const response = await restApi.auth.register({ username, password });
                console.log("Успешная регистрация:", response.data);
                
                // После успешной регистрации можно переключить пользователя обратно на логин
                setIsLogin(true); 
                setPassword("");
                setConfirmPassword("");
            }
        } catch (error) {
            console.error("Ошибка авторизации:", error);
        }
    };

    return(
        <div className={style.authContainer}>
            <Box>
                {/* Заголовок меняется в зависимости от стейта */}
                <h1>{isLogin ? "Логин" : "Регистрация"}</h1>
                
                <form className={style.authForm} onSubmit={handleSubmit}>
                    <Input 
                        placeholder="e-mail/телефон" 
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                    />
                    <Input 
                        placeholder="Пароль" 
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />

                    {/* Рендерим инпут "Подтвердить пароль" ТОЛЬКО если это регистрация (!isLogin) */}
                    {!isLogin && (
                        <Input 
                            placeholder="Подтвердите пароль" 
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                        />
                    )}
                    
                    <Button text={isLogin ? "Войти" : "Создать аккаунт"} type="submit"/>
                </form>

                {/* Блок переключения внизу */}
                <div className={style.logSwitch}>
                    {isLogin ? "Нет аккаунта? " : "Уже есть аккаунт? "}
                    <br />
                    <span 
                        onClick={() => setIsLogin(!isLogin)}
                    >
                        {isLogin ? "Зарегистрироваться" : "Войти"}
                    </span>
                </div>
            </Box>
        </div>
    );
}