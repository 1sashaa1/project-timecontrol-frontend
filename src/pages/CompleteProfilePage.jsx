import React, { useState } from "react";
import { updateEmployee } from "../services/EmployeeService";
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

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrors({}); // очищаем ошибки

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
            <h2 className="profile-title">Fill Your Profile</h2>
            <form className="profile-form" onSubmit={handleSubmit}>
                <input
                    className="profile-input"
                    placeholder="Surname"
                    value={form.surname}
                    onChange={(e) => setForm({ ...form, surname: e.target.value })}
                />
                {errors.surname && <p className="error">{errors.surname}</p>}
                <input
                    className="profile-input"
                    placeholder="Name"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
                <input
                    className="profile-input"
                    placeholder="Patronymic"
                    value={form.patronymic}
                    onChange={(e) => setForm({ ...form, patronymic: e.target.value })}
                />
                <input
                    className="profile-input"
                    placeholder="Phone"
                    type="tel"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                />
                <input
                    className="profile-input"
                    placeholder="Position"
                    value={form.position}
                    onChange={(e) => setForm({ ...form, position: e.target.value })}
                />
                <button className="profile-button" type="submit">Save</button>
            </form>
        </div>
    );
}

export default CompleteProfilePage;
