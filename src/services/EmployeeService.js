import { jwtDecode } from "jwt-decode";
import apiClient from "./ApiClient";

export const updateEmployee = async (data) => {
    const token = localStorage.getItem("token");
    console.log("Token:", token); // должно быть не null
    return apiClient.put("/api/employees/update", data, {
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

export const getPositions = async () => {
    const response = await apiClient.get("/api/employees/positions");
    return response.data; // массив объектов { id, name }
};

