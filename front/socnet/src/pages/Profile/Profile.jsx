import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Box from "../../components/Box/Box";
import Button from "../../components/Button/Button";
import Input from "../../components/Input/Input";
import { restApi } from "../../api/restApi";
import style from "./Profile.module.css";
import TextArea from "../../components/TextArea/TextArea";
import { useToast } from "../../components/Toast/Toast";
import ConfirmModal from "../../components/ConfirmModal/ConfirmModal";

export default function Profile({ isOwn }) {
    const { id } = useParams();
    const navigate = useNavigate();
    const toast = useToast();

    const [user, setUser] = useState(null);
    const [currentUser, setCurrentUser] = useState(null);
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);

    const [isEditingProfile, setIsEditingProfile] = useState(false);

    const [editUsername, setEditUsername] = useState("");
    const [editDescription, setEditDescription] = useState("");
    const [editAvatarUrl, setEditAvatarUrl] = useState("");

    const [newPostText, setNewPostText] = useState("");
    const [editingPostId, setEditingPostId] = useState(null);
    const [editingPostText, setEditingPostText] = useState("");

    // Модальные окна подтверждения
    const [postToDelete, setPostToDelete] = useState(null);
    const [isDeleteUserModalOpen, setIsDeleteUserModalOpen] = useState(false);

    // Статус дружбы: "LOADING" | "FRIEND" | "OUTGOING_PENDING" | "INCOMING_PENDING" | "NONE"
    const [friendshipStatus, setFriendshipStatus] = useState("LOADING");
    const [incomingRequestId, setIncomingRequestId] = useState(null);

    const USERNAME_REGEX = /^[a-zA-Zа-яА-ЯёЁ0-9_]{3,30}$/;

    const formatDate = (dateString) => {
        if (!dateString) return "";
        const date = new Date(dateString);
        return isNaN(date.getTime()) ? dateString : date.toLocaleString("ru-RU");
    };

    const checkFriendship = async (targetUserId) => {
        try {
            try {
                const chatRes = await restApi.chats.createOrOpenChat(targetUserId);
                if (chatRes.data) {
                    setFriendshipStatus("FRIEND");
                    return;
                }
            } catch (chatErr) {
                // Если 403 Forbidden, значит не друзья
            }

            const [incomingRes, outgoingRes] = await Promise.all([
                restApi.friends.getRequests("incoming").catch(() => ({ data: [] })),
                restApi.friends.getRequests("outgoing").catch(() => ({ data: [] }))
            ]);

            const incoming = Array.isArray(incomingRes.data) ? incomingRes.data : [];
            const outgoing = Array.isArray(outgoingRes.data) ? outgoingRes.data : [];

            const inReq = incoming.find((r) => String(r.userId) === String(targetUserId));
            if (inReq) {
                setFriendshipStatus("INCOMING_PENDING");
                setIncomingRequestId(inReq.id);
                return;
            }

            const outReq = outgoing.find((r) => String(r.userId) === String(targetUserId));
            if (outReq) {
                setFriendshipStatus("OUTGOING_PENDING");
                return;
            }

            setFriendshipStatus("NONE");
        } catch {
            setFriendshipStatus("NONE");
        }
    };

    useEffect(() => {
        setIsEditingProfile(false);

        async function loadProfileData() {
            try {
                setLoading(true);

                // Всегда загружаем профиль текущего авторизованного пользователя
                const meRes = await restApi.users.getMe().catch(() => ({ data: null }));
                if (meRes.data) {
                    try {
                        await restApi.admin.checkAdmin();
                        meRes.data.role = "ADMIN";
                    } catch {
                        meRes.data.role = meRes.data.role || "USER";
                    }
                    setCurrentUser(meRes.data);
                }

                if (isOwn) {
                    const myPostsRes = await restApi.posts.getMyPosts().catch(() => ({ data: [] }));
                    if (meRes.data) {
                        setUser(meRes.data);
                        setEditUsername(meRes.data.username || "");
                        setEditDescription(meRes.data.description || "");
                        setEditAvatarUrl(meRes.data.avatarUrl || "");
                    }
                    setPosts(Array.isArray(myPostsRes.data) ? myPostsRes.data : []);
                } else if (id) {
                    const userRes = await restApi.users.getUserProfile(id);
                    const userData = userRes.data;
                    if (meRes.data && String(meRes.data.id) === String(id)) {
                        userData.role = meRes.data.role;
                    }
                    setUser(userData);

                    // Проверяем статус дружбы
                    checkFriendship(id);

                    try {
                        const userPostsRes = await restApi.users.getUserPosts(id);
                        setPosts(Array.isArray(userPostsRes.data) ? userPostsRes.data : []);
                    } catch {
                        const feedRes = await restApi.posts.getFeed().catch(() => ({ data: [] }));
                        if (Array.isArray(feedRes.data)) {
                            setPosts(feedRes.data.filter((p) => String(p.authorId) === String(id)));
                        }
                    }
                }
            } catch (err) {
                console.error("Ошибка загрузки профиля:", err);
                toast(err.response?.data?.message || "Не удалось загрузить профиль", "error");
            } finally {
                setLoading(false);
            }
        }
        loadProfileData();
    }, [isOwn, id]);

    const handleSaveProfile = async (e) => {
        e.preventDefault();
        const trimmedUsername = editUsername.trim();
        const trimmedAvatarUrl = editAvatarUrl.trim();

        if (!USERNAME_REGEX.test(trimmedUsername)) {
            toast("Никнейм должен быть от 3 до 30 символов (латиница, кириллица, цифры или _)", "error");
            return;
        }

        if (trimmedAvatarUrl.length > 1000) {
            toast("URL аватарки слишком длинный (макс. 1000 символов)", "error");
            return;
        }

        try {
            const res = await restApi.users.updateProfile({
                username: trimmedUsername,
                description: editDescription.trim(),
                avatarUrl: trimmedAvatarUrl || null
            });
            setUser(res.data || {
                ...user,
                username: trimmedUsername,
                description: editDescription.trim(),
                avatarUrl: trimmedAvatarUrl || null
            });
            setIsEditingProfile(false);
            toast("Профиль обновлён!", "success");
        } catch (err) {
            toast(err.response?.data?.message || "Ошибка обновления профиля", "error");
        }
    };

    const handleCreatePost = async (e) => {
        e.preventDefault();
        if (!newPostText.trim()) return;

        try {
            const res = await restApi.posts.createPost({ content: newPostText.trim() });
            setPosts([res.data, ...posts]);
            setNewPostText("");
            toast("Запись опубликована!", "success");
        } catch (err) {
            toast(err.response?.data?.message || "Ошибка создания поста", "error");
        }
    };

    const handleSaveEditedPost = async (postId) => {
        if (!editingPostText.trim()) return;
        try {
            const res = await restApi.posts.updatePost(postId, { content: editingPostText.trim() });
            setPosts(posts.map((p) => (p.id === postId ? res.data : p)));
            setEditingPostId(null);
            setEditingPostText("");
            toast("Запись обновлена!", "success");
        } catch (err) {
            toast(err.response?.data?.message || "Ошибка редактирования поста", "error");
        }
    };

    const handleDeletePost = (postId) => {
        setPostToDelete(postId);
    };

    const confirmDeletePost = async () => {
        if (!postToDelete) return;
        try {
            await restApi.posts.deletePost(postToDelete);
            setPosts(posts.filter((p) => p.id !== postToDelete));
            toast("Запись удалена!", "success");
        } catch (err) {
            toast(err.response?.data?.message || "Ошибка удаления поста", "error");
        } finally {
            setPostToDelete(null);
        }
    };

    const handleAddFriend = async () => {
        try {
            await restApi.friends.sendRequest(user.id);
            setFriendshipStatus("OUTGOING_PENDING");
            toast("Заявка в друзья отправлена!", "success");
        } catch (err) {
            const msg = err.response?.data?.message || "";
            if (msg.includes("Вы уже друзья")) {
                setFriendshipStatus("FRIEND");
                toast("Вы уже друзья!", "info");
            } else if (msg.includes("Заявка уже отправлена")) {
                setFriendshipStatus("OUTGOING_PENDING");
                toast("Заявка уже была отправлена", "info");
            } else if (msg.includes("уже отправил вам заявку")) {
                setFriendshipStatus("INCOMING_PENDING");
                toast("Этот пользователь уже отправил вам заявку!", "info");
            } else {
                toast(msg || "Не удалось отправить заявку", "error");
            }
        }
    };

    const handleCancelRequest = async () => {
        try {
            await restApi.friends.cancelRequest(user.id);
            setFriendshipStatus("NONE");
            toast("Заявка отменена", "info");
        } catch (err) {
            toast(err.response?.data?.message || "Ошибка отмены заявки", "error");
        }
    };

    const handleAcceptRequest = async () => {
        if (!incomingRequestId) return;
        try {
            await restApi.friends.acceptRequest(incomingRequestId);
            await restApi.chats.createOrOpenChat(user.id).catch(() => {});
            setFriendshipStatus("FRIEND");
            toast("Заявка принята! Теперь вы друзья.", "success");
        } catch (err) {
            toast(err.response?.data?.message || "Ошибка принятия заявки", "error");
        }
    };

    const handleRejectRequest = async () => {
        if (!incomingRequestId) return;
        try {
            await restApi.friends.rejectRequest(incomingRequestId);
            setFriendshipStatus("NONE");
            toast("Заявка отклонена", "info");
        } catch (err) {
            toast(err.response?.data?.message || "Ошибка отклонения заявки", "error");
        }
    };

    const handleOpenChat = async () => {
        try {
            const res = await restApi.chats.createOrOpenChat(user.id);
            navigate(`/chats/${res.data.id}`);
        } catch (err) {
            toast(err.response?.data?.message || "Не удалось открыть чат", "error");
        }
    };

    const handleAdminDeleteUser = () => {
        if (!user) return;
        setIsDeleteUserModalOpen(true);
    };

    const confirmDeleteUser = async () => {
        if (!user) return;
        try {
            await restApi.admin.deleteUser(user.id);
            toast("Пользователь удалён", "success");
            navigate("/feed");
        } catch (err) {
            toast(err.response?.data?.message || "Ошибка удаления пользователя", "error");
        } finally {
            setIsDeleteUserModalOpen(false);
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

    const isModeratorOrAdmin =
        currentUser?.role === "ADMIN" || currentUser?.role === "MODERATOR";
    const isAdmin = currentUser?.role === "ADMIN";

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
                                <Button
                                    text={isEditingProfile ? "Отмена" : "Редактировать профиль"}
                                    onClick={() => setIsEditingProfile(!isEditingProfile)}
                                />
                            ) : (
                                <>
                                    {friendshipStatus === "FRIEND" && (
                                        <>
                                            <span style={{ color: "#2d6a4f", fontWeight: "bold", alignSelf: "center", marginRight: "8px" }}>
                                                ✓ В друзьях
                                            </span>
                                            <Button
                                                text="Написать сообщение"
                                                onClick={handleOpenChat}
                                            />
                                        </>
                                    )}

                                    {friendshipStatus === "OUTGOING_PENDING" && (
                                        <>
                                            <span style={{ color: "#666", alignSelf: "center", marginRight: "8px", fontSize: "14px" }}>
                                                Заявка отправлена
                                            </span>
                                            <Button
                                                text="Отменить заявку"
                                                onClick={handleCancelRequest}
                                            />
                                        </>
                                    )}

                                    {friendshipStatus === "INCOMING_PENDING" && (
                                        <>
                                            <Button
                                                text="Принять заявку"
                                                onClick={handleAcceptRequest}
                                            />
                                            <Button
                                                text="Отклонить"
                                                onClick={handleRejectRequest}
                                            />
                                        </>
                                    )}

                                    {friendshipStatus === "NONE" && (
                                        <Button
                                            text="Добавить в друзья"
                                            onClick={handleAddFriend}
                                        />
                                    )}
                                </>
                            )}
                        </div>

                        {/* Удаление пользователя администратором */}
                        {!isOwn && isAdmin && (
                            <div className={style.adminPanel}>
                                <Button
                                    text="Удалить аккаунт пользователя"
                                    onClick={handleAdminDeleteUser}
                                />
                            </div>
                        )}
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
                            <Input
                                placeholder="URL аватарки (необязательно)"
                                value={editAvatarUrl}
                                maxLength={1000}
                                onChange={(e) => setEditAvatarUrl(e.target.value)}
                            />
                            {editAvatarUrl && (
                                <img
                                    src={editAvatarUrl}
                                    alt="Предпросмотр аватарки"
                                    className={style.avatarPreview}
                                    onError={(e) => { e.target.style.display = "none"; }}
                                    onLoad={(e) => { e.target.style.display = "block"; }}
                                />
                            )}
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

            {posts.map((post) => {
                const isAuthor = isOwn || (currentUser && Number(post.authorId) === Number(currentUser.id));
                const canDelete = isAuthor || isModeratorOrAdmin;

                return (
                    <Box key={post.id}>
                        <div className={style.postHeader}>
                            <img
                                src={user.avatarUrl || "https://placehold.co/100x100"}
                                alt="avatar"
                                className={style.smallAvatar}
                            />
                            <div>
                                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                                    <strong>{user.username}</strong>
                                    {renderRoleBadge(user.role)}
                                </div>
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
                            <p style={{ wordBreak: "break-word", overflowWrap: "anywhere" }}>{post.content}</p>
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
                            {isAuthor && editingPostId !== post.id && (
                                <Button
                                    text="Изменить"
                                    onClick={() => {
                                        setEditingPostId(post.id);
                                        setEditingPostText(post.content);
                                    }}
                                />
                            )}
                            {canDelete && editingPostId !== post.id && (
                                <Button
                                    text={!isAuthor && isModeratorOrAdmin ? "Удалить (модерация)" : "Удалить"}
                                    onClick={() => handleDeletePost(post.id)}
                                />
                            )}
                        </div>
                    </Box>
                );
            })}

            <ConfirmModal
                isOpen={!!postToDelete}
                title="Удаление публикации"
                message="Вы действительно хотите удалить эту запись? Это действие необратимо."
                confirmText="Удалить"
                cancelText="Отмена"
                onConfirm={confirmDeletePost}
                onCancel={() => setPostToDelete(null)}
            />

            <ConfirmModal
                isOpen={isDeleteUserModalOpen}
                title="Удаление аккаунта"
                message={`Вы уверены, что хотите удалить аккаунт пользователя ${user?.username}? Все связанные с ним публикации, комментарии и сообщения будут безвозвратно удалены.`}
                confirmText="Удалить аккаунт"
                cancelText="Отмена"
                onConfirm={confirmDeleteUser}
                onCancel={() => setIsDeleteUserModalOpen(false)}
            />
        </div>
    );
}
