import React, { useEffect, useState, useRef } from "react";
import { startTimer, stopTimer, getTodayReport } from "../services/TimeServise";
import { connect, disconnect } from "../ws/timeSocket";

function formatHMS(seconds) {
    const h = Math.floor(seconds/3600);
    const m = Math.floor((seconds%3600)/60);
    const s = seconds%60;
    return `${h.toString().padStart(2,'0')}:${m.toString().padStart(2,'0')}:${s.toString().padStart(2,'0')}`;
}

export default function TimeTrackerEnhanced({employeeId, taskId }) {

    const timerRef = useRef(null);

    const [running, setRunning] = useState(false);
    const [elapsedSec, setElapsedSec] = useState(0);
    const [trackId, setTrackId] = useState(null);
    const [todayHours, setTodayHours] = useState(0);

    useEffect(() => {
        if (!employeeId || !taskId) return;

        const client = connect(employeeId, (msg) => {
            console.log("WS MSG:", msg)
            if (!msg) return;
            const parsedMsg = typeof msg === "string" ? JSON.parse(msg) : msg;
            if(parsedMsg.type === "START") {
                setRunning(true);
                setTrackId(parsedMsg.trackId);
            } else if(parsedMsg.type === "STOP") {
                setRunning(false);
                setElapsedSec(0);
                setTrackId(null);
                fetchToday();
            } else if(parsedMsg.type === "TICK") {
                setElapsedSec(parsedMsg.elapsedSeconds || 0);
            }
        });

        fetchToday();

        return () => {
            disconnect();
        };
    }, [employeeId, taskId]);

    // если нужен локальный таймер-обновление:
    useEffect(() => {
        if (running) {
            timerRef.current = setInterval(() => {
                setElapsedSec(s => s + 1);
            }, 1000);
        } else {
            if (timerRef.current) {
                clearInterval(timerRef.current);
                timerRef.current = null;
            }
        }
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [running]);

    async function handleStart() {
        console.log("START CLICKED", taskId, employeeId);
        setRunning(true); // временно для проверки UI
        try {
            const res = await startTimer(taskId, employeeId);
        } catch (e) {
            console.error(e);
            alert(e?.response?.data?.message || "Ошибка старта таймера");
        }
    }


    async function handleStop() {
        try {
            await stopTimer(taskId, employeeId);
            // backend пришлёт STOP событие — UI обновится через WS
        } catch (e) {
            console.error(e);
            alert("Ошибка стопа таймера");
        }
    }

    async function fetchToday() {
        try {
            const res = await getTodayReport(employeeId);
            setTodayHours(res.data.hours);
        } catch (err) {
            console.error(err);
        }
    }

    return (
        <div className="p-4 max-w-md bg-white shadow-lg rounded-lg">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-semibold">Таймер задачи</h3>
                    <p className="text-sm text-gray-500">Задача  с id {taskId}</p>
                </div>
                <div className="text-right">
                    <div className="text-xs text-gray-400">Сегодня (ч)</div>
                    <div className="text-xl font-bold">{(todayHours).toFixed(2)}</div>
                </div>
            </div>

            <div className="mt-4 flex items-center">
                <div className="flex-1">
                    <div className="text-3xl font-mono">{formatHMS(elapsedSec)}</div>
                    <div className="h-2 bg-gray-200 rounded mt-2">
                        {/* example progress: 8h goal */}
                        <div style={{ width: `${Math.min(( (todayHours/8) * 100), 100)}%` }} className="h-2 rounded bg-gradient-to-r from-green-400 to-blue-500 transition-all"></div>
                    </div>
                </div>

                <div className="ml-4">
                    {!running ? (
                        <button onClick={handleStart} className="px-4 py-2 rounded bg-green-500 text-white">Start</button>
                    ) : (
                        <button onClick={handleStop} className="px-4 py-2 rounded bg-red-500 text-white">Stop</button>
                    )}
                </div>
            </div>
        </div>
    );
}
