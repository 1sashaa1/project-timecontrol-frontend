import React, { useEffect, useState, useContext, useCallback } from "react";
import { AuthContext } from "../contexts/AuthContext";
import TaskList from "../components/TaskList";
import TaskForm from "../components/TaskForm";
import {
    retrieveAllTasks,
    createTask,
    updateStatus,
    deleteTask
} from "../services/TaskService";
import { getUserId } from "../services/EmployeeService";
import "../css/Dashboard.css";
import * as XLSX from "xlsx";
import Sidebar from "../components/Sidebar";

function Dashboard() {
    const { logout } = useContext(AuthContext);
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);

    const userId = getUserId();

    const fetchTasks = useCallback(async () => {
        setLoading(true);
        try {
            const response = await retrieveAllTasks(userId);
            const tasksArray = Array.isArray(response.data) ? response.data : [];
            console.log("Tasks fetched:", tasksArray);
            setTasks(tasksArray);
        } catch (err) {
            console.error("Error fetching tasks:", err);
            setTasks([]);
        } finally {
            setLoading(false);
        }
    }, [userId]);

    useEffect(() => {
        if (userId) fetchTasks();
    }, [userId, fetchTasks]);

    useEffect(() => {
        if (tasks.length > 0) {
            console.log("Tasks успешно сохранены! Количество:", tasks.length);
            console.log("Проверенный объект:", tasks[0]);
        } else if (!loading) {
            console.log("Tasks пусты или произошла ошибка.");
        }
    }, [tasks, loading]);

    const handleCreate = async task => {
        try {
            await createTask(userId, userId, task);
            fetchTasks();
        } catch (err) {
            console.error("Error creating task:", err);
        }
    };

    const handleStatusChange = async (taskId, newStatus) => {
        try {
            await updateStatus(taskId, newStatus);
            fetchTasks();
        } catch (err) {
            console.error("Error updating status:", err);
        }
    };

    const handleDelete = async taskId => {
        try {
            await deleteTask(taskId);
            fetchTasks();
        } catch (err) {
            console.error("Error deleting task:", err);
        }
    };

    const exportToExcel = () => {
        // Заголовки и данные
        const worksheetData = tasks.map(task => ({
            ID: task.id,
            Title: task.title,
            Description: task.description,
            Status: task.status ?? "planned",
            Priority: task.priority ?? "normal",
            StartDate: task.startDate ?? "",
            EndDate: task.endDate ?? ""
        }));

        // Создаём рабочий лист
        const worksheet = XLSX.utils.json_to_sheet(worksheetData);

        // Создаём книгу
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Tasks");

        // Сохраняем файл
        XLSX.writeFile(workbook, "tasks_report.xlsx");
    };


    return (
        <div className="dashboard-layout">
            <Sidebar />
        <div className="dashboard-container">
            <header className="dashboard-header">
                <h1>Dashboard</h1>
                <button className="logout-btn" onClick={logout}>
                    Logout
                </button>
            </header>

            <section className="task-section">
                <TaskForm onCreate={handleCreate}/>

                {loading ? (
                    <p className="loading-text">Loading tasks...</p>
                ) : tasks.length === 0 ? (
                    <p className="no-tasks">No tasks assigned or created.</p>
                ) : (
                    <TaskList
                        tasks={tasks}
                        onStatusChange={handleStatusChange}
                        onDelete={handleDelete}
                    />
                )}
            </section>
            <button className="status-btn done" onClick={exportToExcel}>Скачать отчёт (Excel)</button>
        </div>
        </div>
    );
}

export default Dashboard;
