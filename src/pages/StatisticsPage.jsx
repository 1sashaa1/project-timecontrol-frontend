import React, {useEffect, useState} from "react";
import { groupBy } from "lodash";
import { getUserId } from "../services/EmployeeService";

import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from "recharts";
import {retrieveAllTasks} from "../services/TaskService";
import Sidebar from "../components/Sidebar";

function StatisticsPage() {

    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const userId = getUserId();

    useEffect(() => {
        const fetchTasks = async () => {
            setLoading(true);
            try {
                const response = await retrieveAllTasks(userId);
                setTasks(Array.isArray(response.data) ? response.data : []);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchTasks();
    }, [userId]);

    // helper
    const arrayToDate = arr => {
        if (!arr || arr.length < 3) return null;
        const [year, month, day, hour = 0, minute = 0] = arr;
        return new Date(year, month - 1, day, hour, minute);
    };

    const getTasksByStatus = tasks => {
        const grouped = groupBy(tasks, "status");
        return Object.keys(grouped).map(key => ({ status: key, count: grouped[key].length }));
    };

    const getTasksByPriority = tasks => {
        const grouped = groupBy(tasks, "priority");
        return Object.keys(grouped).map(key => ({ priority: key, count: grouped[key].length }));
    };

    const getTasksByYear = tasks => {
        const grouped = groupBy(tasks, t => {
            const start = arrayToDate(t.startDate);
            return start ? start.getFullYear() : "Без даты";
        });
        return Object.keys(grouped).map(year => ({ year, count: grouped[year].length }));
    };

    const getTasksByMonth = tasks => {
        const grouped = groupBy(tasks, t => {
            const start = arrayToDate(t.startDate);
            return start ? `${start.getFullYear()}-${String(start.getMonth()+1).padStart(2,"0")}` : "Без даты";
        });
        return Object.keys(grouped).map(month => ({ month, count: grouped[month].length }));
    };

    const getTasksByWeek = tasks => {
        const grouped = groupBy(tasks, t => {
            if (!t.startDate) return "Без даты";
            const d = arrayToDate(t.startDate);

            // определяем первый день недели (понедельник)
            const day = d.getDay(); // 0=вс, 1=пн ... 6=сб
            const diffToMonday = (day + 6) % 7; // сколько дней до понедельника
            const weekStart = new Date(d);
            weekStart.setDate(d.getDate() - diffToMonday);

            const weekEnd = new Date(weekStart);
            weekEnd.setDate(weekStart.getDate() + 6);

            const format = dt => dt.toLocaleDateString("ru-RU", { day: "2-digit", month: "2-digit", year: "numeric" });
            return `${format(weekStart)} - ${format(weekEnd)}`;
        });

        return Object.keys(grouped).map(week => ({ week, count: grouped[week].length }));
    };

    const statusData = getTasksByStatus(tasks);
    const priorityData = getTasksByPriority(tasks);
    const yearData = getTasksByYear(tasks);
    const monthData = getTasksByMonth(tasks);
    const weekData = getTasksByWeek(tasks);

    const chartStyle = { background: "#1f1f1f", padding: 20, borderRadius: 10, color: "#fff", marginBottom: 30 };

    return (
        <div className="dashboard-layout">
            <Sidebar/>
            <div className="dashboard-container">
        <div className="statistics-panel" style={{ padding: 20, display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 20 }}>
            <div style={chartStyle}>
                <h3>Задачи по статусу</h3>
                <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={statusData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#555"/>
                        <XAxis dataKey="status" stroke="#fff"/>
                        <YAxis stroke="#fff"/>
                        <Tooltip />
                        <Bar dataKey="count" fill="#4caf50" />
                    </BarChart>
                </ResponsiveContainer>
            </div>

            <div style={chartStyle}>
                <h3>Задачи по приоритету</h3>
                <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={priorityData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#555"/>
                        <XAxis dataKey="priority" stroke="#fff"/>
                        <YAxis stroke="#fff"/>
                        <Tooltip />
                        <Bar dataKey="count" fill="#ff9800" />
                    </BarChart>
                </ResponsiveContainer>
            </div>

            <div style={chartStyle}>
                <h3>Задачи по годам</h3>
                <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={yearData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#555"/>
                        <XAxis dataKey="year" stroke="#fff"/>
                        <YAxis stroke="#fff"/>
                        <Tooltip />
                        <Bar dataKey="count" fill="#2196f3" />
                    </BarChart>
                </ResponsiveContainer>
            </div>

            <div style={chartStyle}>
                <h3>Задачи по месяцам</h3>
                <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={monthData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#555"/>
                        <XAxis dataKey="month" stroke="#fff"/>
                        <YAxis stroke="#fff"/>
                        <Tooltip />
                        <Bar dataKey="count" fill="#9c27b0" />
                    </BarChart>
                </ResponsiveContainer>
            </div>

            <div style={chartStyle}>
                <h3>Задачи по неделям</h3>
                <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={weekData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#555"/>
                        <XAxis dataKey="week" stroke="#fff"/>
                        <YAxis stroke="#fff"/>
                        <Tooltip />
                        <Bar dataKey="count" fill="#f44336" />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
        </div>
        </div>
    );
}

export default StatisticsPage;
