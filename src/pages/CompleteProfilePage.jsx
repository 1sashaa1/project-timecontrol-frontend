import React, {useEffect, useState} from "react";
import {getPositions, updateEmployee} from "../services/EmployeeService";
import { useNavigate } from "react-router-dom";
import "../css/CompleteProfile.css"; // подключаем CSS


function CompleteProfilePage() {
    const navigate = useNavigate();
    const [form, setForm] = useState({
        surname: "",
        name: "",
        patronymic: "",
        email: "",
        phone: "",
        position: ""
    });

    const [errors, setErrors] = useState({});

    const [positions, setPositions] = useState([]);

        useEffect(() => {
        const fetchPositions = async () => {
            try {
                const data = await getPositions();
                setPositions(data);
            } catch (err) {
                console.error("Error fetching positions:", err);
            }
        };
        fetchPositions();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const newErrors = {};

        // Валидация фамилии
        if (!form.surname || form.surname.trim() === "") {
            newErrors.surname = "Фамилия обязательна";
        }

        // Валидация имени
        if (!form.name || form.name.trim() === "") {
            newErrors.name = "Имя обязательно";
        }

        // Валидация отчества (необязательное поле, но можно ограничить длину)
        if (form.patronymic && form.patronymic.length > 50) {
            newErrors.patronymic = "Отчество слишком длинное";
        }

        // Валидация телефона (формат +79001234567 или 89001234567)
        if (!form.phone || !/^\+?\d{10,15}$/.test(form.phone)) {
            newErrors.phone = "Введите корректный номер телефона";
        }

        // Валидация должности
        if (!form.position || form.position.trim() === "") {
            newErrors.position = "Должность обязательна";
        }

        // Если есть ошибки, показываем их и не отправляем на сервер
        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        // Если ошибок нет — отправляем на сервер
        setErrors({}); // очищаем ошибки перед отправкой
        try {
            await updateEmployee(form);
            navigate("/dashboard");
        } catch (err) {
            if (err.response?.status === 400) {
                // backend validation errors
                setErrors(err.response.data);
            } else {
                console.error(err);
            }
        }
    };

    return (
        <div className="profile-container">
            <h2 className="profile-title">Заполните свой профиль</h2>
            <form className="profile-form" onSubmit={handleSubmit}>
                <input
                    className="profile-input"
                    placeholder="Фамилия"
                    value={form.surname}
                    onChange={(e) => setForm({ ...form, surname: e.target.value })}
                />
                {errors.surname && <p className="error">{errors.surname}</p>}
                <input
                    className="profile-input"
                    placeholder="Имя"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
                <input
                    className="profile-input"
                    placeholder="Отчество"
                    value={form.patronymic}
                    onChange={(e) => setForm({ ...form, patronymic: e.target.value })}
                />
                <input
                    className="profile-input"
                    placeholder="Мобильный телефон"
                    type="tel"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                />
                <select
                    className="profile-select"
                    value={form.position}
                    onChange={(e) => setForm({ ...form, position: e.target.value })}
                >
                    <option value="">Выберите должность</option>
                    {positions.map((pos) => (
                        <option key={pos} value={pos.name}>
                            {pos}
                        </option>
                    ))}
                </select>
                {errors.position && <p className="error">{errors.position}</p>}
                <button className="profile-button" type="submit">Сохранить</button>
            </form>
        </div>
    );
}

export default CompleteProfilePage;
