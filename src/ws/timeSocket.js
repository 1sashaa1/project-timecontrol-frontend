import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";

let client = null;
let subscription = null;

export function connect(employeeId, onMessage) {
    const subscribe = () => {
        if (subscription) subscription.unsubscribe();
        subscription = client.subscribe(`/topic/time/${employeeId}`, (msg) => {
            onMessage(JSON.parse(msg.body));
        });
    };

    if (!client || !client.active) {
        client = new Client({
            webSocketFactory: () => {
                console.log("Creating SockJS instance...");
                return new SockJS(`http://localhost:8080/ws`);
            },
            debug: console.log,
            reconnectDelay: 5000,
            onConnect: function () {
                subscription = this.subscribe(`/topic/time/${employeeId}`, (message) => {
                    const body = JSON.parse(message.body);
                    onMessage(body);
                });
            },
            onStompError: (frame) => console.error("Broker error:", frame),
            onWebSocketError: (err) => console.error("WebSocket error:", err),
        });
        client.activate();
    } else if (client.connected) {
        if (subscription) subscription.unsubscribe();
        subscription = client.subscribe(`/topic/time/${employeeId}`, (msg) => {
            onMessage(JSON.parse(msg.body));
        });
    } else {
        console.log("Client exists but not connected yet, waiting for onConnect...");
    }
    return client;
}


export async function disconnect() {
    if (subscription) {
        subscription.unsubscribe();
        subscription = null;
    }
    if (client) {
        await client.deactivate();
        client = null;
    }
}
