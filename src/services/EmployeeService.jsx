import axios from "axios";
import { jwtDecode } from "jwt-decode";

const API_BASE_URL = "http://localhost:8080";

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

export const updateEmployee = async (data) => {
    const token = localStorage.getItem("token");
    console.log("Token:", token); // должно быть не null
    return api.put("/api/employees/update", data, {
        headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
        },
    });
};

export const getUserId = () => {
    const token = localStorage.getItem("token");
    if (!token) return null;
    const decoded = jwtDecode(token);
    return decoded.userId;
};


