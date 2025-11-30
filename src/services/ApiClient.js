import axios from "axios";

const API_BASE_URL = "http://localhost:8080";

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
        if (error.response && error.response.status === 401) {
            try {
                const refreshToken = localStorage.getItem("refresh");
                if (!refreshToken) throw new Error("No refresh token");

                const res = await axios.post(`${API_BASE_URL}/api/auth/refresh`, {
                    refreshToken, // проверь, какое поле сервер ждёт
                });

                const newToken = res.data.accessToken;
                console.log(newToken)
                localStorage.setItem("token", newToken);

                error.config.headers["Authorization"] = "Bearer " + newToken;
                return apiClient.request(error.config);
            } catch (refreshErr) {
                localStorage.clear();
                window.location.href = "/login";
            }
        }
        return Promise.reject(error);
    }
);

export default apiClient;
