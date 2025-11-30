import React from "react";
import "../css/Sidebar.css";

function Sidebar() {
    return (
        <aside className="sidebar">
            <h2 className="sidebar-title">Ваш тайм-менеджмент</h2>
            <nav className="sidebar-nav">
                <ul>
                    <li><i className="icon icon-dashboard" />Панель управления</li>
                    <li><i className="icon icon-stats" /> Статистика</li>
                    <li><i className="icon icon-archive" /> Достижения</li>
                    <li><i className="icon icon-chat" /> Чат</li>
                    <li><i className="icon icon-inbox" /> Входящие</li>
                    <li><i className="icon icon-settings" /> Настройки</li>
                </ul>
            </nav>
        </aside>
    );
}

export default Sidebar;
