import React, { useEffect, useState } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd"; // форк react-beautiful-dnd
import { getAllUsers, deleteUser, createUser, updateUser } from "../services/AdminService";
import "../css/AdminPanel.css";
import { getPositions } from "../services/EmployeeService";
import * as XLSX from "xlsx";

function AdminPanel() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingUser, setEditingUser] = useState(null);
    const [form, setForm] = useState({
        surname: "",
        name: "",
        patronymic: "",
        email: "",
        phone: "",
        position: "",
        status: "active",
        hireDate: ""
    });
    const [positions, setPositions] = useState([]);
    const [columns, setColumns] = useState([
        "ID", "Фамилия", "Имя", "Отчество", "Email", "Телефон", "Позиция", "Статус", "Действия"
    ]);
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [log, setLog] = useState([]);
    const [statusFilter, setStatusFilter] = useState("ALL");
    const [sortField, setSortField] = useState(null);
    const [sortDir, setSortDir] = useState("asc");
    const [search, setSearch] = useState("");

    useEffect(() => {
        const fetchPositions = async () => {
            try {
                const data = await getPositions();
                setPositions(data);
            } catch (err) {
                console.error("Ошибка загрузки позиций:", err);
            }
        };
        fetchPositions();
    }, []);

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

    const addLog = (action) => setLog(prev => [...prev, `${new Date().toLocaleString()}: ${action}`]);

    const exportExcel = () => {
        const worksheetData = users.map(u => ({
            ID: u.id,
            Фамилия: u.surname,
            Имя: u.name,
            Отчество: u.patronymic,
            Email: u.email,
            Телефон: u.phone,
            Позиция: u.position,
            Статус: u.status
        }));
        const worksheet = XLSX.utils.json_to_sheet(worksheetData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Users");
        XLSX.writeFile(workbook, "users_report.xlsx");
        addLog("Экспорт пользователей в Excel");
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Вы уверены, что хотите заблокировать этого сотрудника?")) return;
        try {
            await deleteUser(id);
            addLog(`Сотрудник ID=${id} заблокирован/разблокирован`);
            fetchUsers();
        } catch (err) {
            console.error("Ошибка удаления:", err);
        }
    };

    const handleEditClick = (user) => {
        setEditingUser(user);
        setForm({ ...user });
    };

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

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        if (editingUser) {
            const confirmMsg = `Вы уверены, что хотите обновить данные сотрудника?\n\n` +
                `Старые: ${JSON.stringify(editingUser, null, 2)}\n\n` +
                `Новые: ${JSON.stringify(form, null, 2)}`;
            if (!window.confirm(confirmMsg)) return;
        }
        try {
            if (editingUser) {
                await updateUser(editingUser.id, form);
                addLog(`Сотрудник ID=${editingUser.id} обновлён`);
            } else {
                await createUser(form);
                addLog(`Создан новый сотрудник: ${form.surname} ${form.name}`);
            }
            handleCancelEdit();
            fetchUsers();
        } catch (err) {
            console.error("Ошибка сохранения:", err);
        }
    };

    // ------------------ Сортировка ------------------
    const fieldMap = {
        "ID": "id",
        "Фамилия": "surname",
        "Имя": "name",
        "Отчество": "patronymic",
        "Email": "email",
        "Телефон": "phone",
        "Позиция": "position",
        "Статус": "status"
    };

    const handleSort = (col) => {
        if (sortField === col) {
            setSortDir(sortDir === "asc" ? "desc" : "asc");
        } else {
            setSortField(col);
            setSortDir("asc");
        }
    };

    const sortedUsers = [...users].sort((a, b) => {
        if (!sortField) return 0;
        const key = fieldMap[sortField];
        const valA = (a[key] || "").toString();
        const valB = (b[key] || "").toString();
        return sortDir === "asc" ? valA.localeCompare(valB) : valB.localeCompare(valA);
    });

    const filteredUsers = sortedUsers.filter(u => {
        const fullName = `${u.surname} ${u.name} ${u.patronymic}`.toLowerCase();
        const matchesSearch =
            fullName.includes(search.toLowerCase()) ||
            (u.email || "").toLowerCase().includes(search.toLowerCase());

        const matchesStatus =
            statusFilter === "ALL" || (u.status || "").toLowerCase() === statusFilter.toLowerCase();

        return matchesSearch && matchesStatus;
    });

    const paginatedUsers = filteredUsers.slice((page - 1) * pageSize, page * pageSize);
    const totalPages = Math.ceil(filteredUsers.length / pageSize);

    const handleDragEnd = (result) => {
        if (!result.destination) return;
        const newColumns = Array.from(columns);
        const [removed] = newColumns.splice(result.source.index, 1);
        newColumns.splice(result.destination.index, 0, removed);
        setColumns(newColumns);
    };

    if (loading) return <p>Загрузка...</p>;

    return (
        <div className="admin-container">
            <h1 className="admin-title">Админ-панель</h1>

            {/* Фильтры */}
            <div className="admin-filters">
                <input
                    className="filter-input"
                    placeholder="Поиск по имени/email..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                />
                <select
                    className="filter-select"
                    value={statusFilter}
                    onChange={e => setStatusFilter(e.target.value)}
                >
                    <option value="ALL">Все</option>
                    <option value="active">Активные</option>
                    <option value="inactive">Неактивные</option>
                </select>
            </div>

            {/* Форма */}
            <form className="admin-form" onSubmit={handleFormSubmit}>
                <input placeholder="Фамилия" value={form.surname} onChange={e => setForm({...form, surname: e.target.value})}/>
                <input placeholder="Имя" value={form.name} onChange={e => setForm({...form, name: e.target.value})}/>
                <input placeholder="Отчество" value={form.patronymic} onChange={e => setForm({...form, patronymic: e.target.value})}/>
                <input placeholder="Email" value={form.email} onChange={e => setForm({...form, email: e.target.value})}/>
                <input placeholder="Телефон" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})}/>
                <select value={form.position} onChange={e => setForm({...form, position: e.target.value})}>
                    <option value="">Выберите должность</option>
                    {positions.map(pos => <option key={pos} value={pos}>{pos}</option>)}
                </select>
                <input type="date" value={form.hireDate} onChange={e => setForm({...form, hireDate: e.target.value})}/>
                <button type="submit" className="btn-submit">{editingUser ? "Сохранить" : "Создать"}</button>
                {editingUser && <button type="button" onClick={handleCancelEdit} className="btn-cancel">Отмена</button>}
            </form>

            <button onClick={exportExcel} className="btn-export">Экспорт в Excel</button>

            <DragDropContext onDragEnd={handleDragEnd}>
                <Droppable droppableId="columns" direction="horizontal">
                    {(provided) => (
                        <table className="admin-table" {...provided.droppableProps} ref={provided.innerRef}>
                            <thead>
                            <tr>
                                {columns.map((col, index) => (
                                    <Draggable key={col} draggableId={col} index={index}>
                                        {(provided) => (
                                            <th
                                                ref={provided.innerRef}
                                                {...provided.draggableProps}
                                                {...provided.dragHandleProps}
                                            >
                                                {col}
                                            </th>
                                        )}
                                    </Draggable>
                                ))}
                            </tr>
                            </thead>
                            <tbody>
                            {users.map((user) => (
                                <tr key={user.id} className={user.status === "inactive" ? "inactive-row" : ""}>
                                    {columns.map((col) => {
                                        switch (col) {
                                            case "ID": return <td key={col}>{user.id}</td>;
                                            case "Фамилия": return <td key={col}>{user.surname}</td>;
                                            case "Имя": return <td key={col}>{user.name}</td>;
                                            case "Отчество": return <td key={col}>{user.patronymic}</td>;
                                            case "Email": return <td key={col}>{user.email}</td>;
                                            case "Телефон": return <td key={col}>{user.phone}</td>;
                                            case "Позиция": return <td key={col}>{user.position}</td>;
                                            case "Статус": return <td key={col}>{user.status}</td>;
                                            case "Действия": return (
                                                <td key={col}>
                                                    <button  className="btn-edit" disabled={user.status === "inactive"}  onClick={() => handleEditClick(user)}>Редактировать</button>
                                                    <button className="btn-delete"  onClick={() => handleDelete(user.id)}>
                                                        {user.status === "active" ? "Заблокировать" : "Разблокировать"}

                                                    </button>
                                                </td>
                                            );
                                            default: return null;
                                        }
                                    })}
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    )}
                </Droppable>
            </DragDropContext>

            {/* Пагинация */}
            <div className="pagination">
                <button disabled={page === 1} onClick={() => setPage(prev => prev - 1)}>Назад</button>
                <span>{page} / {totalPages}</span>
                <button disabled={page === totalPages} onClick={() => setPage(prev => prev + 1)}>Вперед</button>
            </div>

            {/* Лог действий */}
            <div className="admin-log">
                <h3>Лог действий администратора:</h3>
                <ul>
                    {log.map((entry, idx) => <li key={idx}>{entry}</li>)}
                </ul>
            </div>
        </div>
    );
}

export default AdminPanel;
