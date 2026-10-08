import apiClient from './axiosConfig';

export const restApi = {
    // === 1. АВТОРИЗАЦИЯ ===[cite: 1]
    auth: {
        register: (userData) => apiClient.post('/api/auth/register', userData),
        login: (credentials) => apiClient.post('/api/auth/login', credentials),
        logout: () => apiClient.post('/api/auth/logout'),
    },

    // === 2. ПОЛЬЗОВАТЕЛИ ===[cite: 1]
    users: {
        getMe: () => apiClient.get('/api/users/me'),
        getUserProfile: (id) => apiClient.get(`/api/users/${id}`),
        updateProfile: (profileData) => apiClient.put('/api/users/me', profileData),
        changePassword: (passwordData) => apiClient.put('/api/users/me/password', passwordData),
    },

    // === 3. ПОСТЫ ===[cite: 1]
    posts: {
        getFeed: () => apiClient.get('/api/posts/feed'), // Общая лента без собственных постов[cite: 1]
        getMyPosts: () => apiClient.get('/api/posts/my'),
        createPost: (postData) => apiClient.post('/api/posts', postData),
        getPostById: (id) => apiClient.get(`/api/posts/${id}`),
        updatePost: (id, postData) => apiClient.put(`/api/posts/${id}`, postData), // Редактирование собственного поста[cite: 1]
        deletePost: (id) => apiClient.delete(`/api/posts/${id}`), // Удаление собственного поста[cite: 1]
    },

    // === 4. ЛАЙКИ ===[cite: 1]
    likes: {
        likePost: (postId) => apiClient.post(`/api/posts/${postId}/likes`),
        unlikePost: (postId) => apiClient.delete(`/api/posts/${postId}/likes`),
    },

    // === 5. КОММЕНТАРИИ ===[cite: 1]
    comments: {
        getPostComments: (postId) => apiClient.get(`/api/posts/${postId}/comments`),
        addComment: (postId, content) => apiClient.post(`/api/posts/${postId}/comments`, { content }),
        updateComment: (commentId, content) => apiClient.put(`/api/comments/${commentId}`, { content }),
        deleteComment: (commentId) => apiClient.delete(`/api/comments/${commentId}`),
    },

    // === 6. ДРУЗЬЯ ===[cite: 1]
    friends: {
        sendRequest: (userId) => apiClient.post(`/api/friends/requests/${userId}`),
        acceptRequest: (requestId) => apiClient.post(`/api/friends/requests/${requestId}/accept`),
        rejectRequest: (requestId) => apiClient.post(`/api/friends/requests/${requestId}/reject`),
        removeFriend: (userId) => apiClient.delete(`/api/friends/${userId}`),
        getFriendsList: () => apiClient.get('/api/friends'),
        getRequests: () => apiClient.get('/api/friends/requests'), // Входящие/исходящие заявки[cite: 1]
    },

    // === 7. ЧАТЫ И СООБЩЕНИЯ (REST-история) ===[cite: 1]
    chats: {
        getChats: () => apiClient.get('/api/chats'),
        createOrOpenChat: (userId) => apiClient.post('/api/chats', { userId }),
        getChatMessages: (chatId) => apiClient.get(`/api/chats/${chatId}/messages`), // История сообщений[cite: 1]
        deleteMessage: (messageId) => apiClient.delete(`/api/messages/${messageId}`),
        updateMessage: (messageId, content) => apiClient.put(`/api/messages/${messageId}`, { content }),
    }
};