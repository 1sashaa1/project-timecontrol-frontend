import React, { useState } from "react";
import "../css/TaskForm.css"; // не забудьте подключить стили

function TaskForm({ onCreate }) {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [startTime, setStartTime] = useState("");
    const [endTime, setEndTime] = useState("");
    const [priority, setPriority] = useState("");
    const [status, setStatus] = useState("");


    const handleSubmit = (e) => {
        e.preventDefault();
        if (!title.trim()) return;

        onCreate({
            title: title.trim(),
            description: description.trim(),
            startTime,
            endTime,
            priority,
            status
        });

        setTitle("");
        setDescription("");
        setStartTime("");
        setEndTime("");
        setPriority("");
        setStatus("");
    };


    return (
        <form className="task-form" onSubmit={handleSubmit}>
            <h3 className="form-title">Создание задачи</h3>

            <div className="form-block">
                <input
                    type="text"
                    placeholder="Название задачи"
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    required
                    className="input"
                />

                <textarea
                    placeholder="Описание"
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    className="input textarea"
                />
                {/* Выбор приоритета */}
                <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                    className="input"
                >
                    <option value="">Выбрать приоритет</option>
                    <option value="low">Низкий</option>
                    <option value="normal">Обычный</option>
                    <option value="high">Высокий</option>
                </select>

                {/* Выбор статуса */}
                <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="input"
                >
                    <option value="">Выбрать статус</option>
                    <option value="planned">Запланировано</option>
                    <option value="in_progress">В процессе</option>
                    <option value="done">Сделано</option>
                </select>
            </div>

            <div className="time-block">
                <div className="time-item">
                    <label>Начало:</label>
                    <input
                        type="datetime-local"
                        value={startTime}
                        onChange={e => setStartTime(e.target.value)}
                        required
                        className="input"
                    />
                </div>

                <div className="time-item">
                    <label>Окончание:</label>
                    <input
                        type="datetime-local"
                        value={endTime}
                        onChange={e => setEndTime(e.target.value)}
                        required
                        className="input"
                    />
                </div>
            </div>

            <button type="submit" className="btn-submit">Добавить задачу</button>
        </form>
    );
}

export default TaskForm;
