import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Box from "../../components/Box/Box";
import Button from "../../components/Button/Button";
import Input from "../../components/Input/Input";
import { restApi } from "../../api/restApi";
import style from "./Profile.module.css";
import TextArea from "../../components/TextArea/TextArea";


export default function Profile({ isOwn }) {
    const { id } = useParams();
    const navigate = useNavigate();

    const [user, setUser] = useState(null);
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);

    const [isEditingProfile, setIsEditingProfile] = useState(false);
    const [isChangingPassword, setIsChangingPassword] = useState(false);

    const [editUsername, setEditUsername] = useState("");
    const [editDescription, setEditDescription] = useState("");

    const [oldPassword, setOldPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");

    const [newPostText, setNewPostText] = useState("");
    const [editingPostId, setEditingPostId] = useState(null);
    const [editingPostText, setEditingPostText] = useState("");

    const [friendRequested, setFriendRequested] = useState(false);

    const USERNAME_REGEX = /^[a-zA-Zа-яА-ЯёЁ0-9_]{3,30}$/;

    const formatDate = (dateString) => {
        if (!dateString) return "";
        const date = new Date(dateString);
        return isNaN(date.getTime()) ? dateString : date.toLocaleString("ru-RU");
    };

    useEffect(() => {
        setIsEditingProfile(false);
        setIsChangingPassword(false);

        async function loadProfileData() {
            try {
                setLoading(true);
                if (isOwn) {
                    const [meRes, myPostsRes] = await Promise.all([
                        restApi.users.getMe(),
                        restApi.posts.getMyPosts()
                    ]);
                    setUser(meRes.data);
                    setEditUsername(meRes.data.username || "");
                    setEditDescription(meRes.data.description || "");
                    setPosts(Array.isArray(myPostsRes.data) ? myPostsRes.data : []);
                } else if (id) {
                    const userRes = await restApi.users.getUserProfile(id);
                    setUser(userRes.data);
                    try {
                        const userPostsRes = await restApi.users.getUserPosts(id);
                        setPosts(Array.isArray(userPostsRes.data) ? userPostsRes.data : []);
                    } catch {
                        // Если эндпоинт чужих постов ещё не добавлен на бэке — фильтруем из общей ленты
                        const feedRes = await restApi.posts.getFeed();
                        if (Array.isArray(feedRes.data)) {
                            setPosts(feedRes.data.filter((p) => String(p.authorId) === String(id)));
                        }
                    }
                }
            } catch (err) {
                console.error("Ошибка загрузки профиля:", err);
                alert(err.response?.data?.message || "Не удалось загрузить профиль");
            } finally {
                setLoading(false);
            }
        }
        loadProfileData();
    }, [isOwn, id]);

    const handleSaveProfile = async (e) => {
        e.preventDefault();
        const trimmedUsername = editUsername.trim();

        if (!USERNAME_REGEX.test(trimmedUsername)) {
            alert("Никнейм должен быть от 3 до 30 символов (латиница, кириллица, цифры или _)");
            return;
        }

        try {
            const res = await restApi.users.updateProfile({
                username: trimmedUsername,
                description: editDescription.trim()
            });
            setUser(res.data || { ...user, username: trimmedUsername, description: editDescription.trim() });
            setIsEditingProfile(false);
            alert("Профиль обновлён!");
        } catch (err) {
            alert(err.response?.data?.message || "Ошибка обновления профиля");
        }
    };

    const handleChangePassword = async (e) => {
        e.preventDefault();
        if (newPassword.length < 6) {
            alert("Новый пароль должен быть не короче 6 символов!");
            return;
        }

        try {
            await restApi.users.changePassword({ oldPassword, newPassword });
            alert("Пароль успешно изменён!");
            setOldPassword("");
            setNewPassword("");
            setIsChangingPassword(false);
        } catch (err) {
            alert(err.response?.data?.message || "Ошибка смены пароля");
        }
    };

    const handleCreatePost = async (e) => {
        e.preventDefault();
        if (!newPostText.trim()) return;

        try {
            const res = await restApi.posts.createPost({ content: newPostText.trim() });
            setPosts([res.data, ...posts]);
            setNewPostText("");
        } catch (err) {
            alert(err.response?.data?.message || "Ошибка создания поста");
        }
    };

    const handleSaveEditedPost = async (postId) => {
        if (!editingPostText.trim()) return;
        try {
            const res = await restApi.posts.updatePost(postId, { content: editingPostText.trim() });
            setPosts(posts.map((p) => (p.id === postId ? res.data : p)));
            setEditingPostId(null);
            setEditingPostText("");
        } catch (err) {
            alert(err.response?.data?.message || "Ошибка редактирования поста");
        }
    };

    const handleDeletePost = async (postId) => {
        try {
            await restApi.posts.deletePost(postId);
            setPosts(posts.filter((p) => p.id !== postId));
        } catch (err) {
            alert(err.response?.data?.message || "Ошибка удаления поста");
        }
    };

    const handleAddFriend = async () => {
        try {
            await restApi.friends.sendRequest(user.id);
            setFriendRequested(true);
        } catch (err) {
            alert(err.response?.data?.message || "Заявка отправлена (или эндпоинт в разработке)");
            setFriendRequested(true);
        }
    };

    const renderRoleBadge = (role) => {
        if (role === "ADMIN") {
            return <span className={style.roleAdmin}>Админ</span>;
        }
        if (role === "MODERATOR") {
            return <span className={style.roleModerator}>Модератор</span>;
        }
        return null;
    };

    if (loading) {
        return (
            <div className={style.profileWrapper}>
                <Box><p>Загрузка профиля...</p></Box>
            </div>
        );
    }

    if (!user) {
        return (
            <div className={style.profileWrapper}>
                <Box><p>Пользователь не найден.</p></Box>
            </div>
        );
    }

    return (
        <div className={style.profileWrapper}>
            <Box>
                <div className={style.topSection}>
                    <img
                        src={user.avatarUrl || "https://placehold.co/200x200"}
                        alt="Аватар"
                        className={style.bigAvatar}
                    />

                    <div className={style.userDetails}>
                        <div className={style.nameRow}>
                            <h1 className={style.nickname}>{user.username}</h1>
                            {renderRoleBadge(user.role)}
                        </div>

                        <span className={style.metaText}>
                            Аккаунт создан: {formatDate(user.createdAt)}
                        </span>

                        {isOwn && (
                            <div className={style.privateInfo}>
                                <span><strong>Почта:</strong> {user.email || "Не указана"}</span>
                                <span><strong>Телефон:</strong> {user.phone || "Не указан"}</span>
                            </div>
                        )}

                        <div className={style.bioBlock}>
                            <strong>О себе: </strong>
                            {user.description
                                ? user.description
                                : "Пользователь пока ничего не рассказал о себе."}
                        </div>

                        <div className={style.controlsRow}>
                            {isOwn ? (
                                <>
                                    <Button
                                        text={isEditingProfile ? "Отмена" : "Редактировать профиль"}
                                        onClick={() => {
                                            setIsEditingProfile(!isEditingProfile);
                                            setIsChangingPassword(false);
                                        }}
                                    />
                                    <Button
                                        text={isChangingPassword ? "Отмена" : "Изменить пароль"}
                                        onClick={() => {
                                            setIsChangingPassword(!isChangingPassword);
                                            setIsEditingProfile(false);
                                        }}
                                    />
                                </>
                            ) : (
                                <Button
                                    text={friendRequested ? "Заявка отправлена" : "Добавить в друзья"}
                                    onClick={handleAddFriend}
                                />
                            )}
                        </div>
                    </div>
                </div>

                {isOwn && isEditingProfile && (
                    <form className={style.editForm} onSubmit={handleSaveProfile}>
                        <div className={style.fieldGroup}>
                            <Input
                                placeholder="Никнейм (3-30 символов)"
                                value={editUsername}
                                maxLength={30}
                                onChange={(e) => setEditUsername(e.target.value)}
                            />
                            <span
                                className={`${style.charCounter} ${
                                    editUsername.length >= 30 ? style.charCounterLimit : ""
                                }`}
                            >
                                {editUsername.length} / 30
                            </span>
                        </div>

                        <div className={style.fieldGroup}>
                            <TextArea
                                placeholder="Расскажите о себе (до 500 символов)..."
                                value={editDescription}
                                maxLength={500}
                                onChange={(e) => setEditDescription(e.target.value)}
                            />
                            <span
                                className={`${style.charCounter} ${
                                    editDescription.length >= 500 ? style.charCounterLimit : ""
                                }`}
                            >
                                {editDescription.length} / 500
                            </span>
                        </div>

                        <div>
                            <Button text="Сохранить изменения" type="submit" />
                        </div>
                    </form>
                )}

                {isOwn && isChangingPassword && (
                    <form className={style.editForm} onSubmit={handleChangePassword}>
                        <Input
                            type="password"
                            placeholder="Старый пароль"
                            value={oldPassword}
                            onChange={(e) => setOldPassword(e.target.value)}
                        />
                        <Input
                            type="password"
                            placeholder="Новый пароль (от 6 символов)"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                        />
                        <div>
                            <Button text="Обновить пароль" type="submit" />
                        </div>
                    </form>
                )}
            </Box>

            {isOwn && (
                <Box>
                    <h3>Новая запись</h3>
                    <form className={style.editForm} onSubmit={handleCreatePost}>
                        <TextArea
                            placeholder="Что у вас нового?"
                            value={newPostText}
                            onChange={(e) => setNewPostText(e.target.value)}
                        />
                        <div>
                            <Button text="Опубликовать" type="submit" />
                        </div>
                    </form>
                </Box>
            )}

            <Box>
                <h2>Записи пользователя ({posts.length})</h2>
            </Box>

            {posts.map((post) => (
                <Box key={post.id}>
                    <div className={style.postHeader}>
                        <img
                            src={user.avatarUrl || "https://placehold.co/100x100"}
                            alt="avatar"
                            className={style.smallAvatar}
                        />
                        <div>
                            <strong>{user.username}</strong>
                            <div className={style.metaText}>
                                {formatDate(post.createdAt)}
                                {post.updatedAt && ` (изм. ${formatDate(post.updatedAt)})`}
                            </div>
                        </div>
                    </div>

                    {editingPostId === post.id ? (
                        <div className={style.editForm}>
                            <TextArea
                                value={editingPostText}
                                onChange={(e) => setEditingPostText(e.target.value)}
                            />
                            <div style={{ display: "flex", gap: "8px" }}>
                                <Button
                                    text="Сохранить"
                                    onClick={() => handleSaveEditedPost(post.id)}
                                />
                                <Button
                                    text="Отмена"
                                    onClick={() => {
                                        setEditingPostId(null);
                                        setEditingPostText("");
                                    }}
                                />
                            </div>
                        </div>
                    ) : (
                        <p style={{ wordBreak: "break-word" }}>{post.content}</p>
                    )}

                    <div className={style.actions}>
                        <Button
                            text="Лайк"
                            onClick={() => restApi.likes.likePost(post.id)}
                        />
                        <Button
                            text="Комментарии"
                            onClick={() => navigate(`/post/${post.id}/comments`)}
                        />
                        {isOwn && editingPostId !== post.id && (
                            <>
                                <Button
                                    text="Изменить"
                                    onClick={() => {
                                        setEditingPostId(post.id);
                                        setEditingPostText(post.content);
                                    }}
                                />
                                <Button
                                    text="Удалить"
                                    onClick={() => handleDeletePost(post.id)}
                                />
                            </>
                        )}
                    </div>
                </Box>
            ))}
        </div>
    );
}