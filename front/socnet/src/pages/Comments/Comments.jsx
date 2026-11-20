import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Box from "../../components/Box/Box";
import Button from "../../components/Button/Button";
import Input from "../../components/Input/Input";
import { restApi } from "../../api/restApi";
import TextArea from "../../components/TextArea/TextArea";
import { useToast } from "../../components/Toast/Toast";
import ConfirmModal from "../../components/ConfirmModal/ConfirmModal";

export default function Comments() {
    const { id } = useParams(); // postId
    const navigate = useNavigate();
    const toast = useToast();

    const [post, setPost] = useState(null);
    const [comments, setComments] = useState([]);
    const [currentUser, setCurrentUser] = useState(null);

    const [newComment, setNewComment] = useState("");
    const [editingId, setEditingId] = useState(null);
    const [editingText, setEditingText] = useState("");
    const [commentToDelete, setCommentToDelete] = useState(null);

    const formatDate = (dateString) => {
        if (!dateString) return "";
        const date = new Date(dateString);
        return isNaN(date.getTime()) ? dateString : date.toLocaleString("ru-RU");
    };

    useEffect(() => {
        async function loadData() {
            try {
                const [commentsRes, meRes] = await Promise.all([
                    restApi.comments.getPostComments(id).catch(() => ({ data: [] })),
                    restApi.users.getMe().catch(() => ({ data: null }))
                ]);
                setComments(Array.isArray(commentsRes.data) ? commentsRes.data : []);
                if (meRes.data) {
                    try {
                        await restApi.admin.checkAdmin();
                        meRes.data.role = "ADMIN";
                    } catch {
                        meRes.data.role = meRes.data.role || "USER";
                    }
                    setCurrentUser(meRes.data);
                }

                // Пытаемся загрузить сам пост напрямую, либо находим его в списках
                try {
                    const postRes = await restApi.posts.getPostById(id);
                    setPost(postRes.data);
                } catch {
                    const [feedRes, myRes] = await Promise.all([
                        restApi.posts.getFeed().catch(() => ({ data: [] })),
                        restApi.posts.getMyPosts().catch(() => ({ data: [] }))
                    ]);
                    const allPosts = [...(feedRes.data || []), ...(myRes.data || [])];
                    const found = allPosts.find((p) => String(p.id) === String(id));
                    if (found) setPost(found);
                }
            } catch (err) {
                console.error("Ошибка загрузки комментариев:", err);
            }
        }
        loadData();
    }, [id]);

    const handleAddComment = async (e) => {
        e.preventDefault();
        if (!newComment.trim()) return;

        try {
            const res = await restApi.comments.addComment(id, newComment.trim());
            setComments([...comments, res.data]);
            setNewComment("");
            toast("Комментарий добавлен!", "success");
        } catch (err) {
            toast(err.response?.data?.message || "Ошибка добавления комментария", "error");
        }
    };

    const handleSaveEdit = async (commentId) => {
        if (!editingText.trim()) return;
        try {
            const res = await restApi.comments.updateComment(id, commentId, editingText.trim());
            setComments(comments.map((c) => (c.id === commentId ? res.data : c)));
            setEditingId(null);
            setEditingText("");
            toast("Комментарий обновлён!", "success");
        } catch (err) {
            toast(err.response?.data?.message || "Ошибка редактирования", "error");
        }
    };

    const handleDelete = (commentId) => {
        setCommentToDelete(commentId);
    };

    const confirmDeleteComment = async () => {
        if (!commentToDelete) return;
        try {
            await restApi.comments.deleteComment(id, commentToDelete);
            setComments(comments.filter((c) => c.id !== commentToDelete));
            toast("Комментарий удалён", "success");
        } catch (err) {
            toast(err.response?.data?.message || "Ошибка удаления", "error");
        } finally {
            setCommentToDelete(null);
        }
    };

    const isModeratorOrAdmin =
        currentUser?.role === "ADMIN" || currentUser?.role === "MODERATOR";

    return (
        <div style={{ maxWidth: "800px", margin: "0 auto", width: "100%", boxSizing: "border-box" }}>
            <Box>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <h1>Комментарии к записи</h1>
                    <Button text="← Назад" onClick={() => navigate(-1)} />
                </div>
            </Box>

            {post && (
                <Box>
                    <div
                        style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "10px", cursor: "pointer" }}
                        onClick={() => navigate(`/profile/${post.authorId}`)}
                    >
                        <img
                            src={post.authorAvatarUrl || "https://placehold.co/100x100"}
                            alt="avatar"
                            style={{ width: "44px", height: "44px", borderRadius: "50%", objectFit: "cover", flexShrink: 0 }}
                        />
                        <div style={{ minWidth: 0, flex: 1 }}>
                            <strong>{post.authorUsername}</strong>
                            <div style={{ fontSize: "12px", color: "#666" }}>{formatDate(post.createdAt)}</div>
                        </div>
                    </div>
                    <p style={{ wordBreak: "break-word", overflowWrap: "anywhere", margin: "4px 0" }}>
                        {post.content}
                    </p>
                    {post.imageUrl && (
                        <img
                            src={post.imageUrl}
                            alt="Вложение"
                            style={{ maxWidth: "100%", maxHeight: "400px", objectFit: "cover", borderRadius: "10px", margin: "8px 0" }}
                        />
                    )}
                </Box>
            )}

            <Box>
                {/* Форма добавления комментария: вертикальная компоновка предотвращает уезд кнопки */}
                <form
                    onSubmit={handleAddComment}
                    style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "10px",
                        width: "100%",
                        boxSizing: "border-box"
                    }}
                >
                    <TextArea
                        placeholder="Написать комментарий (до 500 символов)..."
                        maxLength={500}
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                    />
                    <div style={{ display: "flex", justifyContent: "flex-end" }}>
                        <Button text="Отправить" type="submit" />
                    </div>
                </form>
            </Box>

            {comments.length === 0 ? (
                <Box>
                    <p style={{ color: "#888", textAlign: "center", margin: "16px 0" }}>
                        Комментариев пока нет. Будьте первым!
                    </p>
                </Box>
            ) : (
                comments.map((comment) => {
                    const isAuthor = currentUser && comment.authorId === currentUser.id;
                    const canDelete = isAuthor || isModeratorOrAdmin;

                    return (
                        <Box key={comment.id}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "8px" }}>
                                <div
                                    style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", minWidth: 0 }}
                                    onClick={() => comment.authorId && navigate(`/profile/${comment.authorId}`)}
                                >
                                    <img
                                        src={comment.authorAvatarUrl || "https://placehold.co/100x100"}
                                        alt="avatar"
                                        style={{ width: "32px", height: "32px", borderRadius: "50%", objectFit: "cover", flexShrink: 0 }}
                                    />
                                    <strong style={{ overflowWrap: "anywhere" }}>{comment.authorUsername}</strong>
                                    {isAuthor && currentUser?.role === "ADMIN" && (
                                        <span style={{ background: "#e63946", color: "white", fontSize: "11px", fontWeight: "bold", padding: "1px 6px", borderRadius: "5px" }}>Админ</span>
                                    )}
                                    {isAuthor && currentUser?.role === "MODERATOR" && (
                                        <span style={{ background: "#457b9d", color: "white", fontSize: "11px", fontWeight: "bold", padding: "1px 6px", borderRadius: "5px" }}>Модератор</span>
                                    )}
                                </div>
                                <span style={{ fontSize: "12px", color: "#666", whiteSpace: "nowrap", flexShrink: 0 }}>
                                    {formatDate(comment.createdAt)}
                                    {comment.updatedAt && ` (изм.)`}
                                </span>
                            </div>

                            {editingId === comment.id ? (
                                <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginTop: "8px" }}>
                                    <Input
                                        maxLength={500}
                                        value={editingText}
                                        onChange={(e) => setEditingText(e.target.value)}
                                    />
                                    <div style={{ display: "flex", gap: "8px" }}>
                                        <Button text="Сохранить" onClick={() => handleSaveEdit(comment.id)} />
                                        <Button text="Отмена" onClick={() => setEditingId(null)} />
                                    </div>
                                </div>
                            ) : (
                                <p style={{ margin: "8px 0", wordBreak: "break-word", overflowWrap: "anywhere" }}>
                                    {comment.content}
                                </p>
                            )}

                            {/* Действия: автору разрешено редактировать, автору ИЛИ модератору/админу разрешено удалять */}
                            {canDelete && editingId !== comment.id && (
                                <div style={{ display: "flex", gap: "6px", alignItems: "center", marginTop: "4px" }}>
                                    {isAuthor && (
                                        <Button
                                            text="Изменить"
                                            onClick={() => {
                                                setEditingId(comment.id);
                                                setEditingText(comment.content);
                                            }}
                                        />
                                    )}
                                    <Button
                                        text={!isAuthor && isModeratorOrAdmin ? "Удалить (модерация)" : "Удалить"}
                                        onClick={() => handleDelete(comment.id)}
                                    />
                                </div>
                            )}
                        </Box>
                    );
                })
            )}

            <ConfirmModal
                isOpen={!!commentToDelete}
                title="Удаление комментария"
                message="Вы действительно хотите удалить этот комментарий?"
                confirmText="Удалить"
                cancelText="Отмена"
                onConfirm={confirmDeleteComment}
                onCancel={() => setCommentToDelete(null)}
            />
        </div>
    );
}
