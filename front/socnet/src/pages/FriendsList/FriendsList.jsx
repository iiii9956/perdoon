import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Box from "../../components/Box/Box";
import Button from "../../components/Button/Button";
import { restApi } from "../../api/restApi";
import { useToast } from "../../components/Toast/Toast";
import style from "./FriendsList.module.css";

export default function FriendsList() {
    const navigate = useNavigate();
    const toast = useToast();

    const [friends, setFriends] = useState([]);
    const [incomingRequests, setIncomingRequests] = useState([]);
    const [outgoingRequests, setOutgoingRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("friends"); // "friends" | "incoming" | "outgoing"

    const formatDate = (dateString) => {
        if (!dateString) return "";
        const date = new Date(dateString);
        return isNaN(date.getTime()) ? dateString : date.toLocaleString("ru-RU");
    };

    const loadData = async () => {
        setLoading(true);
        try {
            const [chatsRes, incomingRes, outgoingRes] = await Promise.all([
                restApi.chats.getChats().catch(() => ({ data: [] })),
                restApi.friends.getRequests("incoming").catch(() => ({ data: [] })),
                restApi.friends.getRequests("outgoing").catch(() => ({ data: [] })),
            ]);

            // В архитектуре бэкенда друзья отображаются через диалоги (так как диалог доступен только друзьям)
            const chatList = Array.isArray(chatsRes.data) ? chatsRes.data : [];
            const friendItems = chatList.map((c) => ({
                userId: c.companionId,
                username: c.companionUsername,
                avatarUrl: c.companionAvatarUrl,
                chatId: c.id
            }));

            setFriends(friendItems);
            setIncomingRequests(Array.isArray(incomingRes.data) ? incomingRes.data : []);
            setOutgoingRequests(Array.isArray(outgoingRes.data) ? outgoingRes.data : []);
        } catch (err) {
            console.error("Ошибка загрузки друзей:", err);
            toast("Не удалось загрузить списки", "error");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const handleAccept = async (req) => {
        try {
            await restApi.friends.acceptRequest(req.id);
            // Создаем/открываем диалог, чтобы друг сразу отобразился в списке друзей
            if (req.userId) {
                await restApi.chats.createOrOpenChat(req.userId).catch(() => {});
            }
            toast("Заявка принята! Пользователь добавлен в друзья.", "success");
            await loadData();
        } catch (err) {
            toast(err.response?.data?.message || "Ошибка при принятии заявки", "error");
        }
    };

    const handleReject = async (requestId) => {
        try {
            await restApi.friends.rejectRequest(requestId);
            setIncomingRequests((prev) => prev.filter((r) => r.id !== requestId));
            toast("Заявка отклонена", "info");
        } catch (err) {
            toast(err.response?.data?.message || "Ошибка при отклонении заявки", "error");
        }
    };

    const handleCancelRequest = async (userId) => {
        try {
            await restApi.friends.cancelRequest(userId);
            setOutgoingRequests((prev) => prev.filter((r) => r.userId !== userId));
            toast("Заявка отменена", "info");
        } catch (err) {
            toast(err.response?.data?.message || "Ошибка при отмене заявки", "error");
        }
    };

    const handleOpenChat = async (userId) => {
        try {
            const res = await restApi.chats.createOrOpenChat(userId);
            navigate(`/chats/${res.data.id}`);
        } catch (err) {
            toast(err.response?.data?.message || "Не удалось открыть чат", "error");
        }
    };

    const tabs = [
        { key: "friends", label: `Друзья (${friends.length})` },
        { key: "incoming", label: `Входящие заявки (${incomingRequests.length})` },
        { key: "outgoing", label: `Исходящие заявки (${outgoingRequests.length})` },
    ];

    return (
        <div className={style.wrapper}>
            <Box>
                <h1>Друзья</h1>
                <div className={style.tabs}>
                    {tabs.map((tab) => (
                        <Button
                            key={tab.key}
                            text={tab.label}
                            className={`${style.tab} ${activeTab === tab.key ? style.tabActive : ""}`}
                            onClick={() => setActiveTab(tab.key)}
                        />
                    ))}
                </div>
            </Box>

            {loading ? (
                <Box><p>Загрузка...</p></Box>
            ) : activeTab === "friends" ? (
                friends.length === 0 ? (
                    <Box>
                        <p className={style.empty}>
                            У вас пока нет друзей в списке.<br />
                            Принимайте входящие заявки или отправляйте заявки через поиск!
                        </p>
                    </Box>
                ) : (
                    friends.map((friend) => (
                        <Box key={friend.userId}>
                            <div className={style.userRow}>
                                <img
                                    src={friend.avatarUrl || "https://placehold.co/50x50"}
                                    alt={friend.username}
                                    className={style.avatar}
                                    onClick={() => navigate(`/profile/${friend.userId}`)}
                                />
                                <div className={style.userInfo}>
                                    <span
                                        className={style.username}
                                        onClick={() => navigate(`/profile/${friend.userId}`)}
                                    >
                                        {friend.username}
                                    </span>
                                </div>
                                <div className={style.actions}>
                                    <Button
                                        text="Написать сообщение"
                                        onClick={() => handleOpenChat(friend.userId)}
                                    />
                                </div>
                            </div>
                        </Box>
                    ))
                )
            ) : activeTab === "incoming" ? (
                incomingRequests.length === 0 ? (
                    <Box><p className={style.empty}>Входящих заявок нет.</p></Box>
                ) : (
                    incomingRequests.map((req) => (
                        <Box key={req.id}>
                            <div className={style.userRow}>
                                <div className={style.userInfo}>
                                    <span
                                        className={style.username}
                                        onClick={() => navigate(`/profile/${req.userId}`)}
                                    >
                                        {req.username}
                                    </span>
                                    <span className={style.dateText}>
                                        Заявка от {formatDate(req.createdAt)}
                                    </span>
                                </div>
                                <div className={style.actions}>
                                    <Button text="Принять" onClick={() => handleAccept(req)} />
                                    <Button text="Отклонить" onClick={() => handleReject(req.id)} />
                                </div>
                            </div>
                        </Box>
                    ))
                )
            ) : (
                outgoingRequests.length === 0 ? (
                    <Box><p className={style.empty}>Исходящих заявок нет.</p></Box>
                ) : (
                    outgoingRequests.map((req) => (
                        <Box key={req.id}>
                            <div className={style.userRow}>
                                <div className={style.userInfo}>
                                    <span
                                        className={style.username}
                                        onClick={() => navigate(`/profile/${req.userId}`)}
                                    >
                                        {req.username}
                                    </span>
                                    <span className={style.dateText}>
                                        Отправлена {formatDate(req.createdAt)}
                                    </span>
                                </div>
                                <div className={style.actions}>
                                    <Button
                                        text="Отменить заявку"
                                        onClick={() => handleCancelRequest(req.userId)}
                                    />
                                </div>
                            </div>
                        </Box>
                    ))
                )
            )}
        </div>
    );
}
