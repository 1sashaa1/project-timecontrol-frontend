import axios from "axios";

const API_URL = "http://localhost:8080/api/auth";

export const apiClient = axios.create({
    baseURL: API_URL
});

export const register = (data) =>
    apiClient.post("/register", data);

export const login = (data) =>
    apiClient.post("/login", data);

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

apiClient.interceptors.request.use((config) => {
    const token = getToken();
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

apiClient.interceptors.response.use(
    response => response,
    error => {
        if (error.response && error.response.status === 401) {
            console.log("JWT expired or invalid — logging out");
            localStorage.removeItem("token");
            window.location.href = "/login";
        }
        return Promise.reject(error);
    }
);

