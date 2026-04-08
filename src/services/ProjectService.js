import apiClient from "./ApiClient";

export const getAllProjects = async () => {
    return await apiClient.get("/api/projects");
};

export const createProject = async (project) => {
    return await apiClient.post("/api/projects", project);
};