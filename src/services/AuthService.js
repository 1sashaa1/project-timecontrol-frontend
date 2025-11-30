import apiClient from "./ApiClient";

export const register = (data) =>
    apiClient.post("/api/auth/register", data);

export const login = (data) =>
    apiClient.post("/api/auth/login", data);


export const saveToken = (token) => {
    localStorage.setItem("token", token);
};

export const getToken = () => localStorage.getItem("token");

export const isLoggedIn = () => !!getToken();

export const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    localStorage.removeItem("username");
    localStorage.removeItem("role");
};

export const saveUserInfo = (id, username, role) => {
    localStorage.setItem("userId", id);
    localStorage.setItem("username", username);
    localStorage.setItem("role", role);
};

export const getUsername = () => localStorage.getItem("username");
export const getUserId = () => localStorage.getItem("userId");
export const getUserRole = () => localStorage.getItem("role");
export const isAdmin = () => getUserRole() === "ADMIN";
