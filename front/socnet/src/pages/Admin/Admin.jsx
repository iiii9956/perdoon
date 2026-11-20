import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Box from "../../components/Box/Box";
import Button from "../../components/Button/Button";
import Input from "../../components/Input/Input";
import { restApi } from "../../api/restApi";
import { useToast } from "../../components/Toast/Toast";
import ConfirmModal from "../../components/ConfirmModal/ConfirmModal";
import style from "./Admin.module.css";

export default function Admin() {
    const navigate = useNavigate();
    const toast = useToast();

    const [userCount, setUserCount] = useState(null);
    const [currentUser, setCurrentUser] = useState(null);

    // Поиск пользователя по ID
    const [searchQuery, setSearchQuery] = useState("");
    const [foundUser, setFoundUser] = useState(null);
    const [searching, setSearching] = useState(false);
    const [selectedRole, setSelectedRole] = useState("USER");
    const [savingRole, setSavingRole] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

    useEffect(() => {
        async function loadAdminData() {
            try {
                const [countRes, meRes] = await Promise.all([
                    restApi.users.getUsersCount().catch(() => null),
                    restApi.users.getMe().catch(() => null)
                ]);
                if (countRes && typeof countRes.data === "number") {
                    setUserCount(countRes.data);
                }
                if (meRes?.data) {
                    setCurrentUser(meRes.data);
                }
            } catch (e) {
                console.error("Ошибка загрузки данных админ-панели:", e);
            }
        }
        loadAdminData();
    }, []);

    const formatDate = (dateString) => {
        if (!dateString) return "";
        const date = new Date(dateString);
        return isNaN(date.getTime()) ? dateString : date.toLocaleString("ru-RU");
    };

    const handleSearch = async (e) => {
        e.preventDefault();
        if (!searchQuery.trim()) return;
        setSearching(true);
        setFoundUser(null);

        try {
            const id = Number(searchQuery.trim());
            if (!isNaN(id) && id > 0) {
                const res = await restApi.users.getUserProfile(id);
                setFoundUser(res.data);
                setSelectedRole(res.data?.role || "USER");
            } else {
                toast("Введите числовой ID пользователя", "warning");
            }
        } catch (err) {
            const status = err.response?.status;
            if (status === 403) {
                toast("Доступ запрещён. Только администраторы могут просматривать эти данные.", "error");
            } else if (status === 404) {
                toast("Пользователь не найден", "error");
            } else {
                toast(err.response?.data?.message || "Ошибка поиска", "error");
            }
        } finally {
            setSearching(false);
        }
    };

    const handleChangeRole = async () => {
        if (!foundUser) return;
        if (currentUser && Number(currentUser.id) === Number(foundUser.id)) {
            toast("Нельзя изменять собственную роль", "warning");
            return;
        }

        setSavingRole(true);
        try {
            const res = await restApi.admin.changeUserRole(foundUser.id, selectedRole);
            const newRole = res.data?.role || selectedRole;
            setFoundUser((prev) => ({ ...prev, role: newRole }));
            toast(`Роль пользователя изменена на ${newRole}`, "success");
        } catch (err) {
            const status = err.response?.status;
            if (status === 409) {
                toast("Нельзя изменить роль последнего администратора", "error");
            } else if (status === 403) {
                toast("Недостаточно прав для изменения роли", "error");
            } else {
                toast(err.response?.data?.message || "Ошибка изменения роли", "error");
            }
        } finally {
            setSavingRole(false);
        }
    };

    const handleDeleteUser = () => {
        if (!foundUser) return;
        setIsDeleteModalOpen(true);
    };

    const confirmDeleteUser = async () => {
        if (!foundUser) return;
        try {
            await restApi.admin.deleteUser(foundUser.id);
            toast("Пользователь удалён", "success");
            setFoundUser(null);
            setSearchQuery("");
            // Обновляем счетчик пользователей
            const countRes = await restApi.users.getUsersCount().catch(() => null);
            if (countRes && typeof countRes.data === "number") {
                setUserCount(countRes.data);
            }
        } catch (err) {
            toast(err.response?.data?.message || "Ошибка удаления пользователя", "error");
        } finally {
            setIsDeleteModalOpen(false);
        }
    };

    const isMyself = currentUser && foundUser && Number(currentUser.id) === Number(foundUser.id);

    return (
        <div className={style.adminWrapper}>
            <Box>
                <h1>Панель администратора</h1>
                <p className={style.subtitle}>Управление пользователями системы</p>
            </Box>

            <Box>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div>
                        <h3 style={{ margin: "0 0 4px 0", color: "#1d3557" }}>Статистика платформы</h3>
                        <span style={{ color: "#666", fontSize: "14px" }}>Всего зарегистрировано пользователей:</span>
                    </div>
                    <span style={{ fontSize: "28px", fontWeight: "bold", color: "#457b9d" }}>
                        {userCount !== null ? userCount : "..."}
                    </span>
                </div>
            </Box>

            <Box>
                <h3>Найти пользователя по ID</h3>
                <form className={style.searchForm} onSubmit={handleSearch}>
                    <Input
                        placeholder="ID пользователя (число)"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value.replace(/\D/g, ""))}
                    />
                    <Button text={searching ? "Поиск..." : "Найти"} type="submit" />
                </form>
            </Box>

            {foundUser && (
                <Box>
                    <div className={style.userCard}>
                        <img
                            src={foundUser.avatarUrl || "https://placehold.co/60x60"}
                            alt={foundUser.username}
                            className={style.userAvatar}
                            onClick={() => navigate(`/profile/${foundUser.id}`)}
                        />
                        <div className={style.userInfo}>
                            <span
                                className={style.username}
                                onClick={() => navigate(`/profile/${foundUser.id}`)}
                            >
                                {foundUser.username}
                            </span>
                            <span className={style.meta}>ID: #{foundUser.id}</span>
                            {foundUser.email && <span className={style.meta}>Почта: {foundUser.email}</span>}
                            {foundUser.phone && <span className={style.meta}>Телефон: {foundUser.phone}</span>}
                            {foundUser.createdAt && (
                                <span className={style.meta}>
                                    Зарегистрирован: {formatDate(foundUser.createdAt)}
                                </span>
                            )}
                            {foundUser.role && (
                                <span className={style.meta}>
                                    Текущая роль: <strong>{foundUser.role}</strong>
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Смена роли пользователя */}
                    <div style={{ marginTop: "8px", marginBottom: "16px", padding: "12px", background: "#f8f9fa", borderRadius: "8px", border: "1px solid #e9ecef" }}>
                        <h4 style={{ margin: "0 0 8px 0", fontSize: "14px", color: "#333" }}>Назначение роли</h4>
                        {isMyself ? (
                            <p style={{ margin: 0, fontSize: "13px", color: "#888" }}>
                                Вы не можете изменить роль собственного аккаунта.
                            </p>
                        ) : (
                            <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
                                <select
                                    value={selectedRole}
                                    onChange={(e) => setSelectedRole(e.target.value)}
                                    style={{
                                        padding: "6px 12px",
                                        borderRadius: "8px",
                                        border: "1px solid #ccc",
                                        fontSize: "14px",
                                        cursor: "pointer",
                                        background: "white"
                                    }}
                                >
                                    <option value="USER">USER (Обычный пользователь)</option>
                                    <option value="MODERATOR">MODERATOR (Модератор)</option>
                                    <option value="ADMIN">ADMIN (Администратор)</option>
                                </select>
                                <Button
                                    text={savingRole ? "Сохранение..." : "Сохранить роль"}
                                    onClick={handleChangeRole}
                                    disabled={savingRole}
                                />
                            </div>
                        )}
                    </div>

                    {/* Удаление пользователя: просто красная область с кнопкой без лишних надписей */}
                    <div className={style.dangerZone}>
                        <Button text="Удалить пользователя" onClick={handleDeleteUser} />
                    </div>
                </Box>
            )}

            <ConfirmModal
                isOpen={isDeleteModalOpen}
                title="Удаление пользователя"
                message={`Вы действительно хотите удалить пользователя ${foundUser?.username}? Это действие необратимо.`}
                confirmText="Удалить"
                cancelText="Отмена"
                onConfirm={confirmDeleteUser}
                onCancel={() => setIsDeleteModalOpen(false)}
            />
        </div>
    );
}
