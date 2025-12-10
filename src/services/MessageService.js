import apiClient from "./ApiClient";

export const searchEmployeesApi = (query) =>
    apiClient.get(`/api/employees/search?query=${query}`);

export const loadDialogsApi = (userId) =>
    apiClient.get(`/api/messages/inbox?receiverId=${userId}`);

export const loadDialogMessagesApi = (user1, user2) =>
    apiClient.get(`/api/messages/dialog?user1=${user1}&user2=${user2}`);

export const sendMessageApi = (senderId, receiverId, content) =>
    apiClient.post(`/api/messages/send`, null, {
        params: { senderId, receiverId, content },
    });
