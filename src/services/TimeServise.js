import api from "./ApiClient";

export const startTimer = (taskId, employeeId) =>
    api.post(`/api/time/start?taskId=${taskId}&employeeId=${employeeId}`);

export const stopTimer = (taskId, employeeId) =>
    api.post(`/api/time/stop?taskId=${taskId}&employeeId=${employeeId}`);

export const getTodayReport = (employeeId) =>
    api.get(`/api/time/report/today/${employeeId}`);
