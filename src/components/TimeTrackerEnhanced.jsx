import {useCallback, useEffect, useRef, useState} from "react";
import {
    startTimer,
    pauseTimer,
    resumeTimer,
    stopTimer,
    addManualTime,
    getTrackerState,
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
    const [taskTotalMinutes, setTaskTotalMinutes] = useState(0);
    const [trackId, setTrackId] = useState(null);
    const [manualMinutes, setManualMinutes] = useState("");

    const timer = useRef(null);

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

    async function fetchToday() {
        try {
            const res = await getTodayReport(employeeId);
            setTodayHours(res.data.hours || 0);
        } catch (e) {
            console.error(e);
        }
    }

    const fetchTotals = useCallback(async () => {
        try {
            const res = await getTaskTotals(employeeId);
            const map = {};
            res.data.forEach(t => map[t.taskId] = t.totalMinutes);
            onTotalsUpdate?.(map);
            setTaskTotalMinutes(Number(map[taskId] || 0));
        } catch (e) {
            console.error(e);
        }
    }, [employeeId, onTotalsUpdate, taskId]);

    const syncState = useCallback(async () => {
        if (!employeeId || !taskId) return;
        try {
            const { data } = await getTrackerState(taskId, employeeId);
            setRunning(Boolean(data.running));
            setPaused(false);
            setTrackId(data.trackId ?? null);
            setElapsedSec(Number(data.openElapsedSeconds || 0));
            setTodayHours(Number(data.todayHours || 0));
            await fetchTotals();
        } catch (e) {
            console.error(e);
        }
    }, [employeeId, taskId, fetchTotals]);

    useEffect(() => {
        syncState();
    }, [syncState]);

    // === CONTROL ACTIONS ===

    async function handleStart() {
        try {
            const res = await startTimer(taskId, employeeId);
            setTrackId(res.data.trackId);
            setRunning(true);
            setPaused(false);
            setElapsedSec(0);
        } catch (e) {
            alert("Ошибка старта");
        }
    }

    async function handlePause() {
        try {
            await pauseTimer(taskId, employeeId);
            setPaused(true);
            await fetchToday();
            await fetchTotals();
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
            await fetchToday();
            await fetchTotals();
        } catch (e) {
            alert("Ошибка остановки");
        }
    }

    async function handleManualAdd() {
        const minutes = Number(manualMinutes);
        if (!Number.isInteger(minutes) || minutes <= 0) {
            alert("Введите корректное количество минут");
            return;
        }
        try {
            await addManualTime(taskId, employeeId, minutes);
            setManualMinutes("");
            await fetchToday();
            await fetchTotals();
        } catch (e) {
            alert("Ошибка добавления времени");
        }
    }

    return (
        <div className="tracker-widget">
            <div className="tracker-widget-header">
                <h3 className="tracker-widget-title">Таймер задачи #{taskId}</h3>
                <div className="tracker-widget-stats">
                    <div className="tracker-widget-stat">
                        <span>Сегодня</span>
                        <strong>{formatHMS(Math.round(todayHours * 3600))}</strong>
                    </div>
                    <div className="tracker-widget-stat">
                        <span>Всего по задаче</span>
                        <strong>{formatHMS(taskTotalMinutes * 60)}</strong>
                    </div>
                </div>
            </div>

            <div className="tracker-live-row">
                <div className="tracker-live-time">{formatHMS(elapsedSec)}</div>

                <div className="tracker-actions">
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
            {trackId && <div className="tracker-session">Session #{trackId}</div>}
            <div className="tracker-manual">
                <div className="tracker-manual-label">Добавить время вручную (минуты)</div>
                <div className="tracker-manual-row">
                    <input
                        type="number"
                        min="1"
                        value={manualMinutes}
                        onChange={(e) => setManualMinutes(e.target.value)}
                        className="tracker-manual-input"
                        placeholder="Например: 30"
                    />
                    <button className="btn blue" onClick={handleManualAdd}>Добавить</button>
                </div>
            </div>
        </div>
    );
}

