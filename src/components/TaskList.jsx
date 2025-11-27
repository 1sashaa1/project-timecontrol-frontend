import React from "react";
import TaskItem from "./TaskItem";

function TaskList({ tasks, onStatusChange, onDelete }) {
    console.log("TaskList received tasks:", tasks);
    return (
        <ul className="task-list">
            {tasks.map(task => (
                <TaskItem
                    key={task.id}
                    task={task}
                    onStatusChange={onStatusChange}
                    onDelete={onDelete}
                />
            ))}
        </ul>
    );
}

export default TaskList;
