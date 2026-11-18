import apiClient from './axiosConfig';

export const restApi = {
    // === 1. АВТОРИЗАЦИЯ ===
    auth: {
        register: (userData) => apiClient.post('/api/auth/register', userData),
        login: (credentials) => apiClient.post('/api/auth/login', credentials),
        logout: () => apiClient.post('/api/auth/logout'),
    },

    // === 2. ПОЛЬЗОВАТЕЛИ ===
    users: {
        getMe: () => apiClient.get('/api/users/me'),
        getUserProfile: (id) => apiClient.get(`/api/users/${id}`),
        updateProfile: (profileData) => apiClient.put('/api/users/me', profileData),
        changePassword: (passwordData) => apiClient.put('/api/users/me/password', passwordData),
    },

    // === 3. ПОСТЫ ===
    posts: {
        getFeed: () => apiClient.get('/api/posts/feed'),
        getMyPosts: () => apiClient.get('/api/posts/my'),
        createPost: (postData) => apiClient.post('/api/posts', postData),
        getPostById: (id) => apiClient.get(`/api/posts/${id}`),
        updatePost: (id, postData) => apiClient.put(`/api/posts/${id}`, postData),
        deletePost: (id) => apiClient.delete(`/api/posts/${id}`),
    },

    // === 4. ЛАЙКИ ===
    likes: {
        likePost: (postId) => apiClient.post(`/api/posts/${postId}/likes`),
        unlikePost: (postId) => apiClient.delete(`/api/posts/${postId}/likes`),
    },

    // === 5. КОММЕНТАРИИ ===
    comments: {
        getPostComments: (postId) => apiClient.get(`/api/posts/${postId}/comments`),
        addComment: (postId, content) => apiClient.post(`/api/posts/${postId}/comments`, { content }),
        updateComment: (postId, commentId, content) => apiClient.put(`/api/posts/${postId}/comments/${commentId}`, { content }),
        deleteComment: (postId, commentId) => apiClient.delete(`/api/posts/${postId}/comments/${commentId}`),
    },

    // === 6. ДРУЗЬЯ ===
    friends: {
        sendRequest: (userId) => apiClient.post(`/api/friends/requests/${userId}`),
        acceptRequest: (requestId) => apiClient.post(`/api/friends/requests/${requestId}/accept`),
        rejectRequest: (requestId) => apiClient.post(`/api/friends/requests/${requestId}/reject`),
        removeFriend: (userId) => apiClient.delete(`/api/friends/${userId}`),
        getFriendsList: () => apiClient.get('/api/friends'),
        getRequests: () => apiClient.get('/api/friends/requests'),
    },

    // === 7. ЧАТЫ И СООБЩЕНИЯ ===
    chats: {
        getChats: () => apiClient.get('/api/chats'),
        createOrOpenChat: (userId) => apiClient.post('/api/chats', { userId }),
        getChatMessages: (chatId) => apiClient.get(`/api/chats/${chatId}/messages`),
        deleteMessage: (messageId) => apiClient.delete(`/api/messages/${messageId}`),
        updateMessage: (messageId, content) => apiClient.put(`/api/messages/${messageId}`, { content }),
    }
};