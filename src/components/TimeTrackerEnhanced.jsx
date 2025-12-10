import {useEffect, useRef, useState} from "react";
import {
    startTimer,
    pauseTimer,
    resumeTimer,
    stopTimer,
    getTodayReport,
    getTaskTotals
} from "../services/TimeServise";

function formatHMS(seconds) {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2,'0')}:${m.toString().padStart(2,'0')}:${s.toString().padStart(2,'0')}`;
}

export default function TimeTrackerEnhanced({ employeeId, taskId, onTotalsUpdate }) {
    const [running, setRunning] = useState(false);
    const [paused, setPaused] = useState(false);
    const [elapsedSec, setElapsedSec] = useState(0);
    const [todayHours, setTodayHours] = useState(0);
    const [trackId, setTrackId] = useState(null);

    const timer = useRef(null);

    // === LOCAL STORAGE restore ===
    useEffect(() => {
        const saved = localStorage.getItem(`track:${employeeId}:${taskId}`);
        if (saved) {
            const p = JSON.parse(saved);
            setRunning(p.running);
            setPaused(p.paused);
            setElapsedSec(p.elapsedSec);
            setTrackId(p.trackId);
        }
    }, [employeeId, taskId]);

    // === LOCAL STORAGE save ===
    useEffect(() => {
        localStorage.setItem(
            `track:${employeeId}:${taskId}`,
            JSON.stringify({ running, paused, elapsedSec, trackId })
        );
    }, [running, paused, elapsedSec, trackId, employeeId, taskId]);

    // === TIMER ===
    useEffect(() => {
        if (running && !paused) {
            timer.current = setInterval(() => {
                setElapsedSec(s => s + 1);
            }, 1000);
        } else if (timer.current) {
            clearInterval(timer.current);
            timer.current = null;
        }

        return () => {
            if (timer.current) clearInterval(timer.current);
        };
    }, [running, paused]);

    // === fetch stats ===
    useEffect(() => {
        if (!employeeId) return;
        fetchToday();
        fetchTotals();
    }, [employeeId, taskId]);

    async function fetchToday() {
        try {
            const res = await getTodayReport(employeeId);
            setTodayHours(res.data.hours || 0);
        } catch (e) {
            console.error(e);
        }
    }

    async function fetchTotals() {
        try {
            const res = await getTaskTotals(employeeId);
            const map = {};
            res.data.forEach(t => map[t.taskId] = t.totalMinutes);
            onTotalsUpdate?.(map);
        } catch (e) {
            console.error(e);
        }
    }

    // === CONTROL ACTIONS ===

    async function handleStart() {
        try {
            const res = await startTimer(taskId, employeeId);
            setTrackId(res.data.trackId);
            setRunning(true);
            setPaused(false);
        } catch (e) {
            alert("Ошибка старта");
        }
    }

    async function handlePause() {
        try {
            await pauseTimer(taskId, employeeId);
            setPaused(true);
        } catch (e) {
            alert("Ошибка паузы");
        }
    }

    async function handleResume() {
        try {
            const res = await resumeTimer(taskId, employeeId);
            setTrackId(res.data.trackId);
            setPaused(false);
            setRunning(true);
        } catch (e) {
            alert("Ошибка возобновления");
        }
    }

    async function handleStop() {
        try {
            await stopTimer(taskId, employeeId);
            setRunning(false);
            setPaused(false);
            setElapsedSec(0);
            setTrackId(null);
            fetchToday();
            fetchTotals();
        } catch (e) {
            alert("Ошибка остановки");
        }
    }

    return (
        <div className="p-4 bg-white shadow-md rounded-xl max-w-md">
            <div className="flex justify-between">
                <h3 className="text-lg font-semibold">Таймер задачи #{taskId}</h3>
                <div className="text-right">
                    <div className="text-xs text-gray-500">Сегодня, часов</div>
                    <div className="text-xl font-bold">{todayHours.toFixed(2)}</div>
                </div>
            </div>

            <div className="mt-4 flex items-center justify-between">
                <div className="text-3xl font-mono">{formatHMS(elapsedSec)}</div>

                <div className="flex gap-2">
                    {!running && (
                        <button className="btn green" onClick={handleStart}>Start</button>
                    )}
                    {running && !paused && (
                        <>
                            <button className="btn yellow" onClick={handlePause}>Pause</button>
                            <button className="btn red" onClick={handleStop}>Stop</button>
                        </>
                    )}
                    {running && paused && (
                        <>
                            <button className="btn blue" onClick={handleResume}>Resume</button>
                            <button className="btn red" onClick={handleStop}>Stop</button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

