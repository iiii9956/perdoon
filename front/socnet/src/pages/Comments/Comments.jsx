import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Box from "../../components/Box/Box";
import Button from "../../components/Button/Button";
import Input from "../../components/Input/Input";
import { restApi } from "../../api/restApi";

export default function Comments() {
    const { id } = useParams(); // postId
    const navigate = useNavigate();

    const [post, setPost] = useState(null);
    const [comments, setComments] = useState([]);
    const [currentUser, setCurrentUser] = useState(null);

    const [newComment, setNewComment] = useState("");
    const [editingId, setEditingId] = useState(null);
    const [editingText, setEditingText] = useState("");

    const formatDate = (dateString) => {
        if (!dateString) return "";
        const date = new Date(dateString);
        return isNaN(date.getTime()) ? dateString : date.toLocaleString("ru-RU");
    };

    useEffect(() => {
        async function loadData() {
            try {
                const [commentsRes, meRes] = await Promise.all([
                    restApi.comments.getPostComments(id),
                    restApi.users.getMe()
                ]);
                setComments(Array.isArray(commentsRes.data) ? commentsRes.data : []);
                setCurrentUser(meRes.data);

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
        } catch (err) {
            alert(err.response?.data?.message || "Ошибка добавления комментария");
        }
    };

    const handleSaveEdit = async (commentId) => {
        if (!editingText.trim()) return;
        try {
            const res = await restApi.comments.updateComment(id, commentId, editingText.trim());
            setComments(comments.map((c) => (c.id === commentId ? res.data : c)));
            setEditingId(null);
            setEditingText("");
        } catch (err) {
            alert(err.response?.data?.message || "Ошибка редактирования");
        }
    };

    const handleDelete = async (commentId) => {
        try {
            await restApi.comments.deleteComment(id, commentId);
            setComments(comments.filter((c) => c.id !== commentId));
        } catch (err) {
            alert(err.response?.data?.message || "Ошибка удаления");
        }
    };

    return (
        <div style={{ maxWidth: "800px", margin: "0 auto", width: "100%" }}>
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
                            style={{ width: "44px", height: "44px", borderRadius: "50%", objectFit: "cover" }}
                        />
                        <div>
                            <strong>{post.authorUsername}</strong>
                            <div style={{ fontSize: "12px", color: "#666" }}>{formatDate(post.createdAt)}</div>
                        </div>
                    </div>
                    <p style={{ wordBreak: "break-word" }}>{post.content}</p>
                </Box>
            )}

            <Box>
                <form onSubmit={handleAddComment} style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                    <div style={{ flex: 1 }}>
                        <Input
                            placeholder="Написать комментарий (до 500 символов)..."
                            maxLength={500}
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                        />
                    </div>
                    <Button text="Отправить" type="submit" />
                </form>
            </Box>

            {comments.length === 0 ? (
                <Box>
                    <p>Комментариев пока нет. Будьте первым!</p>
                </Box>
            ) : (
                comments.map((comment) => {
                    const isAuthor = currentUser && comment.authorId === currentUser.id;

                    return (
                        <Box key={comment.id}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                <div
                                    style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" }}
                                    onClick={() => comment.authorId && navigate(`/profile/${comment.authorId}`)}
                                >
                                    <img
                                        src={comment.authorAvatarUrl || "https://placehold.co/100x100"}
                                        alt="avatar"
                                        style={{ width: "32px", height: "32px", borderRadius: "50%", objectFit: "cover" }}
                                    />
                                    <strong>{comment.authorUsername}</strong>
                                </div>
                                <span style={{ fontSize: "12px", color: "#666" }}>
                                    {formatDate(comment.createdAt)}
                                    {comment.updatedAt && ` (изм. ${formatDate(comment.updatedAt)})`}
                                </span>
                            </div>

                            {editingId === comment.id ? (
                                <div style={{ display: "flex", gap: "8px", marginTop: "8px" }}>
                                    <Input
                                        maxLength={500}
                                        value={editingText}
                                        onChange={(e) => setEditingText(e.target.value)}
                                    />
                                    <Button text="Сохранить" onClick={() => handleSaveEdit(comment.id)} />
                                    <Button text="Отмена" onClick={() => setEditingId(null)} />
                                </div>
                            ) : (
                                <p style={{ margin: "8px 0", wordBreak: "break-word" }}>{comment.content}</p>
                            )}

                            {isAuthor && editingId !== comment.id && (
                                <div style={{ display: "flex", gap: "6px" }}>
                                    <Button
                                        text="Изменить"
                                        onClick={() => {
                                            setEditingId(comment.id);
                                            setEditingText(comment.content);
                                        }}
                                    />
                                    <Button text="Удалить" onClick={() => handleDelete(comment.id)} />
                                </div>
                            )}
                        </Box>
                    );
                })
            )}
        </div>
    );
}