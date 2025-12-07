import apiClient from "./ApiClient";

export const retrieveAllTasks = (userId) =>
    apiClient.get(`/api/tasks/user/${userId}`);

export const createTask = async (creatorUserId, assigneeEmployeeId, task) => {
    console.log(task)
    try {
        const response = await apiClient.post(
            `/api/tasks/user/${creatorUserId}/assign/${assigneeEmployeeId}`,
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
    return apiClient.patch(`/api/tasks/tasks/${taskId}/status`, { status: newStatus });
};

export const retrieveTaskById = (taskId) =>
    apiClient.get(`/api/tasks/${taskId}`);

export const updateTask = (task, id) =>
    apiClient.put(`/api/tasks/${id}`, task);

export const deleteTask = (id) =>
    apiClient.delete(`/api/tasks/${id}`);

export const markDone = (id) =>
    apiClient.patch(`/api/tasks/${id}/task-done`);

export const markPending = (id) =>
    apiClient.patch(`/api/tasks/${id}/task-pending`);

export const markInProgress = (id) =>
    apiClient.patch(`/api/tasks/${id}/task-progress`);

