import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../../components/Button/Button";
import Box from "../../components/Box/Box";
import Input from "../../components/Input/Input";
import { restApi } from "../../api/restApi";
import style from "./Feed.module.css";
import TextArea from "../../components/TextArea/TextArea";
import { useToast } from "../../components/Toast/Toast";
import ConfirmModal from "../../components/ConfirmModal/ConfirmModal";
import LikesModal from "../../components/LikesModal/LikesModal";

export default function Feed() {
    const navigate = useNavigate();
    const toast = useToast();

    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [visibleCount, setVisibleCount] = useState(5);
    const [expandedPosts, setExpandedPosts] = useState({});
    const [likesData, setLikesData] = useState({});
    const [likesModalData, setLikesModalData] = useState({ isOpen: false, likes: [] });
    const [newPostText, setNewPostText] = useState("");
    const [newPostImageUrl, setNewPostImageUrl] = useState("");
    const [postToDelete, setPostToDelete] = useState(null);

    // Данные текущего пользователя
    const [myId, setMyId] = useState(null);
    const [myRole, setMyRole] = useState(null);

    const loadFeed = async () => {
        try {
            setLoading(true);

            // Загружаем свой профиль параллельно с лентой
            const [feedRes, myRes, meRes] = await Promise.all([
                restApi.posts.getFeed().catch(() => ({ data: [] })),
                restApi.posts.getMyPosts().catch(() => ({ data: [] })),
                restApi.users.getMe().catch(() => ({ data: null })),
            ]);

            if (meRes.data) {
                setMyId(meRes.data.id);
                let role = meRes.data.role;
                try {
                    await restApi.admin.checkAdmin();
                    role = "ADMIN";
                } catch {
                    role = role || "USER";
                }
                setMyRole(role);
            }

            const feedPosts = Array.isArray(feedRes.data) ? feedRes.data : [];
            const myPosts = Array.isArray(myRes.data) ? myRes.data : [];

            const mergedMap = new Map();
            [...feedPosts, ...myPosts].forEach((post) => {
                mergedMap.set(post.id, post);
            });

            const sortedPosts = Array.from(mergedMap.values()).sort(
                (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
            );

            setPosts(sortedPosts);

            // Загружаем лайки для первых постов
            if (meRes.data) {
                const userId = meRes.data.id;
                const likeChecks = await Promise.allSettled(
                    sortedPosts.slice(0, 15).map(async (post) => {
                        const res = await restApi.likes.getLikes(post.id);
                        const users = Array.isArray(res.data) ? res.data : [];
                        const liked = users.some((l) => Number(l.userId) === Number(userId));
                        return { postId: post.id, liked, count: users.length, users };
                    })
                );
                const newLikesMap = {};
                likeChecks.forEach((r) => {
                    if (r.status === "fulfilled") {
                        newLikesMap[r.value.postId] = {
                            liked: r.value.liked,
                            count: r.value.count,
                            users: r.value.users
                        };
                    }
                });
                setLikesData(newLikesMap);
            }
        } catch (error) {
            console.error("Ошибка загрузки ленты:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadFeed();
    }, []);

    const handleCreatePost = async (e) => {
        e.preventDefault();
        const trimmedContent = newPostText.trim();
        const trimmedImageUrl = newPostImageUrl.trim();
        if (!trimmedContent) {
            toast("Текст публикации не может быть пустым", "warning");
            return;
        }

        try {
            const res = await restApi.posts.createPost({
                content: trimmedContent,
                imageUrl: trimmedImageUrl || null
            });
            setNewPostText("");
            setNewPostImageUrl("");
            if (res.data) {
                setPosts((prev) => [res.data, ...prev]);
                setLikesData((prev) => ({
                    ...prev,
                    [res.data.id]: { liked: false, count: 0, users: [] }
                }));
                toast("Пост опубликован!", "success");
            } else {
                loadFeed();
            }
        } catch (error) {
            toast(error.response?.data?.message || "Не удалось опубликовать пост", "error");
        }
    };

    const handleToggleLike = async (postId) => {
        const current = likesData[postId] || { liked: false, count: 0, users: [] };
        const isCurrentlyLiked = current.liked;
        const newCount = isCurrentlyLiked ? Math.max(0, current.count - 1) : current.count + 1;

        setLikesData((prev) => ({
            ...prev,
            [postId]: {
                ...current,
                liked: !isCurrentlyLiked,
                count: newCount
            }
        }));

        try {
            if (isCurrentlyLiked) {
                await restApi.likes.unlikePost(postId);
            } else {
                await restApi.likes.likePost(postId);
            }
            // Тихо обновляем список пользователей для актуальности
            const updated = await restApi.likes.getLikes(postId);
            const users = Array.isArray(updated.data) ? updated.data : [];
            setLikesData((prev) => ({
                ...prev,
                [postId]: {
                    liked: !isCurrentlyLiked,
                    count: users.length,
                    users
                }
            }));
        } catch (error) {
            // Откатываем в случае ошибки сети
            setLikesData((prev) => ({ ...prev, [postId]: current }));
            console.log("Ошибка лайка:", error.response?.status || error.message);
        }
    };

    const handleOpenLikesModal = async (postId) => {
        const current = likesData[postId];
        if (current?.users && current.users.length > 0) {
            setLikesModalData({ isOpen: true, likes: current.users });
        } else {
            try {
                const res = await restApi.likes.getLikes(postId);
                const users = Array.isArray(res.data) ? res.data : [];
                setLikesData((prev) => ({
                    ...prev,
                    [postId]: {
                        liked: prev[postId]?.liked || false,
                        count: users.length,
                        users
                    }
                }));
                setLikesModalData({ isOpen: true, likes: users });
            } catch {
                setLikesModalData({ isOpen: true, likes: [] });
            }
        }
    };

    const handleDeletePost = (postId) => {
        setPostToDelete(postId);
    };

    const confirmDeletePost = async () => {
        if (!postToDelete) return;
        try {
            await restApi.posts.deletePost(postToDelete);
            setPosts((prev) => prev.filter((p) => p.id !== postToDelete));
            toast("Пост удалён!", "success");
        } catch (err) {
            toast(err.response?.data?.message || "Ошибка удаления поста", "error");
        } finally {
            setPostToDelete(null);
        }
    };

    const toggleExpand = (postId) => {
        setExpandedPosts((prev) => ({
            ...prev,
            [postId]: !prev[postId]
        }));
    };

    const formatDate = (dateString) => {
        if (!dateString) return "";
        const date = new Date(dateString);
        return isNaN(date.getTime()) ? dateString : date.toLocaleString("ru-RU");
    };

    const handleAuthorClick = (authorId) => {
        if (myId && String(authorId) === String(myId)) {
            navigate("/profile/me");
        } else {
            navigate(`/profile/${authorId}`);
        }
    };

    const visiblePosts = posts.slice(0, visibleCount);
    const MAX_LENGTH = 250;
    const isModeratorOrAdmin = myRole === "ADMIN" || myRole === "MODERATOR";

    return (
        <div className={style.feedWrapper}>
            <Box>
                <h1>Лента</h1>
                <form
                    onSubmit={handleCreatePost}
                    style={{ display: "flex", flexDirection: "column", gap: "8px", marginTop: "10px" }}
                >
                    <TextArea
                        placeholder="Что у вас нового? (до 5000 символов)"
                        maxLength={5000}
                        value={newPostText}
                        onChange={(e) => setNewPostText(e.target.value)}
                    />
                    <Input
                        placeholder="Ссылка на картинку (необязательно, https://...)"
                        maxLength={1000}
                        value={newPostImageUrl}
                        onChange={(e) => setNewPostImageUrl(e.target.value)}
                    />
                    {newPostImageUrl && (
                        <div style={{ margin: "4px 0" }}>
                            <img
                                src={newPostImageUrl}
                                alt="Предпросмотр изображения"
                                style={{ maxHeight: "200px", maxWidth: "100%", borderRadius: "8px", objectFit: "cover" }}
                                onError={(e) => { e.target.style.display = "none"; }}
                                onLoad={(e) => { e.target.style.display = "block"; }}
                            />
                        </div>
                    )}
                    <div style={{ display: "flex", justifyContent: "flex-end" }}>
                        <Button text="Опубликовать" type="submit" />
                    </div>
                </form>
            </Box>

            {loading ? (
                <Box>
                    <p>Загрузка ленты...</p>
                </Box>
            ) : posts.length === 0 ? (
                <Box>
                    <p>В ленте пока нет записей. Напишите первый пост!</p>
                </Box>
            ) : (
                visiblePosts.map((post) => {
                    const isLong = post.content && post.content.length > MAX_LENGTH;
                    const isExpanded = !!expandedPosts[post.id];
                    const likeInfo = likesData[post.id] || { liked: false, count: 0, users: [] };
                    const isLiked = likeInfo.liked;
                    const likesCount = likeInfo.count;
                    const isAuthor = myId && Number(post.authorId) === Number(myId);
                    const canDelete = isAuthor || isModeratorOrAdmin;

                    const textToShow =
                        isLong && !isExpanded
                            ? post.content.slice(0, MAX_LENGTH) + "..."
                            : post.content;

                    return (
                        <Box key={post.id}>
                            <div
                                className={style.postHeader}
                                onClick={() => handleAuthorClick(post.authorId)}
                            >
                                <img
                                    src={post.authorAvatarUrl || "https://placehold.co/100x100"}
                                    alt="avatar"
                                    className={style.avatar}
                                />
                                <div className={style.authorInfo}>
                                    <div className={style.nameRow}>
                                        <span className={style.nickname}>{post.authorUsername}</span>
                                        {isAuthor && myRole === "ADMIN" && (
                                            <span className={style.roleBadgeAdmin}>Админ</span>
                                        )}
                                        {isAuthor && myRole === "MODERATOR" && (
                                            <span className={style.roleBadgeMod}>Модератор</span>
                                        )}
                                    </div>
                                    <span className={style.dates}>
                                        {formatDate(post.createdAt)}
                                        {post.updatedAt && ` (изм. ${formatDate(post.updatedAt)})`}
                                    </span>
                                </div>
                            </div>

                            <p className={style.postText}>{textToShow}</p>

                            {post.imageUrl && (
                                <img
                                    src={post.imageUrl}
                                    alt="Вложение"
                                    style={{ maxWidth: "100%", maxHeight: "500px", objectFit: "cover", borderRadius: "10px", marginBottom: "10px" }}
                                />
                            )}

                            {isLong && (
                                <div style={{ marginBottom: "8px" }}>
                                    <Button
                                        text={isExpanded ? "Свернуть" : "Читать далее..."}
                                        onClick={() => toggleExpand(post.id)}
                                    />
                                </div>
                            )}

                            <div className={style.actions}>
                                <Button
                                    text={isLiked ? `❤️ ${likesCount}` : `🤍 ${likesCount}`}
                                    onClick={() => handleToggleLike(post.id)}
                                />
                                {likesCount > 0 && (
                                    <Button
                                        text="Кто оценил"
                                        onClick={() => handleOpenLikesModal(post.id)}
                                    />
                                )}
                                <Button
                                    text="Комментарии"
                                    onClick={() => navigate(`/post/${post.id}/comments`)}
                                />
                                {canDelete && (
                                    <Button
                                        text={!isAuthor && isModeratorOrAdmin ? "Удалить (модерация)" : "Удалить"}
                                        onClick={() => handleDeletePost(post.id)}
                                    />
                                )}
                            </div>
                        </Box>
                    );
                })
            )}

            {visibleCount < posts.length && (
                <div className={style.loadMoreWrapper}>
                    <Button text="Загрузить ещё" onClick={() => setVisibleCount((prev) => prev + 5)} />
                </div>
            )}

            <ConfirmModal
                isOpen={!!postToDelete}
                title="Удаление публикации"
                message="Вы действительно хотите удалить этот пост? Это действие нельзя будет отменить."
                confirmText="Удалить"
                cancelText="Отмена"
                onConfirm={confirmDeletePost}
                onCancel={() => setPostToDelete(null)}
            />

            <LikesModal
                isOpen={likesModalData.isOpen}
                likes={likesModalData.likes}
                currentUserId={myId}
                onClose={() => setLikesModalData({ isOpen: false, likes: [] })}
            />
        </div>
    );
}
