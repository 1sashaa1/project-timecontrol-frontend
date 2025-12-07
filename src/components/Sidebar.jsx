import { NavLink } from "react-router-dom";
import {
    FiHome,
    FiBarChart2,
    FiAward,
    FiMessageCircle,
    FiClock,
    FiSettings
} from "react-icons/fi";
import "../css/Sidebar.css"

function Sidebar() {
    return (
        <aside className="sidebar">
            <h2 className="sidebar-title">Ваш тайм-менеджмент</h2>

            <nav className="sidebar-nav">
                <ul>
                    <li>
                        <NavLink to="/dashboard" className="sidebar-link">
                            <FiHome className="icon" /> Панель управления
                        </NavLink>
                    </li>

                    <li>
                        <NavLink to="/statistics" className="sidebar-link">
                            <FiBarChart2 className="icon" /> Статистика
                        </NavLink>
                    </li>

                    <li>
                        <NavLink to="/achievements" className="sidebar-link">
                            <FiAward className="icon" /> Достижения
                        </NavLink>
                    </li>

                    <li>
                        <NavLink to="/chat" className="sidebar-link">
                            <FiMessageCircle className="icon" /> Чат
                        </NavLink>
                    </li>

                    <li>
                        <NavLink to="/tracker" className="sidebar-link">
                            <FiClock className="icon" /> Трекер
                        </NavLink>
                    </li>

                    <li>
                        <NavLink to="/settings" className="sidebar-link">
                            <FiSettings className="icon" /> Настройки
                        </NavLink>
                    </li>
                </ul>
            </nav>
        </aside>
    );
}

export default Sidebar;
