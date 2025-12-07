import React, {useEffect, useState} from "react";
import "../css/TaskForm.css";

function TaskForm({ onCreate, editingTask}) {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [startTime, setStartTime] = useState("");
    const [endTime, setEndTime] = useState("");
    const [priority, setPriority] = useState("");
    const [status, setStatus] = useState("");


    const handleSubmit = (e) => {
        e.preventDefault();

        const trimmedTitle = title.trim();
        const trimmedDescription = description.trim();

        if (!trimmedTitle) {
            alert("Введите название задачи");
            return;
        }

        if (trimmedTitle.length > 100) {
            alert("Название слишком длинное (максимум 100 символов)");
            return;
        }

        if (trimmedDescription.length > 500) {
            alert("Описание слишком длинное (максимум 500 символов)");
            return;
        }

        const validPriorities = ["low", "normal", "high"];
        if (priority && !validPriorities.includes(priority)) {
            alert("Выберите корректный приоритет");
            return;
        }

        if (!startTime || !endTime) {
            alert("Укажите даты начала и окончания");
            return;
        }

        const start = new Date(startTime);
        const end = new Date(endTime);

        if (isNaN(start.getTime()) || isNaN(end.getTime())) {
            alert("Неверный формат даты");
            return;
        }

        if (start >= end) {
            alert("Дата окончания должна быть позже даты начала");
            return;
        }

        onCreate({
            title: trimmedTitle,
            description: trimmedDescription,
            startDate: start.toISOString(),
            endDate: end.toISOString(),
            priority: priority || "low",
            status: status || "planned"
        });

        setTitle("");
        setDescription("");
        setStartTime("");
        setEndTime("");
        setPriority("");
        setStatus("");
    };

    const arrayToDate = (arr) => {
        if (!Array.isArray(arr)) return null;

        if (arr.length === 5) {
            return new Date(arr[0], arr[1] - 1, arr[2], arr[3], arr[4]);
        }

        // LocalDate: [yyyy, MM, dd]
        if (arr.length === 3) {
            return new Date(arr[0], arr[1] - 1, arr[2], 0, 0);
        }

        return null;
    };

    const toInputDateTime = (date) => {
        if (!date) return "";

        const pad = n => String(n).padStart(2, "0");

        const year = date.getFullYear();
        const month = pad(date.getMonth() + 1);
        const day = pad(date.getDate());
        const hours = pad(date.getHours());
        const minutes = pad(date.getMinutes());

        return `${year}-${month}-${day}T${hours}:${minutes}`;
    };


    useEffect(() => {
        if (!editingTask) return;

        const start = arrayToDate(editingTask.startDate);
        const end = arrayToDate(editingTask.endDate);

        console.log(start, end);

        setTitle(editingTask.title);
        setDescription(editingTask.description);

        setStartTime(start ? toInputDateTime(start) : "");
        setEndTime(end ? toInputDateTime(end) : "");

        setPriority(editingTask.priority || "");
        setStatus(editingTask.status || "planned");
    }, [editingTask]);

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
                    className="status-input"
                >
                    <option value="">Выбрать приоритет</option>
                    <option value="low">Низкий</option>
                    <option value="normal">Обычный</option>
                    <option value="high">Высокий</option>
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

            <button type="submit" className="btn-submit">
                {editingTask ? "Сохранить изменения" : "Добавить задачу"}
            </button>

        </form>
    );
}

export default TaskForm;
