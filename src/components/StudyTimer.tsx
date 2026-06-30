import React, { useState, useEffect, useRef } from "react";
import { Play, Pause, RotateCcw, Flame, Award, Hourglass, ShieldCheck } from "lucide-react";

interface StudyTimerProps {
  onAddStudyHours: (minutes: number) => void;
}

type TimerMode = "Pomodoro" | "Deep Work" | "Custom";

export default function StudyTimer({ onAddStudyHours }: StudyTimerProps) {
  const [mode, setMode] = useState<TimerMode>("Pomodoro");
  const [minutes, setMinutes] = useState(25);
  const [seconds, setSeconds] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [customInput, setCustomInput] = useState(45);
  const [loggedMinutes, setLoggedMinutes] = useState(0);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Initial values
  const getInitialMinutes = (m: TimerMode) => {
    if (m === "Pomodoro") return 25;
    if (m === "Deep Work") return 50;
    return customInput;
  };

  useEffect(() => {
    setMinutes(getInitialMinutes(mode));
    setSeconds(0);
    setIsActive(false);
  }, [mode]);

  useEffect(() => {
    if (isActive) {
      intervalRef.current = setInterval(() => {
        if (seconds > 0) {
          setSeconds((s) => s - 1);
        } else if (minutes > 0) {
          setMinutes((m) => m - 1);
          setSeconds(59);
        } else {
          // Timer finished
          handleTimerComplete();
        }
      }, 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isActive, minutes, seconds]);

  const handleTimerComplete = () => {
    setIsActive(false);
    let sessionMinutes = 0;
    if (mode === "Pomodoro") sessionMinutes = 25;
    else if (mode === "Deep Work") sessionMinutes = 50;
    else sessionMinutes = customInput;

    setLoggedMinutes((prev) => prev + sessionMinutes);
    onAddStudyHours(sessionMinutes);

    // Audio beep simulation via Web Audio API if browser allows
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      oscillator.type = "sine";
      oscillator.frequency.value = 880; // A5 pitch
      gainNode.gain.setValueAtTime(0.3, audioCtx.currentTime);
      oscillator.start();
      oscillator.stop(audioCtx.currentTime + 1.2);
    } catch (e) {
      console.log("Audio feedback skipped or blocked by permissions");
    }

    alert(`🏆 Focus session complete! You have successfully added ${sessionMinutes} minutes of deeply focused study to your NEET OS tracker.`);
    resetTimer();
  };

  const toggleTimer = () => {
    setIsActive(!isActive);
  };

  const resetTimer = () => {
    setIsActive(false);
    setMinutes(getInitialMinutes(mode));
    setSeconds(0);
  };

  const applyCustomMinutes = () => {
    setMode("Custom");
    setMinutes(customInput);
    setSeconds(0);
    setIsActive(false);
  };

  // Calculating circular progress dash offsets
  const totalDurationSeconds = getInitialMinutes(mode) * 60;
  const currentRemainingSeconds = minutes * 60 + seconds;
  const progressPct = totalDurationSeconds > 0 ? (currentRemainingSeconds / totalDurationSeconds) : 0;
  const strokeDashoffset = 314 - (314 * progressPct);

  return (
    <div className="p-6 rounded-3xl bg-white/5 border border-white/10 glass flex flex-col md:flex-row items-center justify-between gap-6">
      
      {/* Visual countdown circle */}
      <div className="relative w-36 h-36 flex items-center justify-center shrink-0">
        <svg className="w-full h-full transform -rotate-90">
          <circle cx="72" cy="72" r="50" stroke="currentColor" strokeWidth="6" fill="transparent" className="text-white/5" />
          <circle
            cx="72"
            cy="72"
            r="50"
            stroke="currentColor"
            strokeWidth="6"
            fill="transparent"
            strokeDasharray="314"
            strokeDashoffset={strokeDashoffset}
            className={`transition-all duration-1000 ${
              isActive ? "text-blue-500 drop-shadow-[0_0_8px_rgba(59,130,246,0.5)]" : "text-slate-600"
            }`}
          />
        </svg>

        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-black font-mono text-white tracking-tight">
            {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
          </span>
          <span className="text-[9px] uppercase tracking-wider text-slate-400 mt-0.5">
            {isActive ? "Active Focus" : "Idle"}
          </span>
        </div>
      </div>

      {/* Mode selectors & controls */}
      <div className="flex-1 space-y-4 w-full">
        <div className="flex flex-wrap gap-2">
          {(["Pomodoro", "Deep Work", "Custom"] as const).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                mode === m
                  ? "bg-blue-600 text-white shadow-[0_0_10px_rgba(37,99,235,0.3)]"
                  : "bg-white/5 text-slate-400 hover:bg-white/10 border border-white/5"
              }`}
            >
              {m} {m === "Deep Work" && "⚡"}
            </button>
          ))}
        </div>

        <div>
          {mode === "Pomodoro" && (
            <p className="text-xs text-slate-300">
              <strong>Classic Pomodoro</strong>: 25 minutes of continuous study followed by a 5-minute cognitive cool-down.
            </p>
          )}
          {mode === "Deep Work" && (
            <p className="text-xs text-slate-300">
              <strong>Deep Work Sprint</strong>: 50 minutes of extreme uninterrupted study budget. No notifications, pure high focus.
            </p>
          )}
          {mode === "Custom" && (
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="5"
                max="180"
                value={customInput}
                onChange={(e) => setCustomInput(Math.max(5, Number(e.target.value)))}
                className="bg-white/5 border border-white/10 rounded-lg px-2.5 py-1 text-xs text-white w-16 font-mono"
              />
              <span className="text-xs text-slate-400">minutes</span>
              <button
                onClick={applyCustomMinutes}
                className="text-[10px] uppercase font-bold text-blue-400 hover:underline"
              >
                Apply Custom Timer
              </button>
            </div>
          )}
        </div>

        {/* Play/Pause control suite */}
        <div className="flex gap-3">
          <button
            onClick={toggleTimer}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition ${
              isActive
                ? "bg-amber-600 hover:bg-amber-500 text-white"
                : "bg-emerald-600 hover:bg-emerald-500 text-white shadow-[0_0_12px_rgba(16,185,129,0.3)]"
            }`}
          >
            {isActive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            {isActive ? "Pause Session" : "Start Session"}
          </button>

          <button
            onClick={resetTimer}
            className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 text-slate-300 transition"
            title="Reset timer"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Session tracker results sidebar */}
      <div className="p-4 rounded-2xl bg-black/30 border border-white/5 w-full md:w-48 text-center md:text-left space-y-2">
        <span className="text-[9px] uppercase tracking-wider text-slate-400 font-bold block">Focus Session Log</span>
        <div className="flex items-center gap-2 justify-center md:justify-start">
          <Flame className="w-5 h-5 text-orange-400 animate-bounce" />
          <span className="text-lg font-black text-white font-mono">{loggedMinutes} Mins</span>
        </div>
        <p className="text-[10px] text-slate-500 leading-normal">
          Time logged instantly increases your active student Level XP multipliers.
        </p>
      </div>

    </div>
  );
}
