import React, { useEffect, useState } from "react";
import { retrieveAllTasks } from "../services/TaskService";
import TimeTrackerEnhanced from "../components/TimeTrackerEnhanced";
import Sidebar from "../components/Sidebar";
import { getUserId } from "../services/EmployeeService";
import "../css/Tracker.css";

export default function Tracker() {
    const userId = getUserId();
    const [tasks, setTasks] = useState([]);
    const [selectedTaskId, setSelectedTaskId] = useState(null);

    useEffect(() => {
        if (!userId) return;
        retrieveAllTasks(userId)
            .then(res => {
                const data = res.data;
                setTasks(Array.isArray(data) ? data : data.tasks || []);
            })
            .catch(err => console.error(err));
    }, [userId]);

    if (!userId) return <div>Loading...</div>;

    return (
        <div className="dashboard-layout">
            <Sidebar />

            <div className="dashboard-container tracker">
                <div className="tracker-card">
                    <div className="tracker-header">
                        <h2 className="tracker-title">Выберите задачу</h2>
                    </div>

                    <div className="tracker-select-wrap">
                        <select
                            value={selectedTaskId || ""}
                            onChange={(e) => setSelectedTaskId(Number(e.target.value))}
                            className="tracker-select"
                        >
                            <option value="" disabled>Мои задачи</option>
                            {Array.isArray(tasks) && tasks.map(task => (
                                <option key={task.id} value={task.id}>{task.title}</option>
                            ))}
                        </select>
                    </div>

                    {selectedTaskId && (
                        <div className="task-details">
                            {Array.isArray(tasks) && tasks
                                .filter(t => t.id === selectedTaskId)
                                .map(task => (
                                    <div key={task.id} className="task-details-content">
                                        <div className="task-row">
                                            <span className="task-label">Название:</span>
                                            <span className="task-value">{task.title}</span>
                                        </div>
                                        <div className="task-row">
                                            <span className="task-label">Описание:</span>
                                            <span className="task-value">
                  {task.description || "Описание отсутствует"}
                </span>
                                        </div>
                                        <div className="task-row">
                                            <span className="task-label">Приоритет:</span>
                                            <span className="task-pill">
                  {task.priority || "не указан"}
                </span>
                                        </div>
                                        <div className="task-row">
                                            <span className="task-label">Дедлайн:</span>
                                            <span className="task-value">{task.endDate || "Не указан"}</span>
                                        </div>
                                    </div>
                                ))}
                        </div>
                    )}

                    {selectedTaskId && (
                        <div className="tracker-timer">
                            <TimeTrackerEnhanced employeeId={userId} taskId={selectedTaskId} />
                        </div>
                    )}
                </div>
            </div>

        </div>
    );
}