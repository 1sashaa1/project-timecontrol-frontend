import React, { useContext, useEffect, useState } from "react";
import "../css/SettingsPage.css";
import Sidebar from "../components/Sidebar";
import { ThemeContext } from "../contexts/ThemeContext";
import { LanguageContext } from "../contexts/LanguageContext";
import { getProfile, updateProfile } from "../services/EmployeeService";

function SettingsPage() {
    const [profile, setProfile] = useState({
        firstName: "",
        lastName: "",
        email: "",
        language: "ru",
    });

    const { theme, setTheme } = useContext(ThemeContext);
    const { language, changeLanguage, t } = useContext(LanguageContext);

    const [ui, setUi] = useState({
        theme: "system",
        dateFormat: "DD.MM.YYYY",
        timeFormat: "24h",
        weekStart: "monday",
    });

    const [notifications, setNotifications] = useState({
        emailTasks: true,
        deadlines: true,
        timerReminders: false,
    });

    useEffect(() => {
        async function loadProfile() {
            try {
                const data = await getProfile();
                setProfile({
                    firstName: data.firstName || "",
                    lastName: data.lastName || "",
                    email: data.email || "",
                });
            } catch (err) {
                console.error("Ошибка при загрузке профиля:", err);
                alert(`Ошибка загрузки профиля: ${err.message}`);
            }
        }

        loadProfile();
    }, []);

    const handleUiChange = (field, value) => {
        setUi({ ...ui, [field]: value });
        if (field === "theme") {
            setTheme(value);
        }
    };

    const handleProfileChange = (field, value) =>
        setProfile({ ...profile, [field]: value });

    const handleNotifChange = (field) =>
        setNotifications({ ...notifications, [field]: !notifications[field] });

    const handleSave = async () => {
        // Подтверждение перед сохранением
        const confirmed = window.confirm(t.confirmSaveProfile || "Сохранить изменения профиля?");
        if (!confirmed) return;

        try {
            const updated = await updateProfile(profile);

            if (updated && updated.status && updated.status >= 200 && updated.status < 300) {
                alert(t.profileSaved || "Профиль успешно сохранён!");
            }
        } catch (err) {
            console.error("Ошибка при сохранении профиля:", err);
            alert(`Ошибка при сохранении профиля: ${err.message}`);
        }
    };

    return (
        <div className="dashboard-layout">
            <Sidebar />
            <div className="dashboard-container">
                <div className="settings-page">
                    <h1>{t.settings}</h1>

                    {/* ПРОФИЛЬ */}
                    <div className="card">
                        <h2>{t.profile}</h2>
                        <div className="form-grid">
                            <div className="form-group">
                                <label>{t.firstName}</label>
                                <input
                                    value={profile.firstName}
                                    onChange={(e) => handleProfileChange("firstName", e.target.value)}
                                />
                            </div>

                            <div className="form-group">
                                <label>{t.lastName}</label>
                                <input
                                    value={profile.lastName}
                                    onChange={(e) => handleProfileChange("lastName", e.target.value)}
                                />
                            </div>

                            <div className="form-group">
                                <label>{t.email}</label>
                                <input
                                    type="email"
                                    value={profile.email}
                                    onChange={(e) => handleProfileChange("email", e.target.value)}
                                />
                            </div>

                            <div className="form-group">
                                <label>{t.language}</label>
                                <select
                                    value={language}
                                    onChange={(e) => changeLanguage(e.target.value)}
                                >
                                    <option value="ru">{t.langRu}</option>
                                    <option value="en">{t.langEn}</option>
                                    <option value="pl">{t.langPl}</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* UI НАСТРОЙКИ */}
                    <div className="card">
                        <h2>{t.interface}</h2>
                        <div className="form-grid">
                            <div>
                                <label>{t.theme}</label>
                                <select
                                    value={ui.theme}
                                    onChange={(e) => handleUiChange("theme", e.target.value)}
                                >
                                    <option value="light">{t.themeLight}</option>
                                    <option value="dark">{t.themeDark}</option>
                                    <option value="system">{t.themeSystem}</option>
                                </select>
                            </div>

                            <div>
                                <label>{t.dateFormat}</label>
                                <select
                                    value={ui.dateFormat}
                                    onChange={(e) => handleUiChange("dateFormat", e.target.value)}
                                >
                                    <option value="DD.MM.YYYY">DD.MM.YYYY</option>
                                    <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                                    <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                                </select>
                            </div>

                            <div>
                                <label>{t.timeFormat}</label>
                                <select
                                    value={ui.timeFormat}
                                    onChange={(e) => handleUiChange("timeFormat", e.target.value)}
                                >
                                    <option value="24h">{t.time24}</option>
                                    <option value="12h">{t.time12}</option>
                                </select>
                            </div>

                            <div>
                                <label>{t.weekStart}</label>
                                <select
                                    value={ui.weekStart}
                                    onChange={(e) => handleUiChange("weekStart", e.target.value)}
                                >
                                    <option value="monday">{t.monday}</option>
                                    <option value="sunday">{t.sunday}</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* УВЕДОМЛЕНИЯ */}
                    <div className="card">
                        <h2>{t.notifications}</h2>
                        {[
                            { label: t.notifTasks, field: "emailTasks" },
                            { label: t.notifDeadlines, field: "deadlines" },
                            { label: t.notifTimer, field: "timerReminders" }
                        ].map((item, i) => (
                            <div key={i} className="flex-between">
                                <span>{item.label}</span>
                                <input
                                    type="checkbox"
                                    checked={notifications[item.field]}
                                    onChange={() => handleNotifChange(item.field)}
                                />
                            </div>
                        ))}
                    </div>

                    <button className="save-btn" onClick={handleSave}>
                        {t.save}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default SettingsPage;
