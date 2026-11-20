import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Box from "../Box/Box";
import Button from "../Button/Button";
import style from "./LikesModal.module.css";

export default function LikesModal({
    isOpen,
    likes = [],
    currentUserId,
    onClose
}) {
    const navigate = useNavigate();

    useEffect(() => {
        if (!isOpen) return;
        const handleKeyDown = (e) => {
            if (e.key === "Escape") onClose?.();
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    const handleUserClick = (userId) => {
        onClose?.();
        if (currentUserId && String(userId) === String(currentUserId)) {
            navigate("/profile/me");
        } else {
            navigate(`/profile/${userId}`);
        }
    };

    return (
        <div className={style.overlay} onClick={onClose}>
            <div className={style.modalContent} onClick={(e) => e.stopPropagation()}>
                <Box>
                    <div className={style.header}>
                        <h3 className={style.title}>Понравилось ({likes.length})</h3>
                        <Button text="✕" onClick={onClose} style={{ padding: "2px 8px", margin: 0 }} />
                    </div>

                    <div className={style.userList}>
                        {likes.length === 0 ? (
                            <p className={style.empty}>Эту публикацию ещё никто не оценил.</p>
                        ) : (
                            likes.map((like, index) => (
                                <div
                                    key={like.userId || index}
                                    className={style.userRow}
                                    onClick={() => handleUserClick(like.userId)}
                                >
                                    <img
                                        src={like.avatarUrl || "https://placehold.co/40x40"}
                                        alt=""
                                        className={style.avatar}
                                    />
                                    <span className={style.username}>{like.username || "Пользователь"}</span>
                                </div>
                            ))
                        )}
                    </div>

                    <div className={style.footer}>
                        <Button text="Закрыть" onClick={onClose} style={{ margin: 0 }} />
                    </div>
                </Box>
            </div>
        </div>
    );
}
