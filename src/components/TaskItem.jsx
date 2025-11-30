import React from "react";

function TaskItem({ task, onStatusChange, onDelete }) {
    const handleClick = (newStatus) => {
        onStatusChange(task.id, newStatus);
    };

    const renderButton = () => {
        switch (task.status) {
            case "planned":
                return (
                    <button onClick={() => handleClick("in_progress")} className="status-btn start">
                        Начать
                    </button>
                );
            case "in_progress":
                return (
                    <>
                        <button onClick={() => handleClick("done")} className="status-btn done">
                            Завершить
                        </button>
                        <button onClick={() => handleClick("planned")} className="status-btn back">
                            Вернуться к запланированному
                        </button>
                    </>
                );
            case "done":
                return (
                    <button onClick={() => handleClick("in_progress")} className="status-btn reopen">
                        Открыть заново
                    </button>
                );
            default:
                return null;
        }
    };

    return (
        <li className={`task-item ${task.status || "planned"}`}>
            <div className="task-main">
                <h3>{task.title}</h3>
                <p>{task.description}</p>
                <p className="task-meta">
                    Статус: <strong>{task.status ?? "planned"}</strong> |
                    Приоритет: <strong>{task.priority ?? "normal"}</strong>
                </p>
            </div>

            <div className="task-actions">
                {renderButton()}
                <button className="delete-btn" onClick={() => onDelete(task.id)}>
                    Удалить
                </button>
            </div>
        </li>
    );
}

export default TaskItem;
