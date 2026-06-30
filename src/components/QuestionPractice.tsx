import React, { useState } from "react";
import { PracticeLog, SubjectType, SyllabusChapter } from "../types";
import { CheckCircle2, XCircle, SkipForward, Clock, Percent, Sparkles, Plus, Play, Trash2, Calendar, TrendingUp } from "lucide-react";

interface QuestionPracticeProps {
  chapters: SyllabusChapter[];
  practiceLogs: PracticeLog[];
  onAddLog: (log: Omit<PracticeLog, "id" | "timestamp">) => void;
  onClearLogs?: () => void;
  dailyTarget?: number;
}

export default function QuestionPractice({ chapters, practiceLogs, onAddLog, onClearLogs, dailyTarget = 100 }: QuestionPracticeProps) {
  // Manual Entry Form State
  const [subject, setSubject] = useState<SubjectType>("Biology");
  const [selectedChapterId, setSelectedChapterId] = useState("");
  const [correct, setCorrect] = useState(35);
  const [wrong, setWrong] = useState(10);
  const [skipped, setSkipped] = useState(5);
  const [timeTaken, setTimeTaken] = useState(45);
  const [guessAccuracy, setGuessAccuracy] = useState(50);
  const [showLogForm, setShowLogForm] = useState(false);

  // Filter chapters by selected subject
  const subjectChapters = chapters.filter(c => c.subject === subject);

  // Auto-select first chapter of the active subject if empty or not matching
  React.useEffect(() => {
    if (subjectChapters.length > 0) {
      setSelectedChapterId(subjectChapters[0].id);
    }
  }, [subject]);

  // Aggregate stats from practice logs
  const totalCorrect = practiceLogs.reduce((acc, l) => acc + l.correct, 0);
  const totalWrong = practiceLogs.reduce((acc, l) => acc + l.wrong, 0);
  const totalSkipped = practiceLogs.reduce((acc, l) => acc + l.skipped, 0);
  const totalQuestions = totalCorrect + totalWrong + totalSkipped;

  const totalTimeTaken = practiceLogs.reduce((acc, l) => acc + l.timeTakenMinutes, 0);
  const averageTimePerQuestion = totalQuestions > 0 ? (totalTimeTaken * 60) / totalQuestions : 0;

  const overallAccuracy = totalCorrect + totalWrong > 0 ? Math.round((totalCorrect / (totalCorrect + totalWrong)) * 100) : 0;

  // Filter logs for today
  const todayStr = new Date().toISOString().split("T")[0];
  const todayLogs = practiceLogs.filter(l => l.date === todayStr);
  const todayCompleted = todayLogs.reduce((acc, l) => acc + l.correct + l.wrong + l.skipped, 0);
  const todayRemaining = Math.max(0, dailyTarget - todayCompleted);

  // Subject breakdowns
  const getSubjectQuestionsCount = (subj: SubjectType) => {
    return practiceLogs.filter(l => l.subject === subj).reduce((acc, l) => acc + l.correct + l.wrong + l.skipped, 0);
  };

  const bioCount = getSubjectQuestionsCount("Biology");
  const phyCount = getSubjectQuestionsCount("Physics");
  const chemCount = getSubjectQuestionsCount("Chemistry");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedChapterId) return;

    const chap = chapters.find(c => c.id === selectedChapterId);
    const chapterName = chap ? chap.name : "Unknown Chapter";

    onAddLog({
      date: new Date().toISOString().split("T")[0],
      subject,
      chapterId: selectedChapterId,
      chapterName,
      correct: Number(correct),
      wrong: Number(wrong),
      skipped: Number(skipped),
      timeTakenMinutes: Number(timeTaken),
      guessAccuracy: Number(guessAccuracy),
    });

    setShowLogForm(false);
  };

  return (
    <div className="space-y-6">
      {/* Target Progress & Big Action buttons */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Daily Mission Targets Card */}
        <div className="md:col-span-2 p-6 rounded-3xl bg-gradient-to-br from-blue-600/10 to-indigo-600/10 border border-blue-500/20 glass flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-yellow-400" /> Today's Question Practice
                </h3>
                <p className="text-xs text-slate-400">Aim for high precision and correct question density to build peak reflex.</p>
              </div>
              <span className="text-xs font-mono bg-blue-500/20 text-blue-300 px-2.5 py-1 rounded-full border border-blue-500/30">
                Target: {dailyTarget} Qs
              </span>
            </div>

            <div className="grid grid-cols-3 gap-4 my-4 text-center">
              <div className="bg-white/3 p-3 rounded-xl border border-white/5">
                <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">Completed</span>
                <span className="text-2xl font-black text-white font-mono">{todayCompleted}</span>
              </div>
              <div className="bg-white/3 p-3 rounded-xl border border-white/5">
                <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">Remaining</span>
                <span className="text-2xl font-black text-blue-400 font-mono">{todayRemaining}</span>
              </div>
              <div className="bg-white/3 p-3 rounded-xl border border-white/5">
                <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">Accuracy (Today)</span>
                <span className="text-2xl font-black text-emerald-400 font-mono">
                  {todayLogs.reduce((acc, l) => acc + l.correct, 0) + todayLogs.reduce((acc, l) => acc + l.wrong, 0) > 0
                    ? Math.round((todayLogs.reduce((acc, l) => acc + l.correct, 0) / (todayLogs.reduce((acc, l) => acc + l.correct, 0) + todayLogs.reduce((acc, l) => acc + l.wrong, 0))) * 100)
                    : 0}%
                </span>
              </div>
            </div>

            <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-emerald-500 rounded-full shadow-[0_0_8px_rgba(59,130,246,0.5)] transition-all duration-300"
                style={{ width: `${Math.min(100, (todayCompleted / dailyTarget) * 100)}%` }}
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-3 mt-5">
            <button
              onClick={() => setShowLogForm(true)}
              className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold py-2.5 px-5 rounded-xl transition flex items-center gap-2 shadow-[0_0_15px_rgba(37,99,235,0.4)]"
            >
              <Plus className="w-4 h-4" /> Log MCQ Practice Session
            </button>

            <a
              href="https://exambro.app/dashboard"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-[#f27011]/15 hover:bg-[#f27011]/25 border border-[#f27011]/30 text-[#f27011] text-xs font-bold py-2.5 px-5 rounded-xl transition flex items-center gap-2 shrink-0"
            >
              <Play className="w-4 h-4 fill-[#f27011]" /> Open Exambro
            </a>
          </div>
        </div>

        {/* Real-time Statistics Card */}
        <div className="p-5 rounded-3xl bg-white/5 border border-white/10 glass flex flex-col justify-between">
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Lifetime MCQ Stats</h4>
          
          <div className="space-y-3.5">
            <div className="flex justify-between items-center border-b border-white/5 pb-2">
              <span className="text-xs text-slate-400">Total Practice Count</span>
              <span className="text-sm font-bold font-mono text-white">{totalQuestions} Qs</span>
            </div>

            <div className="flex justify-between items-center border-b border-white/5 pb-2">
              <span className="text-xs text-slate-400">Average Accuracy</span>
              <span className={`text-sm font-bold font-mono flex items-center gap-1 ${overallAccuracy >= 85 ? "text-emerald-400" : overallAccuracy >= 65 ? "text-amber-400" : "text-red-400"}`}>
                <Percent className="w-3.5 h-3.5" /> {overallAccuracy}%
              </span>
            </div>

            <div className="flex justify-between items-center border-b border-white/5 pb-2">
              <span className="text-xs text-slate-400">Avg Time per MCQ</span>
              <span className="text-sm font-bold font-mono text-white flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-blue-400" /> {averageTimePerQuestion.toFixed(0)}s
              </span>
            </div>

            <div className="grid grid-cols-3 gap-1 pt-1">
              <div className="text-center">
                <span className="text-[9px] text-emerald-400 uppercase font-semibold">Correct</span>
                <span className="block text-xs font-bold text-emerald-400">{totalCorrect}</span>
              </div>
              <div className="text-center border-x border-white/5">
                <span className="text-[9px] text-red-400 uppercase font-semibold">Wrong</span>
                <span className="block text-xs font-bold text-red-400">{totalWrong}</span>
              </div>
              <div className="text-center">
                <span className="text-[9px] text-slate-400 uppercase font-semibold">Skipped</span>
                <span className="block text-xs font-bold text-slate-300">{totalSkipped}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* MCQ Entry Form Drawer Overlay */}
      {showLogForm && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="w-full max-w-lg bg-[#0e0e12] border border-white/10 rounded-3xl p-6 shadow-2xl relative">
            <h3 className="text-lg font-bold text-white mb-1">Log Practice Session</h3>
            <p className="text-xs text-slate-400 mb-5">Enter results from your hardcopy books or online test series to analyze accuracy patterns.</p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wide mb-1">Subject</label>
                  <select
                    value={subject}
                    onChange={(e) => setSubject(e.target.value as SubjectType)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500 text-xs"
                  >
                    <option value="Biology">Biology (Botany/Zoology)</option>
                    <option value="Physics">Physics</option>
                    <option value="Chemistry">Chemistry</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wide mb-1">Chapter</label>
                  <select
                    value={selectedChapterId}
                    onChange={(e) => setSelectedChapterId(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500 text-xs"
                  >
                    {subjectChapters.map((chap) => (
                      <option key={chap.id} value={chap.id}>{chap.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 bg-white/2 p-3 rounded-2xl border border-white/5">
                <div>
                  <label className="text-[10px] text-emerald-400 uppercase font-bold flex items-center gap-1 mb-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Correct
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={correct}
                    onChange={(e) => setCorrect(Number(e.target.value))}
                    className="w-full bg-black/40 border border-white/10 rounded-lg py-1.5 px-2.5 font-mono text-white text-xs focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-[10px] text-red-400 uppercase font-bold flex items-center gap-1 mb-1">
                    <XCircle className="w-3.5 h-3.5" /> Wrong
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={wrong}
                    onChange={(e) => setWrong(Number(e.target.value))}
                    className="w-full bg-black/40 border border-white/10 rounded-lg py-1.5 px-2.5 font-mono text-white text-xs focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-[10px] text-slate-400 uppercase font-bold flex items-center gap-1 mb-1">
                    <SkipForward className="w-3.5 h-3.5" /> Skipped
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={skipped}
                    onChange={(e) => setSkipped(Number(e.target.value))}
                    className="w-full bg-black/40 border border-white/10 rounded-lg py-1.5 px-2.5 font-mono text-white text-xs focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wide mb-1">Time Taken (Minutes)</label>
                  <input
                    type="number"
                    min="1"
                    value={timeTaken}
                    onChange={(e) => setTimeTaken(Number(e.target.value))}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500 font-mono text-xs"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wide mb-1">Guess Accuracy Estimate (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={guessAccuracy}
                    onChange={(e) => setGuessAccuracy(Number(e.target.value))}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500 font-mono text-xs"
                  />
                </div>
              </div>

              <div className="flex gap-3 justify-end pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setShowLogForm(false)}
                  className="px-4 py-2 text-xs font-semibold rounded-xl bg-white/5 hover:bg-white/10 text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold rounded-xl bg-blue-600 hover:bg-blue-500 text-white"
                >
                  Save Log
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Subject-wise count dashboard & logs list */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Subject wise Question Distribution stats */}
        <div className="p-5 rounded-2xl bg-white/5 border border-white/10 glass">
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-1.5">
            <TrendingUp className="w-4 h-4 text-emerald-400" /> Subject-wise Breakdown
          </h4>

          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-emerald-400 font-medium">Biology</span>
                <span className="text-slate-400">{bioCount} Questions</span>
              </div>
              <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500" style={{ width: `${totalQuestions > 0 ? (bioCount / totalQuestions) * 100 : 0}%` }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-purple-400 font-medium">Physics</span>
                <span className="text-slate-400">{phyCount} Questions</span>
              </div>
              <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                <div className="h-full bg-purple-500" style={{ width: `${totalQuestions > 0 ? (phyCount / totalQuestions) * 100 : 0}%` }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-amber-400 font-medium">Chemistry</span>
                <span className="text-slate-400">{chemCount} Questions</span>
              </div>
              <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                <div className="h-full bg-amber-500" style={{ width: `${totalQuestions > 0 ? (chemCount / totalQuestions) * 100 : 0}%` }} />
              </div>
            </div>
          </div>
        </div>

        {/* Practice Logs Feed */}
        <div className="md:col-span-2 p-5 rounded-2xl bg-white/5 border border-white/10 glass flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-4">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-blue-400" /> MCQ Practice Session History
              </h4>
              {onClearLogs && practiceLogs.length > 0 && (
                <button
                  onClick={onClearLogs}
                  className="text-[10px] text-red-400 hover:text-red-300 flex items-center gap-1 transition"
                >
                  <Trash2 className="w-3 h-3" /> Clear History
                </button>
              )}
            </div>

            {practiceLogs.length === 0 ? (
              <div className="text-center py-8 border border-dashed border-white/5 rounded-xl">
                <p className="text-xs text-slate-500">No practice logs found. Start typing above to build metrics.</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar pr-1">
                {practiceLogs.slice().reverse().map((log) => {
                  const logTotal = log.correct + log.wrong + log.skipped;
                  const accuracy = log.correct + log.wrong > 0 ? Math.round((log.correct / (log.correct + log.wrong)) * 100) : 0;
                  
                  return (
                    <div key={log.id} className="p-3 rounded-xl bg-white/2 border border-white/5 flex justify-between items-center text-xs">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold uppercase ${
                            log.subject === "Biology" ? "bg-emerald-500/10 text-emerald-400" : log.subject === "Physics" ? "bg-purple-500/10 text-purple-400" : "bg-amber-500/10 text-amber-400"
                          }`}>
                            {log.subject}
                          </span>
                          <span className="font-bold text-slate-200 truncate max-w-[140px]" title={log.chapterName}>
                            {log.chapterName}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-400 font-mono">
                          {log.date} • {log.timeTakenMinutes} mins • Guess Acc: {log.guessAccuracy || 0}%
                        </p>
                      </div>

                      <div className="text-right">
                        <span className="font-bold text-slate-100 font-mono block">{logTotal} Qs</span>
                        <span className={`text-[10px] font-bold ${accuracy >= 80 ? "text-emerald-400" : "text-amber-400"}`}>
                          Acc: {accuracy}% ({log.correct} C / {log.wrong} W)
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
