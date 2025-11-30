import apiClient from "./ApiClient";

export const getAllUsers = () =>
    apiClient.get("/api/admin/employees");

export const getAllTasks = () =>
    apiClient.get("/api/admin/tasks");


export const createUser = (employeeData) => {
    return apiClient.post("/api/admin/employees", employeeData);
};

export const updateUser = (id, employeeData) => {
    return apiClient.put(`/api/admin/employees/${id}`, employeeData);
};

export const deleteUser = (id) => {
    return apiClient.delete(`/api/admin/employees/${id}`);
};

export const changeRole = (userId, newRole) =>
    apiClient.put(`/api/admin/users/${userId}/role`, { role: newRole });