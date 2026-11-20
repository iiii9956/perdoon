import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Box from "../../components/Box/Box";
import Button from "../../components/Button/Button";
import Input from "../../components/Input/Input";
import { restApi } from "../../api/restApi";
import { wsClient } from "../../api/wsClient";
import { useToast } from "../../components/Toast/Toast";
import style from "./Chats.module.css";

export default function Chats() {
    const { chatId } = useParams();
    const navigate = useNavigate();
    const toast = useToast();

    const [conversations, setConversations] = useState([]);
    const [loadingList, setLoadingList] = useState(true);

    const [messages, setMessages] = useState([]);
    const [loadingMessages, setLoadingMessages] = useState(false);
    const [activeConversation, setActiveConversation] = useState(null);

    const [messageText, setMessageText] = useState("");
    const [myId, setMyId] = useState(null);

    const activeConversationRef = useRef(null);
    activeConversationRef.current = activeConversation;

    const messagesEndRef = useRef(null);

    const formatDate = (dateString) => {
        if (!dateString) return "";
        const date = new Date(dateString);
        return isNaN(date.getTime()) ? dateString : date.toLocaleString("ru-RU");
    };

    // 1. Инициализация пользователя и списка диалогов
    const loadConversations = async () => {
        try {
            setLoadingList(true);
            const res = await restApi.chats.getChats();
            const list = Array.isArray(res.data) ? res.data : [];
            setConversations(list);
            return list;
        } catch (err) {
            console.error("Ошибка загрузки чатов:", err);
            return [];
        } finally {
            setLoadingList(false);
        }
    };

    useEffect(() => {
        const token = localStorage.getItem("jwt_token");
        if (token) {
            restApi.users.getMe()
                .then((res) => setMyId(res.data.id))
                .catch(() => {});

            // Подключаем WebSocket
            wsClient.connect(token);
        }

        loadConversations();
    }, []);

    // 2. Подписка на сообщения в реальном времени через WebSocket
    useEffect(() => {
        const unsubscribe = wsClient.onMessage((newMsg) => {
            // Если открыт чат, к которому относится сообщение — добавляем его
            if (activeConversationRef.current && Number(activeConversationRef.current.id) === Number(newMsg.conversationId)) {
                setMessages((prev) => {
                    if (prev.some((m) => m.id === newMsg.id)) return prev;
                    return [...prev, newMsg];
                });
            }

            // Обновляем последнее сообщение в списке диалогов слева
            setConversations((prev) => {
                const found = prev.find((c) => Number(c.id) === Number(newMsg.conversationId));
                if (!found) {
                    // Новый чат — перезагружаем список
                    loadConversations();
                    return prev;
                }
                const updated = { ...found, lastMessage: newMsg.content, updatedAt: newMsg.createdAt };
                const rest = prev.filter((c) => Number(c.id) !== Number(newMsg.conversationId));
                return [updated, ...rest];
            });
        });

        const unsubscribeErrors = wsClient.onError((errMsg) => {
            toast(errMsg?.message || "Ошибка доставки сообщения", "error");
        });

        return () => {
            unsubscribe();
            unsubscribeErrors();
        };
    }, []);

    // 3. Открытие диалога по изменению chatId в URL
    useEffect(() => {
        if (chatId) {
            loadMessages(Number(chatId));
        } else {
            setActiveConversation(null);
            setMessages([]);
        }
    }, [chatId]);

    // 4. Периодическое фоновое обновление активного чата (каждые 3 сек для надежности)
    useEffect(() => {
        if (!activeConversation?.id) return;
        const intervalId = setInterval(async () => {
            try {
                const res = await restApi.chats.getChatMessages(activeConversation.id);
                if (Array.isArray(res.data)) {
                    setMessages((prev) => {
                        if (res.data.length !== prev.length || (res.data.length > 0 && res.data[res.data.length - 1].id !== prev[prev.length - 1]?.id)) {
                            return res.data;
                        }
                        return prev;
                    });
                }
            } catch {
                // игнорируем ошибки фонового опроса
            }
        }, 3000);

        return () => clearInterval(intervalId);
    }, [activeConversation?.id]);

    // 5. Автоскролл вниз к последнему сообщению
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const loadMessages = async (convId) => {
        setLoadingMessages(true);
        try {
            const res = await restApi.chats.getChatMessages(convId);
            setMessages(Array.isArray(res.data) ? res.data : []);

            // Находим диалог в списке или сохраняем заглушку
            setConversations((prev) => {
                const found = prev.find((c) => Number(c.id) === convId);
                if (found) {
                    setActiveConversation(found);
                } else {
                    setActiveConversation({ id: convId });
                }
                return prev;
            });
        } catch (err) {
            toast(err.response?.data?.message || "Не удалось загрузить сообщения", "error");
        } finally {
            setLoadingMessages(false);
        }
    };

    const handleSelectChat = (conv) => {
        setActiveConversation(conv);
        navigate(`/chats/${conv.id}`);
    };

    const handleSend = async (e) => {
        e.preventDefault();
        const trimmed = messageText.trim();
        if (!trimmed || !activeConversation) return;

        try {
            // Отправляем сообщение через REST API
            const res = await restApi.chats.sendMessage(activeConversation.id, trimmed);
            setMessageText("");

            if (res.data) {
                setMessages((prev) => {
                    if (prev.some((m) => m.id === res.data.id)) return prev;
                    return [...prev, res.data];
                });

                // Обновляем список диалогов
                setConversations((prev) => {
                    const found = prev.find((c) => Number(c.id) === Number(activeConversation.id));
                    if (!found) return prev;
                    const updated = { ...found, lastMessage: trimmed, updatedAt: new Date().toISOString() };
                    const rest = prev.filter((c) => Number(c.id) !== Number(activeConversation.id));
                    return [updated, ...rest];
                });
            }
        } catch (err) {
            toast(err.response?.data?.message || "Не удалось отправить сообщение", "error");
        }
    };

    return (
        <div className={style.chatsWrapper}>
            {/* Список диалогов слева */}
            <div className={style.chatList}>
                <Box>
                    <h2 className={style.listTitle}>Сообщения</h2>
                    {loadingList ? (
                        <p>Загрузка диалогов...</p>
                    ) : conversations.length === 0 ? (
                        <p className={style.empty}>
                            У вас пока нет диалогов.<br />
                            Чтобы начать переписку, добавьте пользователя в друзья и нажмите «Написать сообщение».
                        </p>
                    ) : (
                        conversations.map((conv) => (
                            <div
                                key={conv.id}
                                className={`${style.convItem} ${Number(activeConversation?.id) === Number(conv.id) ? style.convItemActive : ""}`}
                                onClick={() => handleSelectChat(conv)}
                            >
                                <img
                                    src={conv.companionAvatarUrl || "https://placehold.co/40x40"}
                                    alt={conv.companionUsername}
                                    className={style.convAvatar}
                                />
                                <div className={style.convInfo}>
                                    <span className={style.convName}>{conv.companionUsername}</span>
                                    {conv.lastMessage && (
                                        <span className={style.convLast}>{conv.lastMessage}</span>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </Box>
            </div>

            {/* Окно переписки справа */}
            <div className={style.chatArea}>
                {!activeConversation ? (
                    <Box>
                        <p className={style.empty}>Выберите диалог из списка слева, чтобы начать общение.</p>
                    </Box>
                ) : (
                    <Box>
                        <div className={style.chatHeader}>
                            <img
                                src={activeConversation.companionAvatarUrl || "https://placehold.co/40x40"}
                                alt=""
                                className={style.chatHeaderAvatar}
                            />
                            <span
                                className={style.chatHeaderName}
                                style={{ cursor: "pointer" }}
                                onClick={() => activeConversation.companionId && navigate(`/profile/${activeConversation.companionId}`)}
                            >
                                {activeConversation.companionUsername || "Чат"}
                            </span>
                        </div>

                        <div className={style.messagesBox}>
                            {loadingMessages ? (
                                <p>Загрузка сообщений...</p>
                            ) : messages.length === 0 ? (
                                <p className={style.empty}>Сообщений пока нет. Напишите первое сообщение!</p>
                            ) : (
                                messages.map((msg) => {
                                    const isMine = msg.senderId === myId;
                                    return (
                                        <div
                                            key={msg.id}
                                            className={`${style.message} ${isMine ? style.messageMine : style.messageOther}`}
                                        >
                                            {!isMine && (
                                                <span className={style.msgSender}>{msg.senderUsername}</span>
                                            )}
                                            <div className={style.msgBubble}>
                                                <span className={style.msgContent}>{msg.content}</span>
                                                <span className={style.msgTime}>{formatDate(msg.createdAt)}</span>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        <form className={style.inputRow} onSubmit={handleSend}>
                            <Input
                                placeholder="Введите сообщение..."
                                value={messageText}
                                maxLength={2000}
                                onChange={(e) => setMessageText(e.target.value)}
                            />
                            <Button text="Отправить" type="submit" />
                        </form>
                    </Box>
                )}
            </div>
        </div>
    );
}
