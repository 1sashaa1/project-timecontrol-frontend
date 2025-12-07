import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";

function SettingsPage() {
    const [profile, setProfile] = useState({
        firstName: "",
        lastName: "",
        email: "",
        avatarUrl: "",
        language: "ru",
    });

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

    const handleProfileChange = (field, value) =>
        setProfile({ ...profile, [field]: value });

    const handleUiChange = (field, value) =>
        setUi({ ...ui, [field]: value });

    const handleNotifChange = (field) =>
        setNotifications({ ...notifications, [field]: !notifications[field] });

    return (
        <div className="p-8 space-y-10 max-w-2xl mx-auto">
            <h1 className="text-3xl font-bold">Настройки профиля</h1>

            {/* ПРОФИЛЬ */}
            <Card className="p-6 space-y-4">
                <h2 className="text-xl font-semibold">Профиль</h2>

                <div className="grid gap-4">
                    <div>
                        <Label>Имя</Label>
                        <Input
                            value={profile.firstName}
                            onChange={(e) =>
                                handleProfileChange("firstName", e.target.value)
                            }
                        />
                    </div>

                    <div>
                        <Label>Фамилия</Label>
                        <Input
                            value={profile.lastName}
                            onChange={(e) =>
                                handleProfileChange("lastName", e.target.value)
                            }
                        />
                    </div>

                    <div>
                        <Label>Email</Label>
                        <Input
                            type="email"
                            value={profile.email}
                            onChange={(e) =>
                                handleProfileChange("email", e.target.value)
                            }
                        />
                    </div>

                    <div>
                        <Label>Язык</Label>
                        <Select
                            value={profile.language}
                            onValueChange={(v) => handleProfileChange("language", v)}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Выбери язык" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="ru">Русский</SelectItem>
                                <SelectItem value="en">English</SelectItem>
                                <SelectItem value="pl">Polski</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </Card>

            {/* UI НАСТРОЙКИ */}
            <Card className="p-6 space-y-4">
                <h2 className="text-xl font-semibold">Интерфейс</h2>

                <div className="grid gap-4">
                    <div>
                        <Label>Тема</Label>
                        <Select
                            value={ui.theme}
                            onValueChange={(v) => handleUiChange("theme", v)}
                        >
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="light">Светлая</SelectItem>
                                <SelectItem value="dark">Тёмная</SelectItem>
                                <SelectItem value="system">Системная</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div>
                        <Label>Формат даты</Label>
                        <Select
                            value={ui.dateFormat}
                            onValueChange={(v) => handleUiChange("dateFormat", v)}
                        >
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="DD.MM.YYYY">DD.MM.YYYY</SelectItem>
                                <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                                <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div>
                        <Label>Формат времени</Label>
                        <Select
                            value={ui.timeFormat}
                            onValueChange={(v) => handleUiChange("timeFormat", v)}
                        >
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="24h">24 часа</SelectItem>
                                <SelectItem value="12h">12 часов</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div>
                        <Label>Первый день недели</Label>
                        <Select
                            value={ui.weekStart}
                            onValueChange={(v) => handleUiChange("weekStart", v)}
                        >
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="monday">Понедельник</SelectItem>
                                <SelectItem value="sunday">Воскресенье</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </Card>

            {/* УВЕДОМЛЕНИЯ */}
            <Card className="p-6 space-y-4">
                <h2 className="text-xl font-semibold">Уведомления</h2>

                <div className="flex items-center justify-between">
                    <Label>Email уведомления по задачам</Label>
                    <Switch
                        checked={notifications.emailTasks}
                        onCheckedChange={() => handleNotifChange("emailTasks")}
                    />
                </div>

                <div className="flex items-center justify-between">
                    <Label>Напоминания о дедлайнах</Label>
                    <Switch
                        checked={notifications.deadlines}
                        onCheckedChange={() => handleNotifChange("deadlines")}
                    />
                </div>

                <div className="flex items-center justify-between">
                    <Label>Напомнить начать/остановить таймер</Label>
                    <Switch
                        checked={notifications.timerReminders}
                        onCheckedChange={() => handleNotifChange("timerReminders")}
                    />
                </div>
            </Card>

            <Button className="w-full">Сохранить изменения</Button>
        </div>
    );
}

export default SettingsPage;
