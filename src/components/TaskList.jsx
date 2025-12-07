import React from "react";
import TaskItem from "./TaskItem";

function TaskList({ tasks, onStatusChange, onDelete, onEdit}) {
    return (
        <ul className="task-list">
            {tasks.map(task => (
                <TaskItem
                    key={task.id}
                    task={task}
                    onStatusChange={onStatusChange}
                    onDelete={onDelete}
                    onEdit={onEdit}
                />
            ))}
        </ul>
    );
}

export default TaskList;
