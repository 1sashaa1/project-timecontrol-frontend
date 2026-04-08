import React, { useEffect, useState, useContext, useCallback, useRef } from "react";
import { AuthContext } from "../contexts/AuthContext";
import TaskList from "../components/TaskList";
import TaskForm from "../components/TaskForm";
import {
    retrieveAllTasks,
    createTask,
    updateStatus,
    deleteTask, updateTask
} from "../services/TaskService";
import {getAllEmployees, getUserId} from "../services/EmployeeService";
import "../css/Dashboard.css";
import * as XLSX from "xlsx";
import Sidebar from "../components/Sidebar";
import {isAdmin} from "../services/AuthService";
import { useNavigate } from "react-router-dom";
import { useToast } from "../contexts/ToastContext";
import RobotoMedium from "../font/Roboto-Medium.js";
import jsPDF from "jspdf";
import "jspdf-autotable";
import autoTable from "jspdf-autotable";
import {createProject, getAllProjects} from "../services/ProjectService";

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
    const [projects, setProjects] = useState([]);
    const [projectName, setProjectName] = useState("");
    const [employees, setEmployees] = useState([]);
    const lastTasksRequestRef = useRef(0);

    const userId = getUserId();

    const fetchTasks = useCallback(async () => {
        if (!userId) return;
        const requestId = Date.now();
        lastTasksRequestRef.current = requestId;
        setLoading(true);
        try {
            const response = await retrieveAllTasks(userId);
            const tasksArray = Array.isArray(response.data) ? response.data : [];
            if (lastTasksRequestRef.current === requestId) {
                setTasks(tasksArray);
            }
        } catch (err) {
            console.error("Error fetching tasks:", err);
        } finally {
            if (lastTasksRequestRef.current === requestId) {
                setLoading(false);
            }
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

    const fetchProjects = useCallback(async () => {
        try {
            const response = await getAllProjects();
            const projectsArray = Array.isArray(response.data) ? response.data : [];
            setProjects(projectsArray);
        } catch (err) {
            console.error("Error fetching projects:", err);
        }
    }, []);

    useEffect(() => {
        fetchProjects();
    }, [fetchProjects]);


    const handleCreateOrUpdate = async (task) => {
        if (editingTask) {
            if (!window.confirm("Сохранить изменения задачи?")) return;
            try {
                await updateTask(task, editingTask.id);
                fetchTasks();
                showToast("Задача успешно обновлена!", "success");
                setEditingTask(null);
            } catch (err) {
                showToast("Ошибка при обновлении задачи", "error");
            }
        } else {
            if (!window.confirm("Создать задачу?")) return;
            try {
                await createTask(
                    userId,
                    task.assigneeId,
                    task.projectId,
                    task
                );
                fetchTasks();
                showToast("Задача успешно создана!", "success");
            } catch (err) {
                showToast("Ошибка при создании задачи", "error");
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

    const parseDateArray = (arr) => {
        if (!Array.isArray(arr) || arr.length < 3) return "";
        const [year, month, day, hour = 0, minute = 0] = arr;
        return new Date(year, month - 1, day, hour, minute).toLocaleDateString();
    };

    const exportToExcel = () => {
        const worksheetData = tasks.map(task => ({
            ID: task.id,
            Title: task.title,
            Description: task.description,
            Status: task.status ?? "planned",
            Priority: task.priority ?? "normal",
            StartDate: parseDateArray(task.startDate),
            EndDate: parseDateArray(task.endDate)
        }));

        console.log(worksheetData);

        const worksheet = XLSX.utils.json_to_sheet(worksheetData);

        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Tasks");
        XLSX.writeFile(workbook, "tasks_report.xlsx");
    };

    const exportToPDF = () => {
        const doc = new jsPDF();

        doc.addFileToVFS("Roboto-Medium.ttf", RobotoMedium);
        doc.addFont("Roboto-Medium.ttf", "Roboto", "normal");
        doc.setFont("Roboto");

        const tableColumn = ["ID", "Title", "Description", "Status", "Priority", "Start Date", "End Date"];
        const tableRows = tasks.map(task => [
            task.id,
            task.title,
            task.description,
            task.status ?? "planned",
            task.priority ?? "normal",
            parseDateArray(task.startDate),
            parseDateArray(task.endDate)
        ]);

        autoTable(doc, {
            head: [tableColumn],
            body: tableRows,
            startY: 20,
            styles: { font: "Roboto", fontSize: 10 },
            headStyles: { fillColor: [22, 160, 133] },
        });

        doc.save("tasks_report.pdf");
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

    useEffect(() => {
        const fetchEmployees = async () => {
            try {
                const response = await getAllEmployees(); // API вызов
                setEmployees(response);
            } catch (err) {
                console.error("Ошибка загрузки сотрудников", err);
            }
        };
        fetchEmployees();
    }, []);

    const handleCreateProject = async (e) => {
        e.preventDefault();

        if (!projectName.trim()) {
            alert("Введите название проекта");
            return;
        }

        try {
            await createProject({
                projectName,
                status: "planned"
            });

            fetchProjects();
            setProjectName("");
            showToast("Проект создан", "success");

        } catch (err) {
            showToast("Ошибка создания проекта", "error");
        }
    };

    const totalTasks = tasks.length;
    const doneTasks = tasks.filter(task => task.status === "done").length;
    const inProgressTasks = tasks.filter(task => task.status === "in_progress").length;
    const completionRate = totalTasks ? Math.round((doneTasks / totalTasks) * 100) : 0;

    return (
        <div className="dashboard-layout">
            <Sidebar/>

            <div className="dashboard-container">
                <header className="dashboard-header">
                    <div className="dashboard-title-group">
                        <h1>Панель управления задачами</h1>
                        <p>Планируйте, отслеживайте и закрывайте задачи команды</p>
                    </div>

                    <div className="dashboard-actions">
                        {isAdmin() && (
                            <button className="admin-btn" onClick={() => navigate("/admin")}>
                                Панель администратора
                            </button>
                        )}
                        <button className="logout-btn" onClick={logout}>
                            Выйти
                        </button>
                    </div>
                </header>

                <section className="dashboard-stats">
                    <div className="stat-card">
                        <span className="stat-label">Всего задач</span>
                        <strong>{totalTasks}</strong>
                    </div>
                    <div className="stat-card">
                        <span className="stat-label">В работе</span>
                        <strong>{inProgressTasks}</strong>
                    </div>
                    <div className="stat-card">
                        <span className="stat-label">Завершено</span>
                        <strong>{doneTasks}</strong>
                    </div>
                    <div className="stat-card">
                        <span className="stat-label">Прогресс</span>
                        <strong>{completionRate}%</strong>
                    </div>
                </section>

                <form className="project-form" onSubmit={handleCreateProject}>
                    <input
                        type="text"
                        className="project-input"
                        placeholder="Название нового проекта"
                        value={projectName}
                        onChange={e => setProjectName(e.target.value)}
                    />
                    <button className="project-create-btn" type="submit">Создать проект</button>
                </form>

                <section className="task-section">

                    {projects.length === 0 && (
                        <p className="no-projects">Нет доступных проектов. Создайте проект или проверьте права доступа.</p>
                    )}
                    <TaskForm
                        onCreate={handleCreateOrUpdate}
                        editingTask={editingTask}
                        projects={projects}
                        employees={employees}
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
                <div className="export-actions">
                    <button className="status-btn done" onClick={exportToExcel}>Скачать отчёт (Excel)</button>
                    <button onClick={exportToPDF} className="status-btn done">
                        Экспорт в PDF
                    </button>
                </div>
            </div>
        </div>
    );
}

export default Dashboard;
