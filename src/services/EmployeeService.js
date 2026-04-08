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
    const stored = localStorage.getItem("userId");
    if (stored) return Number(stored);

    const token = localStorage.getItem("token");
    if (!token) return null;
    try {
        const decoded = jwtDecode(token);
        return decoded.userId ?? null;
    } catch (e) {
        console.error("Failed to decode token userId:", e);
        return null;
    }
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

export const getAllEmployees = async () => {
    try {
        const response = await apiClient.get("/api/admin/employees");
        return response.data;
    } catch (err) {
        try {
            const fallbackResponse = await apiClient.get("/api/employees");
            return fallbackResponse.data;
        } catch (fallbackErr) {
            console.error("Error fetching employees:", fallbackErr);
            throw fallbackErr;
        }
    }
};


