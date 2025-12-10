import api from "./ApiClient";

export const startTimer = (taskId, employeeId) =>
    api.post("/api/time/start", { taskId, employeeId });

export const pauseTimer = (taskId, employeeId) =>
    api.post("/api/time/pause", { taskId, employeeId });

export const resumeTimer = (taskId, employeeId) =>
    api.post("/api/time/resume", { taskId, employeeId });

export const stopTimer = (taskId, employeeId) =>
    api.post("/api/time/stop", { taskId, employeeId });

export const getTodayReport = (employeeId) =>
    api.get(`/api/time/report/today?employeeId=${employeeId}`);

export const getTaskTotals = (employeeId) =>
    api.get(`/api/time/report/tasks?employeeId=${employeeId}`);
