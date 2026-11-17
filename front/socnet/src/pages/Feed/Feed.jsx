import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../../components/Button/Button";
import Box from "../../components/Box/Box";
import style from "./Feed.module.css";

const MOCK_POSTS = [
    {
        id: 1,
        authorId: 1,
        authorName: "Денис",
        authorAvatar: "https://placehold.co/100x100",
        createdAt: "17 ноября 2026, 14:20",
        updatedAt: "17 ноября 2026, 14:35",
        content: "Короткий пост для проверки ленты. Нажми на мою аватарку или ник, чтобы перейти в профиль!"
    },
    {
        id: 2,
        authorId: 2,
        authorName: "Анастасия",
        authorAvatar: "https://placehold.co/100x100",
        createdAt: "17 ноября 2026, 12:00",
        updatedAt: null,
        content: "Очень длинный пост для проверки кнопки разворота. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut tortor augue, congue eget maximus non, semper a augue. Vestibulum vitae consequat eros, dictum semper nunc. Curabitur blandit enim velit, et fermentum nulla laoreet quis. Vestibulum non magna eu dui facilisis pulvinar. Curabitur ipsum ex, volutpat vel efficitur at, commodo vitae nisl."
    },
    {
        id: 3,
        authorId: 3,
        authorName: "Илюха",
        authorAvatar: "https://placehold.co/100x100",
        createdAt: "16 ноября 2026, 19:10",
        updatedAt: null,
        content: "Третий пост, который подгрузится по кнопке!"
    }
];

export default function Feed() {
    const navigate = useNavigate();

    const [visibleCount, setVisibleCount] = useState(2);
    const [expandedPosts, setExpandedPosts] = useState({});

    const toggleExpand = (postId) => {
        setExpandedPosts((prev) => ({
            ...prev,
            [postId]: !prev[postId]
        }));
    };

    const handleLoadMore = () => {
        setVisibleCount((prev) => prev + 2);
    };

    const visiblePosts = MOCK_POSTS.slice(0, visibleCount);
    const MAX_LENGTH = 250;

    return (
        <div className={style.feedWrapper}>
            <Box>
                <h1>Лента</h1>
            </Box>

            {visiblePosts.map((post) => {
                const isLong = post.content.length > MAX_LENGTH;
                const isExpanded = !!expandedPosts[post.id];

                const textToShow = isLong && !isExpanded
                    ? post.content.slice(0, MAX_LENGTH) + "..."
                    : post.content;

                return (
                    <Box key={post.id}>
                        <div
                            className={style.postHeader}
                            onClick={() => navigate(`/profile/${post.authorId}`)}
                        >
                            <img
                                src={post.authorAvatar}
                                alt="avatar"
                                className={style.avatar}
                            />
                            <div className={style.authorInfo}>
                                <span className={style.nickname}>{post.authorName}</span>
                                <span className={style.dates}>
                                    {post.createdAt}
                                    {post.updatedAt && ` (изм. ${post.updatedAt})`}
                                </span>
                            </div>
                        </div>

                        <p className={style.postText}>{textToShow}</p>

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
                                text="Лайк"
                                onClick={() => console.log("Лайк посту ID:", post.id)}
                            />
                            <Button
                                text="Комментарии"
                                onClick={() => navigate(`/post/${post.id}/comments`)}
                            />
                        </div>
                    </Box>
                );
            })}

            {visibleCount < MOCK_POSTS.length && (
                <div className={style.loadMoreWrapper}>
                    <Button text="Загрузить ещё" onClick={handleLoadMore} />
                </div>
            )}
        </div>
    );
}