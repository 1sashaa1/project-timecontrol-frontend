import axios from "axios";

const API_BASE_URL = "http://localhost:8080/api/tasks";

const api = axios.create({
    baseURL: API_BASE_URL,
});

api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("token");
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Перехват ошибок
api.interceptors.response.use(
    (response) => response,
    (error) => {
        console.error("API error:", error);
        return Promise.reject(error);
    }
);

export const retrieveAllTasks = (userId) =>
    api.get(`/user/${userId}`);

export const createTask = async (creatorUserId, assigneeEmployeeId, task) => {
    try {
        const response = await api.post(
            `/user/${creatorUserId}/assign/${assigneeEmployeeId}`,
            task
        );
        return response.data;
    } catch (err) {
        console.error("Error creating task:", err);
        throw err;
    }
};

export const updateStatus = (taskId, newStatus) => {
    // newStatus: "planned", "in_progress", "done"
    return api.patch(`/tasks/${taskId}/status`, { status: newStatus });
};

export const retrieveTaskById = (taskId) =>
    api.get(`/${taskId}`);

export const updateTask = (task, id) =>
    api.put(`/${id}`, task);

export const deleteTask = (id) =>
    api.delete(`/${id}`);

export const markDone = (id) =>
    api.patch(`/${id}/task-done`);

export const markPending = (id) =>
    api.patch(`/${id}/task-pending`);

export const markInProgress = (id) =>
    api.patch(`/${id}/task-progress`);

