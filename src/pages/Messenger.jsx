import React, { useEffect, useState, useRef, useCallback } from "react";
import {
    searchEmployeesApi,
    loadDialogsApi,
    loadDialogMessagesApi,
} from "../services/MessageService";

import { Client } from "@stomp/stompjs"; // Новый STOMP клиент
import SockJS from "sockjs-client";

import "../css/Messenger.css";
import Sidebar from "../components/Sidebar";
import {getUserId} from "../services/EmployeeService";

export default function Messenger() {
    const userId = getUserId();
    const [query, setQuery] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [searchLoading, setSearchLoading] = useState(false);

    const [dialogs, setDialogs] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const selectedUserRef = useRef(null);

    const [messages, setMessages] = useState([]);
    const [text, setText] = useState("");

    const [stompClient, setStompClient] = useState(null);
    const messagesEndRef = useRef(null); // Для автоскролла

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const getDisplayName = (entity) =>
        `${entity?.employee?.surname ?? entity?.surname ?? ""} ${entity?.employee?.name ?? entity?.name ?? ""}`.trim() || "Пользователь";

    const isInCurrentDialog = useCallback((msg, currentUserId, companionId) => {
        const senderId = msg?.sender?.id;
        const receiverId = msg?.receiver?.id;
        if (!senderId || !receiverId || !companionId) return false;
        return (
            (senderId === currentUserId && receiverId === companionId) ||
            (senderId === companionId && receiverId === currentUserId)
        );
    }, []);

    useEffect(() => {
        if (!userId) return;
        const socket = new SockJS("http://localhost:8080/ws"); // URL твоего SockJS endpoint
        const client = new Client({
            // Используем SockJS для совместимости с браузером
            webSocketFactory: () => socket,
            reconnectDelay: 5000, // автопереподключение
        });

        // onConnect вызывается после успешного соединения
        client.onConnect = () => {
            setStompClient(client);
            client.subscribe("/topic/messages", (frame) => {
                const message = JSON.parse(frame.body);
                const companion = selectedUserRef.current;

                if (companion && isInCurrentDialog(message, userId, companion.id)) {
                    setMessages((prev) => {
                        if (message.messageId && prev.some((m) => m.messageId === message.messageId)) return prev;
                        const normalized = {
                            ...message,
                            timestamp: parseSentAt(message.sentAt)
                        };
                        return [...prev, normalized];
                    });
                }

                setDialogs((prev) => {
                    const otherUser = message.sender?.id === userId ? message.receiver : message.sender;
                    if (!otherUser?.id) return prev;
                    if (prev.some((d) => d.id === otherUser.id)) return prev;
                    return [otherUser, ...prev];
                });
            });
        };

        // Обработка ошибок
        client.onStompError = (frame) => {
            console.error("STOMP Error:", frame);
        };

        client.activate(); // Важно: запускаем клиент
        return () => client.deactivate(); // Очистка при размонтировании
    }, [isInCurrentDialog, userId]);


    function parseSentAt(sentAtArray) {
        if (!Array.isArray(sentAtArray) || sentAtArray.length < 6) return new Date();
        const [year, month, day, hour, minute, second] = sentAtArray;
        return new Date(year, month - 1, day, hour, minute, second);
    }


    const loadUserDialogs = useCallback(async () => {
        if (!userId) return;
        try {
            const res = await loadDialogsApi(userId);

            const unique = new Map();

            res.data.forEach(msg => {
                const companion = msg.sender.id === userId ? msg.receiver : msg.sender;
                unique.set(companion.id, companion);
            });

            setDialogs([...unique.values()]);
        } catch (err) {
            console.error(err);
        }
    }, [userId]);

    useEffect(() => {
        loadUserDialogs();
    }, [loadUserDialogs]);

    useEffect(() => {
        const q = query.trim();
        if (!q) {
            setSearchResults([]);
            return;
        }
        const timeout = setTimeout(async () => {
            setSearchLoading(true);
            try {
                const res = await searchEmployeesApi(q);
                setSearchResults(Array.isArray(res.data) ? res.data : []);
            } catch (e) {
                console.error(e);
            } finally {
                setSearchLoading(false);
            }
        }, 250);
        return () => clearTimeout(timeout);
    }, [query]);

    const openDialog = async (user) => {
        setSelectedUser(user);
        selectedUserRef.current = user;

        // Подгружаем сообщения
        try {
            const res = await loadDialogMessagesApi(userId, user.id);
            const normalized = (Array.isArray(res.data) ? res.data : [])
                .map(m => ({ ...m, timestamp: parseSentAt(m.sentAt) }));
            setMessages(normalized);
        } catch (e) {
            console.error(e);
            setMessages([]);
        }

        // Если пользователя нет в списке диалогов — добавляем
        if (!dialogs.find(d => d.id === user.id)) {
            setDialogs(prev => [...prev, user]);
        }

        setSearchResults([]);
        setQuery("");
    };


    const sendMessage = () => {
        if (!text.trim() || !selectedUser || !stompClient) return;

        const payload = {
            senderId: userId,
            receiverId: selectedUser.id,
            content: text,
            timestamp: new Date().toISOString()
        };
        stompClient.publish({
            destination: "/app/chat.send",
            body: JSON.stringify(payload),
        });
        setText("");
    };

    return (
        <div className="dashboard-layout">
            <Sidebar />
            <div className="dashboard-container">
        <div className="chat-layout">
            <div className="chat-container">

                <div className="chat-settings-page">
                <h3>Поиск</h3>
                <input
                    type="text"
                    value={query}
                    className="searchInput"
                    placeholder="Введите фамилию..."
                    onChange={(e) => setQuery(e.target.value)}
                />
                {searchLoading && <div className="searchHint">Поиск...</div>}
                {searchResults.map((emp) => (
                    <div
                        key={emp.id}
                        className="item"
                        onClick={() => openDialog(emp)}
                    >
                        {getDisplayName(emp)}
                    </div>
                ))}

                <hr />
                <h3>Диалоги</h3>
                    {dialogs.map(user => (
                        <div
                            key={user.id}
                            className={`dialogItem ${selectedUser?.id === user.id ? "active" : ""}`}
                            onClick={() => openDialog(user)}
                        >
                            {getDisplayName(user)}
                        </div>
                    ))}

                </div>

            <div className="chatArea">
                {selectedUser ? (
                    <>
                        <h3 className="chatTitle">
                            Диалог с {getDisplayName(selectedUser)}
                        </h3>

                        <div className="messagesBox">
                            {messages.map((m) => (
                                <div
                                    key={m.messageId || m.timestamp}
                                    className={`message-wrapper ${
                                        m.sender.id === userId ? "message-right" : "message-left"
                                    }`}
                                >
                                    <div className="message-meta">
                <span className="message-author">
                    {getDisplayName(m.sender)}
                </span>
                                        <span className="message-time">
                    {new Date(m.timestamp).toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'})}
                </span>
                                    </div>
                                    <div
                                        className={`message-bubble ${
                                            m.sender.id === userId ? "right-bubble" : "left-bubble"
                                        }`}
                                    >
                                        {m.content}
                                    </div>
                                </div>
                            ))}
                            <div ref={messagesEndRef}></div>
                        </div>


                        {/* Поле ввода */}
                        <div className="inputRow">
                            <input
                                type="text"
                                className="messageInput"
                                value={text}
                                onChange={(e) => setText(e.target.value)}
                                placeholder="Введите сообщение..."
                            />
                            <button className="sendBtn" onClick={sendMessage}>
                                Отправить
                            </button>
                        </div>
                    </>
                ) : (
                    <h3>Выберите сотрудника...</h3>
                )}
            </div>
            </div>
        </div>
            </div>
        </div>
    );
}
