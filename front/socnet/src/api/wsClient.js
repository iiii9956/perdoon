import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

const WS_URL = import.meta.env.VITE_WS_URL || 'http://localhost:8080/ws';

class WebSocketService {
    constructor() {
        this.client = null;
        this.subscriptions = {};
    }

    // Подключение пользователя к WebSocket после авторизации[cite: 1]
    connect(token, onConnectCallback, onErrorCallback) {
        this.client = new Client({
            webSocketFactory: () => new SockJS(WS_URL),
            connectHeaders: {
                Authorization: `Bearer ${token}`
            },
            debug: (str) => console.log('STOMP: ' + str),
            onConnect: () => {
                console.log('WebSocket Connected!');
                if (onConnectCallback) onConnectCallback();
            },
            onStompError: (frame) => {
                console.error('Broker error: ' + frame.headers['message']);
                if (onErrorCallback) onErrorCallback(frame);
            }
        });

        this.client.activate();
    }

    disconnect() {
        if (this.client) {
            this.client.deactivate();
        }
    }

    // Подписка на канал конкретного чата. 
    // Сервер отправляет событие получателю[cite: 1]
    subscribeToChat(chatId, messageCallback) {
        if (!this.client || !this.client.connected) return;
        
        const topic = `/topic/chat/${chatId}`; // Пример топика
        
        this.subscriptions[chatId] = this.client.subscribe(topic, (message) => {
            if (message.body) {
                const parsedMessage = JSON.parse(message.body);
                // Получатель получает новое сообщение без ручного обновления страницы[cite: 1]
                messageCallback(parsedMessage); 
            }
        });
    }

    unsubscribeFromChat(chatId) {
        if (this.subscriptions[chatId]) {
            this.subscriptions[chatId].unsubscribe();
            delete this.subscriptions[chatId];
        }
    }

    // Канал/endpoint для отправки сообщения в конкретный чат[cite: 1]
    sendMessage(chatId, content, senderId) {
        if (this.client && this.client.connected) {
            const message = {
                chatId: chatId,
                senderId: senderId,
                content: content,
                messageType: 'TEXT',
                // Для изображения в сообщении передавалась бы ссылка (расширенная функция)[cite: 1]
            };
            this.client.publish({
                destination: `/app/chat/${chatId}/send`, // Endpoint зависит от бэкенда Spring
                body: JSON.stringify(message)
            });
        }
    }
}

export const wsClient = new WebSocketService();