import React from "react";
import "../css/Sidebar.css";

function Sidebar() {
    return (
        <aside className="sidebar">
            <h2 className="sidebar-title">Dashboard</h2>
            <nav className="sidebar-nav">
                <ul>
                    <li><i className="icon icon-dashboard" /> Dashboard</li>
                    <li><i className="icon icon-stats" /> Statistics</li>
                    <li><i className="icon icon-archive" /> Archives</li>
                    <li><i className="icon icon-chat" /> Chat</li>
                    <li><i className="icon icon-inbox" /> Inbox</li>
                    <li><i className="icon icon-settings" /> Settings</li>
                </ul>
            </nav>
        </aside>
    );
}

export default Sidebar;
