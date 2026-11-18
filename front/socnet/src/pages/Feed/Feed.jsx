import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../../components/Button/Button";
import Box from "../../components/Box/Box";
import { restApi } from "../../api/restApi";
import style from "./Feed.module.css";

export default function Feed() {
    const navigate = useNavigate();

    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [visibleCount, setVisibleCount] = useState(5);
    const [expandedPosts, setExpandedPosts] = useState({});
    const [likedPosts, setLikedPosts] = useState({});
    const [newPostText, setNewPostText] = useState("");

    const loadFeed = async () => {
        try {
            setLoading(true);
            const [feedRes, myRes] = await Promise.all([
                restApi.posts.getFeed().catch(() => ({ data: [] })),
                restApi.posts.getMyPosts().catch(() => ({ data: [] }))
            ]);

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
        if (!newPostText.trim()) return;

        try {
            const res = await restApi.posts.createPost({ content: newPostText.trim() });
            setNewPostText("");
            if (res.data) {
                setPosts((prev) => [res.data, ...prev]);
            } else {
                loadFeed();
            }
        } catch (error) {
            alert(error.response?.data?.message || "Не удалось опубликовать пост");
        }
    };

    const handleToggleLike = async (postId) => {
        const isCurrentlyLiked = !!likedPosts[postId];
        setLikedPosts((prev) => ({ ...prev, [postId]: !isCurrentlyLiked }));

        try {
            if (isCurrentlyLiked) {
                await restApi.likes.unlikePost(postId);
            } else {
                await restApi.likes.likePost(postId);
            }
        } catch (error) {
            console.log("Ошибка лайка:", error.response?.status || error.message);
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

    const visiblePosts = posts.slice(0, visibleCount);
    const MAX_LENGTH = 250;

    return (
        <div className={style.feedWrapper}>
            <Box>
                <h1>Лента</h1>
                <form
                    onSubmit={handleCreatePost}
                    style={{ display: "flex", flexDirection: "column", gap: "8px", marginTop: "10px" }}
                >
                    <textarea
                        placeholder="Что у вас нового?"
                        value={newPostText}
                        onChange={(e) => setNewPostText(e.target.value)}
                        style={{
                            padding: "10px 12px",
                            borderRadius: "8px",
                            border: "none",
                            boxShadow: "0px 3px rgba(0, 0, 0, 0.2)",
                            margin: "8px",
                            backgroundColor: "white",
                            fontFamily: "inherit",
                            fontSize: "14px",
                            resize: "vertical",
                            minHeight: "70px"
                        }}
                    />
                    <div>
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
                    const isLong = post.content.length > MAX_LENGTH;
                    const isExpanded = !!expandedPosts[post.id];
                    const isLiked = !!likedPosts[post.id];

                    const textToShow =
                        isLong && !isExpanded
                            ? post.content.slice(0, MAX_LENGTH) + "..."
                            : post.content;

                    return (
                        <Box key={post.id}>
                            <div
                                className={style.postHeader}
                                onClick={() => navigate(`/profile/${post.authorId}`)}
                            >
                                <img
                                    src={post.authorAvatarUrl || "https://placehold.co/100x100"}
                                    alt="avatar"
                                    className={style.avatar}
                                />
                                <div className={style.authorInfo}>
                                    <span className={style.nickname}>{post.authorUsername}</span>
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
                                    style={{ maxWidth: "100%", borderRadius: "10px", marginBottom: "10px" }}
                                />
                            )}

                            {isLong && (
                                <button
                                    className={style.expandBtn}
                                    onClick={() => toggleExpand(post.id)}
                                >
                                    {isExpanded ? "Свернуть" : "Читать далее..."}
                                </button>
                            )}

                            <div className={style.actions}>
                                <Button
                                    text={isLiked ? "Лайкнуто ❤️" : "Лайк"}
                                    onClick={() => handleToggleLike(post.id)}
                                />
                                <Button
                                    text="Комментарии"
                                    onClick={() => navigate(`/post/${post.id}/comments`)}
                                />
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
        </div>
    );
}