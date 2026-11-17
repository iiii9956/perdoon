import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Box from "../../components/Box/Box";
import Button from "../../components/Button/Button";
import Input from "../../components/Input/Input";
import { restApi } from "../../api/restApi";
import style from "./Profile.module.css";

const MOCK_USER_ME = {
    id: 1,
    username: "Денис Елисеев",
    avatar: "https://placehold.co/200x200",
    role: "ADMIN",
    createdAt: "12 сентября 2026",
    bio: "Студент 3-ИС4. Пишу фронтенд для нашей соцсети на React.",
    email: "4p000k3@gmail.com",
    phone: "+7 (999) 123-45-67"
};

const MOCK_USER_OTHER = {
    id: 2,
    username: "Анастасия Смирнова",
    avatar: "https://placehold.co/200x200",
    role: "MODERATOR",
    createdAt: "14 сентября 2026",
    bio: "Делаю бэкенд и слежу за порядком в комментариях."
};

const MOCK_USER_POSTS = [
    {
        id: 101,
        content: "Первый пост на моей стене! Проверяем отображение профиля.",
        createdAt: "17 ноября 2026, 15:00",
        updatedAt: null
    }
];

export default function Profile({ isOwn }) {
    const { id } = useParams();
    const navigate = useNavigate();

    const [user, setUser] = useState(isOwn ? MOCK_USER_ME : MOCK_USER_OTHER);
    const [posts, setPosts] = useState(MOCK_USER_POSTS);

    const [isEditingProfile, setIsEditingProfile] = useState(false);
    const [isChangingPassword, setIsChangingPassword] = useState(false);

    const [editUsername, setEditUsername] = useState(user.username);
    const [editBio, setEditBio] = useState(user.bio || "");

    const [oldPassword, setOldPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");

    const [newPostText, setNewPostText] = useState("");
    const [friendRequested, setFriendRequested] = useState(false);

    useEffect(() => {
        // Сразу переключаем моковые данные при переходе между /profile/me и /profile/:id
        const fallbackUser = isOwn ? MOCK_USER_ME : MOCK_USER_OTHER;
        setUser(fallbackUser);
        setEditUsername(fallbackUser.username);
        setEditBio(fallbackUser.bio || "");
        setIsEditingProfile(false);
        setIsChangingPassword(false);

        async function loadProfileData() {
            try {
                if (isOwn) {
                    const [meRes, myPostsRes] = await Promise.all([
                        restApi.users.getMe(),
                        restApi.posts.getMyPosts()
                    ]);
                    setUser(meRes.data);
                    setEditUsername(meRes.data.username);
                    setEditBio(meRes.data.bio || "");
                    setPosts(myPostsRes.data);
                } else if (id) {
                    const [userRes, userPostsRes] = await Promise.all([
                        restApi.users.getUserProfile(id),
                        restApi.users.getUserPosts(id)
                    ]);
                    setUser(userRes.data);
                    setPosts(userPostsRes.data);
                }
            } catch (err) {
                console.log("Бэк выключен, используются моковые данные:", err.message);
            }
        }
        loadProfileData();
    }, [isOwn, id]);

    const handleSaveProfile = async (e) => {
        e.preventDefault();
        try {
            await restApi.users.updateProfile({ username: editUsername, bio: editBio });
            setUser((prev) => ({ ...prev, username: editUsername, bio: editBio }));
            setIsEditingProfile(false);
        } catch (err) {
            setUser((prev) => ({ ...prev, username: editUsername, bio: editBio }));
            setIsEditingProfile(false);
        }
    };

    const handleChangePassword = async (e) => {
        e.preventDefault();
        try {
            await restApi.users.changePassword({ oldPassword, newPassword });
            alert("Пароль успешно изменён!");
            setOldPassword("");
            setNewPassword("");
            setIsChangingPassword(false);
        } catch (err) {
            console.error("Ошибка смены пароля:", err);
        }
    };

    const handleCreatePost = async (e) => {
        e.preventDefault();
        if (!newPostText.trim()) return;

        try {
            const res = await restApi.posts.createPost({ content: newPostText });
            setPosts([res.data, ...posts]);
            setNewPostText("");
        } catch (err) {
            const fakePost = {
                id: Date.now(),
                content: newPostText,
                createdAt: "Только что",
                updatedAt: null
            };
            setPosts([fakePost, ...posts]);
            setNewPostText("");
        }
    };

    const handleAddFriend = async () => {
        try {
            await restApi.friends.sendRequest(user.id);
            setFriendRequested(true);
        } catch (err) {
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

    return (
        <div className={style.profileWrapper}>
            <Box>
                <div className={style.topSection}>
                    <img src={user.avatar} alt="Аватар" className={style.bigAvatar} />

                    <div className={style.userDetails}>
                        <div className={style.nameRow}>
                            <h1 className={style.nickname}>{user.username}</h1>
                            {renderRoleBadge(user.role)}
                        </div>

                        <span className={style.metaText}>
                            Аккаунт создан: {user.createdAt}
                        </span>

                        {isOwn && (
                            <div className={style.privateInfo}>
                                <span><strong>Почта:</strong> {user.email || "Не указана"}</span>
                                <span><strong>Телефон:</strong> {user.phone || "Не указан"}</span>
                            </div>
                        )}

                        <div className={style.bioBlock}>
                            <strong>О себе: </strong>
                            {user.bio ? user.bio : "Пользователь пока ничего не рассказал о себе."}
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
                                placeholder="Никнейм (до 30 символов)"
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
                            <textarea
                                className={style.textarea}
                                placeholder="Расскажите о себе (до 500 символов)..."
                                value={editBio}
                                maxLength={500}
                                onChange={(e) => setEditBio(e.target.value)}
                            />
                            <span
                                className={`${style.charCounter} ${
                                    editBio.length >= 500 ? style.charCounterLimit : ""
                                }`}
                            >
                                {editBio.length} / 500
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
                            placeholder="Новый пароль"
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
                        <textarea
                            className={style.textarea}
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
                        <img src={user.avatar} alt="avatar" className={style.smallAvatar} />
                        <div>
                            <strong>{user.username}</strong>
                            <div className={style.metaText}>
                                {post.createdAt}
                                {post.updatedAt && ` (изм. ${post.updatedAt})`}
                            </div>
                        </div>
                    </div>

                    <p style={{ wordBreak: "break-word" }}>{post.content}</p>

                    <div className={style.actions}>
                        <Button
                            text="Лайк"
                            onClick={() => restApi.likes.likePost(post.id)}
                        />
                        <Button
                            text="Комментарии"
                            onClick={() => navigate(`/post/${post.id}/comments`)}
                        />
                        {isOwn && (
                            <Button
                                text="Удалить"
                                onClick={async () => {
                                    try {
                                        await restApi.posts.deletePost(post.id);
                                    } catch (e) {}
                                    setPosts(posts.filter((p) => p.id !== post.id));
                                }}
                            />
                        )}
                    </div>
                </Box>
            ))}
        </div>
    );
}