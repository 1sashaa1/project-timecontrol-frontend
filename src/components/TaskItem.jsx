import React, { useEffect, useState } from "react";

function TaskItem({ task, onStatusChange, onDelete, onEdit}) {
    const [timeLeft, setTimeLeft] = useState("");
    const [progress, setProgress] = useState(0);
    const [progressColor, setProgressColor] = useState("#4caf50");

    const handleClick = (newStatus) => {
        onStatusChange(task.id, newStatus);
    };

    const renderButton = () => {
        switch (task.status) {
            case "planned":
                return <button onClick={() => handleClick("in_progress")} className="status-btn start">Начать</button>;
            case "in_progress":
                return (
                    <>
                        <button onClick={() => handleClick("done")} className="status-btn done">Завершить</button>
                        <button onClick={() => handleClick("planned")} className="status-btn back">Вернуться к запланированному</button>
                    </>
                );
            case "done":
                return <button onClick={() => handleClick("in_progress")} className="status-btn reopen">Открыть заново</button>;
            default:
                return null;
        }
    };

    const parseDateArray = (arr) => {
        if (!arr || arr.length < 3) return null;
        const [year, month, day, hour = 0, minute = 0] = arr;
        return new Date(year, month - 1, day, hour, minute);
    };

    const arrayToDate = (arr) => {
        if (!Array.isArray(arr)) return null;

        // LocalDateTime: [yyyy, MM, dd, HH, mm]
        if (arr.length === 5) {
            return new Date(arr[0], arr[1] - 1, arr[2], arr[3], arr[4]);
        }

        // LocalDate: [yyyy, MM, dd]
        if (arr.length === 3) {
            return new Date(arr[0], arr[1] - 1, arr[2], 0, 0);
        }

        return null;
    };



    const formatDate = (date) => {
        if (!date) return null;

        return date.toLocaleString("ru-RU", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    useEffect(() => {
        const start = arrayToDate(task.startDate);
        const end = arrayToDate(task.endDate);

        if (end <= start) {
            setTimeLeft("Неверный диапазон дат");
            setProgress(0);
            setProgressColor("gray");
            return;
        }

        if (!start || !end) return;

        const updateTimer = () => {
            const now = new Date();

            const totalMs = end - start;
            const elapsedMs = now - start;
            const pct = Math.min(Math.max((elapsedMs / totalMs) * 100, 0), 100);
            setProgress(pct);

            const diffMs = end - now;
            if (diffMs <= 0) {
                setTimeLeft("Просрочено!");
                setProgressColor("red");
            } else {
                const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
                const hours = Math.floor((diffMs / (1000 * 60 * 60)) % 24);
                const minutes = Math.floor((diffMs / (1000 * 60)) % 60);
                setTimeLeft(`${days}д ${hours}ч ${minutes}м`);

                const ratio = diffMs / totalMs;
                const red = Math.min(255, Math.floor(255 * (1 - ratio)));
                const green = Math.min(255, Math.floor(255 * ratio));
                setProgressColor(`rgb(${red},${green},0)`);
            }
        };

        updateTimer();
        const interval = setInterval(updateTimer, 60000);
        return () => clearInterval(interval);
    }, [task.startDate, task.endDate]);

    const isOverdue = parseDateArray(task.endDate) < new Date() && task.status !== "done";

    const start = parseDateArray(task.startDate);
    const end = parseDateArray(task.endDate);

    return (
        <li className={`task-item ${task.status || "planned"} ${isOverdue ? "overdue" : ""}`}>
            <div className="task-main">
                <h3>{task.title}</h3>
                <p>{task.description}</p>

                {(start || end) && (
                    <p className="task-dates">
                        {start && <span>Начало: <strong>{formatDate(start)}</strong></span>}
                        {" "}
                        {end && <>
                            <br/>
                            <span> Дедлайн: <strong>{formatDate(end)}</strong></span>
                            {timeLeft && <span className={`time-left ${isOverdue ? "overdue-label" : ""}`}> ({timeLeft})</span>}
                        </>}
                    </p>
                )}

                <div className="progress-bar-container">
                    <div className={`progress-bar ${isOverdue ? "overdue" : ""}`} style={{ width: `${progress}%`, backgroundColor: progressColor }} />
                </div>

                <p className="task-meta">
                    Статус: <strong>{task.status ?? "planned"}</strong> {", "}
                    приоритет: <strong>{task.priority ?? "normal"}</strong>
                </p>
            </div>

            <div className="task-actions">
                {renderButton()}
                <button className="delete-btn" onClick={() => onDelete(task.id)}>Удалить</button>
                <button className="edit-btn" onClick={() => onEdit(task)}>
                    Редактировать
                </button>

            </div>
        </li>
    );
}

export default TaskItem;
