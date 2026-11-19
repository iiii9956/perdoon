import { Client } from '@stomp/stompjs';

const getWsUrl = (token) => {
    if (import.meta.env.VITE_API_URL) {
        const httpUrl = import.meta.env.VITE_API_URL;
        const wsProto = httpUrl.startsWith('https') ? 'wss:' : 'ws:';
        const host = httpUrl.replace(/^https?:\/\//, '');
        return `${wsProto}//${host}/ws?token=${encodeURIComponent(token)}`;
    }
    const wsProto = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    return `${wsProto}//${window.location.host}/ws?token=${encodeURIComponent(token)}`;
};

class WebSocketService {
    constructor() {
        this.client = null;
        this.messageListeners = new Set();
        this.errorListeners = new Set();
        this.isConnected = false;
        this.currentToken = null;
    }

    connect(token, onConnectCallback) {
        if (!token) return;
        if (this.client && this.client.active && this.currentToken === token) {
            if (this.isConnected && onConnectCallback) onConnectCallback();
            return;
        }

        this.currentToken = token;

        // Отключаем старый если был
        if (this.client) {
            this.client.deactivate();
        }

        this.client = new Client({
            brokerURL: getWsUrl(token),
            connectHeaders: {
                Authorization: `Bearer ${token}`
            },
            reconnectDelay: 3000,
            heartbeatIncoming: 4000,
            heartbeatOutgoing: 4000,
            debug: () => {
                // debug logs disabled to keep console clean
            },
            onConnect: () => {
                this.isConnected = true;
                console.log('STOMP: Соединение установлено!');

                // Подписка на личные сообщения (бэкенд отправляет в /queue/messages для каждого участника)
                this.client.subscribe('/user/queue/messages', (message) => {
                    if (message.body) {
                        try {
                            const parsed = JSON.parse(message.body);
                            this.messageListeners.forEach((fn) => fn(parsed));
                        } catch (err) {
                            console.error('Ошибка парсинга STOMP-сообщения:', err);
                        }
                    }
                });

                // Подписка на ошибки
                this.client.subscribe('/user/queue/errors', (message) => {
                    if (message.body) {
                        try {
                            const parsed = JSON.parse(message.body);
                            this.errorListeners.forEach((fn) => fn(parsed));
                        } catch (err) {
                            console.error('Ошибка парсинга STOMP-ошибки:', err);
                        }
                    }
                });

                if (onConnectCallback) onConnectCallback();
            },
            onDisconnect: () => {
                this.isConnected = false;
            },
            onStompError: (frame) => {
                console.error('STOMP Error:', frame.headers['message']);
            }
        });

        this.client.activate();
    }

    onMessage(callback) {
        this.messageListeners.add(callback);
        return () => this.messageListeners.delete(callback);
    }

    onError(callback) {
        this.errorListeners.add(callback);
        return () => this.errorListeners.delete(callback);
    }

    sendMessage(conversationId, content) {
        if (!this.client || !this.client.connected) {
            return false;
        }
        try {
            this.client.publish({
                destination: '/app/chat.send',
                body: JSON.stringify({ conversationId, content })
            });
            return true;
        } catch (e) {
            console.error('Ошибка отправки через WebSocket:', e);
            return false;
        }
    }

    disconnect() {
        if (this.client) {
            this.client.deactivate();
            this.client = null;
            this.isConnected = false;
            this.currentToken = null;
        }
    }
}

export const wsClient = new WebSocketService();
