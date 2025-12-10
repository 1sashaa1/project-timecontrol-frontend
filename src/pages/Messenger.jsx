import React, { useEffect, useState, useRef } from "react";
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

    const [dialogs, setDialogs] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);

    const [messages, setMessages] = useState([]);
    const [text, setText] = useState("");

    const [stompClient, setStompClient] = useState(null);
    const subscriptionRef = useRef(null); // Подписка на конкретный диалог
    const messagesEndRef = useRef(null); // Для автоскролла

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);


    useEffect(() => {
        const socket = new SockJS("http://localhost:8080/ws"); // URL твоего SockJS endpoint
        const client = new Client({
            // Используем SockJS для совместимости с браузером
            webSocketFactory: () => socket,
            reconnectDelay: 5000, // автопереподключение
        });

        // onConnect вызывается после успешного соединения
        client.onConnect = () => {
            console.log("WS Connected");
            setStompClient(client);
        };

        // Обработка ошибок
        client.onStompError = (frame) => {
            console.error("STOMP Error:", frame);
        };

        client.activate(); // Важно: запускаем клиент
        return () => client.deactivate(); // Очистка при размонтировании
    }, []);


    function parseSentAt(sentAtArray) {
        if (!Array.isArray(sentAtArray) || sentAtArray.length < 6) return new Date();
        const [year, month, day, hour, minute, second] = sentAtArray;
        return new Date(year, month - 1, day, hour, minute, second);
    }


    useEffect(() => {
        loadUserDialogs();
    }, []);

    const loadUserDialogs = async () => {
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
    };

    const searchEmployees = async () => {
        if (query.trim() === "") {
            setSearchResults([]);
            return;
        }
        try {
            const res = await searchEmployeesApi(query);
            setSearchResults(res.data);
        } catch (e) {
            console.error(e);
        }
    };

    const openDialog = async (user) => {
        if (subscriptionRef.current) {
            subscriptionRef.current.unsubscribe();
        }

        setSelectedUser(user);

        // Подгружаем сообщения
        const res = await loadDialogMessagesApi(userId, user.id);
        const normalized = res.data.map(m => ({ ...m, timestamp: parseSentAt(m.sentAt) }));
        setMessages(normalized);

        // Если пользователя нет в списке диалогов — добавляем
        if (!dialogs.find(d => d.id === user.id)) {
            setDialogs(prev => [...prev, user]);
        }

        // Подписка на WS
        if (stompClient) {
            const topic = `/topic/dialog/${userId}_${user.id}`;
            const sub = stompClient.subscribe(topic, (msg) => {
                const message = JSON.parse(msg.body);
                setMessages(prev => [...prev, message]);
            });
            subscriptionRef.current = sub;
        }

        setSearchResults([]);
        setQuery("");
    };


    const sendMessage = () => {
        if (!text.trim() || !selectedUser || !stompClient) return;
console.log(selectedUser)
        const payload = {
            senderId: userId,
            receiverId: selectedUser.id,
            content: text,
            timestamp: new Date().toISOString(),
            sender: { id: userId, surname: "Вы", name: "" }
        };
        const getDialogTopic = (id1, id2) => {
            const [a, b] = [id1, id2].sort((x, y) => x - y);
            return `/topic/dialog/${a}_${b}`;
        };

// Подписка
        const topic = getDialogTopic(userId, selectedUser.id);

        stompClient.publish({
            destination: "/app/chat.send",
            body: JSON.stringify(payload),
        });

        setMessages(prev => [...prev, payload]);
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
                    onKeyUp={searchEmployees}
                />
                {searchResults.map((emp) => (
                    <div
                        key={emp.id}
                        className="item"
                        onClick={() => openDialog(emp)}
                    >
                        {emp.surname} {emp.name}
                    </div>
                ))}

                <hr />
                <h3>Диалоги</h3>
                    {dialogs.map(user => (
                        <div
                            key={user.id}
                            className="dialogItem"
                            onClick={() => openDialog(user)}
                        >
                            {user.employee?.surname} {user.employee?.name}
                        </div>
                    ))}

                </div>

            <div className="chatArea">
                {selectedUser ? (
                    <>
                        <h3 style={{marginLeft: 10}}>
                            Диалог с {selectedUser.employee?.surname} {selectedUser.employee?.name}
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
                    {m.sender.surname} {m.sender.name}
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
