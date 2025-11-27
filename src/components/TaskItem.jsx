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
                        Start
                    </button>
                );
            case "in_progress":
                return (
                    <>
                        <button onClick={() => handleClick("done")} className="status-btn done">
                            Finish
                        </button>
                        <button onClick={() => handleClick("planned")} className="status-btn back">
                            Back to Planned
                        </button>
                    </>
                );
            case "done":
                return (
                    <button onClick={() => handleClick("in_progress")} className="status-btn reopen">
                        Reopen
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
                    Status: <strong>{task.status ?? "planned"}</strong> |
                    Priority: <strong>{task.priority ?? "normal"}</strong>
                </p>
            </div>

            <div className="task-actions">
                {renderButton()}
                <button className="delete-btn" onClick={() => onDelete(task.id)}>
                    Delete
                </button>
            </div>
        </li>
    );
}

export default TaskItem;
