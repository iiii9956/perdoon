import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Box from "../../components/Box/Box";
import Button from "../../components/Button/Button";
import Input from "../../components/Input/Input";
import { restApi } from "../../api/restApi";
import { useToast } from "../../components/Toast/Toast";

export default function Search() {
    const navigate = useNavigate();
    const toast = useToast();

    const [userIdQuery, setUserIdQuery] = useState("");
    const [foundUser, setFoundUser] = useState(null);
    const [searching, setSearching] = useState(false);

    const handleSearch = async (e) => {
        e.preventDefault();
        const trimmed = userIdQuery.trim();
        if (!trimmed) return;

        const idNum = Number(trimmed);
        if (isNaN(idNum) || idNum <= 0) {
            toast("Введите корректный числовой ID пользователя", "warning");
            return;
        }

        setSearching(true);
        setFoundUser(null);
        try {
            const res = await restApi.users.getUserProfile(idNum);
            setFoundUser(res.data);
        } catch (err) {
            toast(err.response?.data?.message || "Пользователь с таким ID не найден", "error");
        } finally {
            setSearching(false);
        }
    };

    return (
        <div style={{ maxWidth: "800px", margin: "0 auto", width: "100%" }}>
            <Box>
                <h1>Поиск пользователей</h1>
                <p style={{ color: "#666", fontSize: "14px", marginTop: "4px" }}>
                    Найдите пользователя по его ID, чтобы просмотреть профиль и добавить в друзья
                </p>
                <form onSubmit={handleSearch} style={{ display: "flex", gap: "8px", marginTop: "12px" }}>
                    <div style={{ flex: 1 }}>
                        <Input
                            placeholder="Введите ID пользователя (например, 1, 2...)"
                            value={userIdQuery}
                            onChange={(e) => setUserIdQuery(e.target.value.replace(/\D/g, ""))}
                        />
                    </div>
                    <Button text={searching ? "Поиск..." : "Найти"} type="submit" />
                </form>
            </Box>

            {foundUser && (
                <Box>
                    <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                        <img
                            src={foundUser.avatarUrl || "https://placehold.co/80x80"}
                            alt={foundUser.username}
                            style={{ width: "64px", height: "64px", borderRadius: "50%", objectFit: "cover", cursor: "pointer" }}
                            onClick={() => navigate(`/profile/${foundUser.id}`)}
                        />
                        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "4px" }}>
                            <span
                                style={{ fontWeight: "bold", fontSize: "18px", cursor: "pointer", color: "#1d3557" }}
                                onClick={() => navigate(`/profile/${foundUser.id}`)}
                            >
                                {foundUser.username}
                            </span>
                            <span style={{ fontSize: "13px", color: "#888" }}>ID: #{foundUser.id}</span>
                            {foundUser.description && (
                                <p style={{ margin: "4px 0 0 0", fontSize: "14px", color: "#444" }}>
                                    {foundUser.description}
                                </p>
                            )}
                        </div>
                        <div>
                            <Button text="Открыть профиль" onClick={() => navigate(`/profile/${foundUser.id}`)} />
                        </div>
                    </div>
                </Box>
            )}
        </div>
    );
}
