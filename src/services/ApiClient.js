import axios from "axios";

const API_BASE_URL = "http://localhost:8080";
let refreshPromise = null;

const apiClient = axios.create({
    baseURL: API_BASE_URL,
});

// Добавляем токен в каждый запрос
apiClient.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Обновление токена при 401
apiClient.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;
        if (error.response && error.response.status === 401 && !originalRequest?._retry) {
            originalRequest._retry = true;
            try {
                if (!refreshPromise) {
                    const refreshToken = localStorage.getItem("refresh");
                    if (!refreshToken) throw new Error("No refresh token");
                    refreshPromise = axios.post(`${API_BASE_URL}/api/auth/refresh`, { refreshToken });
                }

                const res = await refreshPromise;
                refreshPromise = null;

                const newToken = res.data.accessToken;
                localStorage.setItem("token", newToken);
                originalRequest.headers["Authorization"] = `Bearer ${newToken}`;
                return apiClient.request(originalRequest);
            } catch (refreshErr) {
                refreshPromise = null;
                localStorage.clear();
                window.location.href = "/";
            }
        }
        return Promise.reject(error);
    }
);

export default apiClient;
