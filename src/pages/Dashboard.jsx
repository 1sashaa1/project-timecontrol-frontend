import React, { useEffect, useState, useContext, useCallback } from "react";
import { AuthContext } from "../contexts/AuthContext";
import TaskList from "../components/TaskList";
import TaskForm from "../components/TaskForm";
import {
    retrieveAllTasks,
    createTask,
    updateStatus,
    deleteTask, updateTask
} from "../services/TaskService";
import { getUserId } from "../services/EmployeeService";
import "../css/Dashboard.css";
import * as XLSX from "xlsx";
import Sidebar from "../components/Sidebar";
import {isAdmin} from "../services/AuthService";
import { useNavigate } from "react-router-dom";
import { useToast } from "../components/ToastContext";


function Dashboard() {
    const { logout } = useContext(AuthContext);
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("");
    const [priorityFilter, setPriorityFilter] = useState("");
    const [dateFrom, setDateFrom] = useState("");
    const [dateTo, setDateTo] = useState("");
    const { showToast } = useToast();
    const [editingTask, setEditingTask] = useState(null);

    const userId = getUserId();

    const fetchTasks = useCallback(async () => {
        setLoading(true);
        try {
            const response = await retrieveAllTasks(userId);
            const tasksArray = Array.isArray(response.data) ? response.data : [];
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
        } else if (!loading) {
            console.log("Tasks пусты или произошла ошибка.");
        }
    }, [tasks, loading]);

    const handleCreateOrUpdate = async (task) => {
        if (editingTask) {
            if (!window.confirm("Сохранить изменения задачи?")) return;
            try {
                await updateTask(task, editingTask.id);
                fetchTasks();
                showToast("Задача успешно обновлена!", "success");
                setEditingTask(null); // сброс состояния редактирования
            } catch (err) {
                showToast("Ошибка при обновлении задачи", "error");
                console.error("Error updating task:", err);
            }
        } else {
            if (!window.confirm("Создать задачу?")) return;
            try {
                await createTask(userId, userId, task);
                fetchTasks();
                showToast("Задача успешно создана!", "success");
            } catch (err) {
                showToast("Ошибка при создании задачи", "error");
                console.error("Error creating task:", err);
            }
        }
    };


    const handleStatusChange = async (taskId, newStatus) => {
        try {
            await updateStatus(taskId, newStatus);
            fetchTasks();
            showToast("Статус обновлён", "success");
        } catch (err) {
            showToast("Ошибка изменения статуса", "error");
            console.error("Error updating status:", err);
        }
    };

    const handleDelete = async taskId => {
        if (!window.confirm("Удалить эту задачу?")) return;

        try {
            await deleteTask(taskId);
            fetchTasks();
            showToast("Задача удалена", "success");
        } catch (err) {
            showToast("Ошибка удаления", "error");
            console.error("Error deleting task:", err);
        }
    };

    const handleEdit = (task) => {
        setEditingTask(task);
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const exportToExcel = () => {
        const worksheetData = tasks.map(task => ({
            ID: task.id,
            Title: task.title,
            Description: task.description,
            Status: task.status ?? "planned",
            Priority: task.priority ?? "normal",
            StartDate: task.startDate ?? "",
            EndDate: task.endDate ?? ""
        }));

        const worksheet = XLSX.utils.json_to_sheet(worksheetData);

        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Tasks");

        XLSX.writeFile(workbook, "tasks_report.xlsx");


    };

        const filteredTasks = tasks.filter(task => {
            const matchesSearch =
                task.title.toLowerCase().includes(search.toLowerCase());

            const matchesStatus =
                statusFilter === "" || task.status === statusFilter;

            const matchesPriority =
                priorityFilter === "" || task.priority === priorityFilter;

            const matchesDate =
                (!dateFrom || new Date(task.startDate) >= new Date(dateFrom)) &&
                (!dateTo || new Date(task.endDate) <= new Date(dateTo));

            return matchesSearch && matchesStatus && matchesPriority && matchesDate;
        });


    return (
        <div className="dashboard-layout">
            <Sidebar/>

            <div className="dashboard-container">
                <header className="dashboard-header">
                    <h1>Панель управления задачами</h1>
                    <button className="logout-btn" onClick={logout}>
                        Выйти из системы
                    </button>
                    {isAdmin() && (
                        <button className="admin-btn" onClick={() => navigate("/admin")}>
                            Admin Panel
                        </button>
                    )}
                </header>

                <section className="task-section">
                    <TaskForm onCreate={handleCreateOrUpdate}
                              editingTask={editingTask}
                    />

                    <div className="filters-container">

                        <div className="search-row">
                            <input
                                type="text"
                                className="search-input"
                                placeholder="Поиск по названию..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>

                        <div className="filters-row">
                            {/* Фильтр по статусу */}
                            <select
                                className="filter-select"
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                            >
                                <option value="">Все статусы</option>
                                <option value="planned">Запланировано</option>
                                <option value="in_progress">В процессе</option>
                                <option value="done">Сделано</option>
                            </select>

                            <select
                                className="filter-select"
                                value={priorityFilter}
                                onChange={(e) => setPriorityFilter(e.target.value)}
                            >
                                <option value="">Все приоритеты</option>
                                <option value="low">Низкий</option>
                                <option value="normal">Обычный</option>
                                <option value="high">Высокий</option>
                            </select>

                        </div>
                        <div className="filters-row">
                            <div className="filter-group-inline">
                                <label>Начало выполнения</label>
                                <input
                                    type="date"
                                    className="filter-date"
                                    value={dateFrom}
                                    onChange={(e) => setDateFrom(e.target.value)}
                                />
                            </div>

                            <div className="filter-group-inline">
                                <label>Конец выполнения</label>
                                <input
                                    type="date"
                                    className="filter-date"
                                    value={dateTo}
                                    onChange={(e) => setDateTo(e.target.value)}
                                />
                            </div>
                        </div>


                    </div>
                    {loading ? (
                        <p className="loading-text">Загрузка задач...</p>
                    ) : tasks.length === 0 ? (
                        <p className="no-tasks">Задачи не назначены и не созданы.</p>
                    ) : (
                        <TaskList
                            tasks={filteredTasks}
                            onStatusChange={handleStatusChange}
                            onDelete={handleDelete}
                            onEdit={handleEdit}
                        />
                    )}
                </section>
                <button className="status-btn done" onClick={exportToExcel}>Скачать отчёт (Excel)</button>
            </div>
        </div>
    );
}

export default Dashboard;
