import React, { useEffect, useState } from "react";
import { getAllUsers, deleteUser, createUser, updateUser } from "../services/AdminService";
import "../css/AdminPanel.css";
import {getPositions} from "../services/EmployeeService";

function AdminPanel() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingUser, setEditingUser] = useState(null); // для редактирования
    const [form, setForm] = useState({
        surname: "",
        name: "",
        patronymic: "",
        email: "",
        phone: "",
        position: "",
        status: "ACTIVE",
        hireDate: ""
    });

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

    // Загрузка всех пользователей
    const fetchUsers = async () => {
        try {
            const res = await getAllUsers();
            setUsers(res.data);
        } catch (err) {
            console.error("Ошибка загрузки пользователей:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchUsers(); }, []);

    // Удаление с подтверждением
    const handleDelete = async (id) => {
        if (!window.confirm("Вы уверены, что хотите удалить этого сотрудника?")) return;
        try {
            await deleteUser(id);
            fetchUsers();
        } catch (err) {
            console.error("Ошибка удаления:", err);
        }
    };

    // Начало редактирования
    const handleEditClick = (user) => {
        setEditingUser(user);
        setForm({ ...user });
    };

    // Отмена редактирования
    const handleCancelEdit = () => {
        setEditingUser(null);
        setForm({
            surname: "",
            name: "",
            patronymic: "",
            email: "",
            phone: "",
            position: "",
            status: "active",
            hireDate: ""
        });
    };

    // Создание / обновление
    const handleFormSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingUser) {
                await updateUser(editingUser.id, form);
            } else {
                await createUser(form);
            }
            handleCancelEdit();
            fetchUsers();
        } catch (err) {
            console.error("Ошибка сохранения пользователя:", err);
        }
    };

    if (loading) return <p>Загрузка...</p>;

    return (
        <div className="admin-container">
            <h1 className="admin-title">Админ-панель</h1>

            <form className="admin-form" onSubmit={handleFormSubmit}>
                <input placeholder="Фамилия" value={form.surname}
                       onChange={e => setForm({...form, surname: e.target.value})}/>
                <input placeholder="Имя" value={form.name} onChange={e => setForm({...form, name: e.target.value})}/>
                <input placeholder="Отчество" value={form.patronymic}
                       onChange={e => setForm({...form, patronymic: e.target.value})}/>
                <input placeholder="Email" value={form.email}
                       onChange={e => setForm({...form, email: e.target.value})}/>
                <input placeholder="Телефон" value={form.phone}
                       onChange={e => setForm({...form, phone: e.target.value})}/>
                <select
                    className="profile-select"
                    value={form.position}
                    onChange={(e) => setForm({...form, position: e.target.value})}
                >
                    <option value="">Выберите должность</option>
                    {positions.map((pos) => (
                        <option key={pos} value={pos}>
                            {pos}
                        </option>
                    ))}
                </select>


                <select value={form.status} onChange={e => setForm({...form, status: e.target.value})}>
                    <option value="ACTIVE">active</option>
                    <option value="INACTIVE">inactive</option>
                </select>
                <input type="date" value={form.hireDate} onChange={e => setForm({...form, hireDate: e.target.value})}/>
                <button type="submit">{editingUser ? "Сохранить" : "Создать"}</button>
                {editingUser && <button type="button" onClick={handleCancelEdit}>Отмена</button>}
            </form>

            <table className="admin-table">
                <thead>
                <tr>
                    <th>ID</th>
                    <th>Фамилия</th>
                    <th>Имя</th>
                    <th>Отчество</th>
                    <th>Email</th>
                    <th>Телефон</th>
                    <th>Позиция</th>
                    <th>Статус</th>
                    <th>Действия</th>
                </tr>
                </thead>
                <tbody>
                {users.map(u => (
                    <tr key={u.id}>
                        <td>{u.id}</td>
                        <td>{u.surname}</td>
                        <td>{u.name}</td>
                        <td>{u.patronymic}</td>
                        <td>{u.email}</td>
                        <td>{u.phone}</td>
                        <td>{u.position}</td>
                        <td>{u.status}</td>
                        <td>
                            <button onClick={() => handleEditClick(u)}>Редактировать</button>
                            <button onClick={() => handleDelete(u.id)}>Удалить</button>
                        </td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );
}

export default AdminPanel;
