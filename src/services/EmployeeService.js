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

export const getProfile = async () => {
    const response = await apiClient.get("/api/profile");
    return response.data;
};

export const updateProfile = async (profile) => {
    try {
        const response = await apiClient.put("/api/profile", {
            firstName: profile.firstName,
            lastName: profile.lastName,
            email: profile.email,
        });
        return response.data;
    } catch (error) {
        console.error("Error updating profile:", error);
        throw error;
    }
};



