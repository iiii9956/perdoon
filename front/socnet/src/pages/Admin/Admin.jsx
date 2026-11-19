import { useState } from "react";
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

    // Поиск пользователя по ID
    const [searchQuery, setSearchQuery] = useState("");
    const [foundUser, setFoundUser] = useState(null);
    const [searching, setSearching] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

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
        } catch (err) {
            toast(err.response?.data?.message || "Ошибка удаления пользователя", "error");
        } finally {
            setIsDeleteModalOpen(false);
        }
    };

    return (
        <div className={style.adminWrapper}>
            <Box>
                <h1>Панель администратора</h1>
                <p className={style.subtitle}>Управление пользователями системы</p>
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
                        </div>
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
