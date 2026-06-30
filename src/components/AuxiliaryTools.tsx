import React, { useState } from "react";
import { FormulaItem, Flashcard, JournalEntry, HealthLog, SubjectType, SyllabusChapter } from "../types";
import { Book, Bookmark, Compass, Heart, Smile, Sun, Moon, Sparkles, Send, Coffee, Check, Activity, Trash2, HelpCircle } from "lucide-react";

interface AuxiliaryToolsProps {
  chapters: SyllabusChapter[];
  formulas: FormulaItem[];
  onToggleFormulaBookmark: (id: string) => void;
  flashcards: Flashcard[];
  onReviewFlashcard: (id: string, ratedDifficulty: "easy" | "hard") => void;
  journalEntries: JournalEntry[];
  onAddJournal: (wins: string, mistakes: string, goals: string) => void;
  healthLogs: HealthLog[];
  onSaveHealthLog: (sleep: number, water: number, exercise: number, mood: HealthLog["mood"]) => void;
}

export default function AuxiliaryTools({
  chapters,
  formulas,
  onToggleFormulaBookmark,
  flashcards,
  onReviewFlashcard,
  journalEntries,
  onAddJournal,
  healthLogs,
  onSaveHealthLog,
}: AuxiliaryToolsProps) {
  const [activeSubTab, setActiveSubTab] = useState<"formulas" | "flashcards" | "journal" | "health">("formulas");

  // --- FORMULA BOOK STATE ---
  const [formulaSubject, setFormulaSubject] = useState<SubjectType | "All">("All");
  const [formulaQuery, setFormulaQuery] = useState("");

  const filteredFormulas = formulas.filter((f) => {
    const matchesSubject = formulaSubject === "All" || f.subject === formulaSubject;
    const matchesQuery = f.title.toLowerCase().includes(formulaQuery.toLowerCase()) || f.chapterName.toLowerCase().includes(formulaQuery.toLowerCase());
    return matchesSubject && matchesQuery;
  });

  // --- FLASHCARD STATE ---
  const [cardIndex, setCardIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);

  // Filter flashcards due today (or just all available cards if empty)
  const activeFlashcards = flashcards;

  const handleFlashcardReview = (difficulty: "easy" | "hard") => {
    if (activeFlashcards.length > 0) {
      const card = activeFlashcards[cardIndex];
      onReviewFlashcard(card.id, difficulty);
      setShowAnswer(false);
      if (cardIndex < activeFlashcards.length - 1) {
        setCardIndex((prev) => prev + 1);
      } else {
        setCardIndex(0);
        alert("🎉 Spaced Repetition Session Complete! Your Leitner card boxes have been recalibrated.");
      }
    }
  };

  // --- JOURNAL STATE ---
  const [wins, setWins] = useState("");
  const [mistakes, setMistakes] = useState("");
  const [goals, setGoals] = useState("");

  const handleJournalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddJournal(wins, mistakes, goals);
    setWins("");
    setMistakes("");
    setGoals("");
  };

  // --- HEALTH LOG STATE ---
  const [sleep, setSleep] = useState(7);
  const [water, setWater] = useState(6);
  const [exercise, setExercise] = useState(20);
  const [mood, setMood] = useState<HealthLog["mood"]>("Good");

  const handleHealthSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveHealthLog(Number(sleep), Number(water), Number(exercise), mood);
    alert("❤️ Daily biometric health stats saved to NEET OS dashboard.");
  };

  return (
    <div className="space-y-6">
      
      {/* Tab Selectors */}
      <div className="flex border-b border-white/10 gap-4 overflow-x-auto custom-scrollbar pb-1">
        {(["formulas", "flashcards", "journal", "health"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveSubTab(tab)}
            className={`px-4 py-2.5 text-xs font-bold capitalize transition border-b-2 shrink-0 ${
              activeSubTab === tab
                ? "border-blue-500 text-blue-400"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            {tab === "formulas" && "📐 Formulas & Facts Book"}
            {tab === "flashcards" && "🗂️ Spaced Recall Flashcards"}
            {tab === "journal" && "📝 Daily Mentoring Journal"}
            {tab === "health" && "❤️ Health & Vitals Tracker"}
          </button>
        ))}
      </div>

      {/* RENDER FORMULA BOOK */}
      {activeSubTab === "formulas" && (
        <div className="space-y-4">
          <div className="flex flex-col md:flex-row gap-3 justify-between items-center">
            <div className="flex bg-white/5 border border-white/10 rounded-xl px-3 py-1.5 flex-1 w-full max-w-sm">
              <input
                type="text"
                placeholder="Search formulas or bookmarks..."
                value={formulaQuery}
                onChange={(e) => setFormulaQuery(e.target.value)}
                className="bg-transparent text-xs text-white focus:outline-none w-full"
              />
            </div>

            <div className="flex gap-2 w-full md:w-auto">
              {(["All", "Physics", "Chemistry", "Biology"] as const).map((subj) => (
                <button
                  key={subj}
                  onClick={() => setFormulaSubject(subj)}
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition ${
                    formulaSubject === subj ? "bg-blue-600 text-white" : "bg-white/5 text-slate-400 hover:bg-white/10"
                  }`}
                >
                  {subj}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredFormulas.map((f) => (
              <div key={f.id} className="p-4 rounded-xl bg-white/2 border border-white/5 flex flex-col justify-between hover:border-white/10 transition">
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold uppercase ${
                      f.subject === "Physics" ? "bg-purple-500/10 text-purple-400" : f.subject === "Chemistry" ? "bg-amber-500/10 text-amber-400" : "bg-emerald-500/10 text-emerald-400"
                    }`}>
                      {f.subject}
                    </span>
                    <button
                      onClick={() => onToggleFormulaBookmark(f.id)}
                      className={`p-1 rounded hover:bg-white/5 transition ${f.isBookmarked ? "text-yellow-400" : "text-slate-600"}`}
                    >
                      <Bookmark className="w-3.5 h-3.5 fill-current" />
                    </button>
                  </div>

                  <h5 className="font-bold text-white text-xs mb-1">{f.title}</h5>
                  <p className="text-[10px] text-slate-400 mb-2">{f.chapterName}</p>

                  <div className="p-3 bg-black/40 rounded-lg border border-white/5 text-center font-mono text-sm text-blue-300 overflow-x-auto custom-scrollbar">
                    {f.formula}
                  </div>
                </div>

                <p className="text-[10px] text-slate-400 mt-2.5 leading-relaxed">{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* RENDER FLASHCARDS */}
      {activeSubTab === "flashcards" && (
        <div className="max-w-md mx-auto space-y-6 text-center">
          <div className="p-4 bg-gradient-to-br from-blue-900/10 to-purple-900/10 border border-blue-500/15 rounded-2xl">
            <span className="text-[10px] uppercase tracking-wider font-extrabold text-blue-400">Leitner System Spaced Revision</span>
            <p className="text-[11px] text-slate-300 mt-1">Cards are categorized into memory boxes. Correct recalls promote card intervals; incorrect cards reset interval timers.</p>
          </div>

          {activeFlashcards.length === 0 ? (
            <div className="p-12 border border-dashed border-white/10 rounded-2xl">
              <span className="text-3xl">📭</span>
              <p className="text-xs text-slate-400 mt-2">All spaced repetition flashcards are fully consolidated for the day!</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex justify-between items-center text-xs text-slate-400">
                <span>Leitner card {cardIndex + 1} of {activeFlashcards.length}</span>
                <span className="bg-slate-800 px-2 py-0.5 rounded text-[9px] uppercase tracking-wide">
                  Box {activeFlashcards[cardIndex].box} / 5
                </span>
              </div>

              {/* Physical Flashcard Mockup */}
              <div
                className={`p-8 rounded-3xl min-h-[180px] flex flex-col justify-center items-center transition-all duration-300 relative border ${
                  showAnswer ? "bg-blue-600/15 border-blue-500/30 shadow-[0_0_20px_rgba(37,99,235,0.15)]" : "bg-white/5 border-white/10"
                }`}
              >
                <span className="absolute top-3 left-4 text-[9px] uppercase tracking-widest font-mono text-slate-500">
                  {activeFlashcards[cardIndex].subject} • {activeFlashcards[cardIndex].chapterName}
                </span>

                <div className="space-y-4 max-w-sm px-2">
                  <p className="text-sm md:text-base font-medium text-white leading-relaxed">
                    {activeFlashcards[cardIndex].question}
                  </p>

                  {showAnswer && (
                    <div className="pt-4 border-t border-white/10 text-xs md:text-sm text-slate-200 animate-fade-in font-sans leading-relaxed">
                      {activeFlashcards[cardIndex].answer}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-center gap-3">
                {!showAnswer ? (
                  <button
                    onClick={() => setShowAnswer(true)}
                    className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold py-2 px-6 rounded-xl transition"
                  >
                    Reveal Answer
                  </button>
                ) : (
                  <div className="flex gap-3">
                    <button
                      onClick={() => handleFlashcardReview("hard")}
                      className="bg-red-600 hover:bg-red-500 text-white text-xs font-bold py-2 px-5 rounded-xl transition"
                    >
                      Incorrect / Forgotten (Box 1)
                    </button>
                    <button
                      onClick={() => handleFlashcardReview("easy")}
                      className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold py-2 px-5 rounded-xl transition"
                    >
                      Recalled easily (+1 Box)
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* RENDER JOURNALING */}
      {activeSubTab === "journal" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* New Journal Entry Form */}
          <div className="lg:col-span-1 p-5 rounded-2xl bg-white/5 border border-white/10 glass">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-4 flex items-center gap-1.5">
              <Sun className="w-4 h-4 text-orange-400" /> Log Today's Win & Progress
            </h4>

            <form onSubmit={handleJournalSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Daily Accomplishments / Wins</label>
                <textarea
                  value={wins}
                  onChange={(e) => setWins(e.target.value)}
                  placeholder="e.g. Mastered organic chemistry mechanisms, studied for 8 solid hours on deep focus..."
                  rows={2}
                  required
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Mistakes & Unproductive Intervals</label>
                <textarea
                  value={mistakes}
                  onChange={(e) => setMistakes(e.target.value)}
                  placeholder="e.g. Wasted 1.5 hours scrolling reels in the afternoon, failed to revise laws of motion..."
                  rows={2}
                  required
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-xs text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Score Targets for Tomorrow</label>
                <textarea
                  value={goals}
                  onChange={(e) => setGoals(e.target.value)}
                  placeholder="e.g. Solve 50 physics MCQs, complete sexual reproduction NCERT active reading..."
                  rows={2}
                  required
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-xs text-white focus:outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold py-2 px-4 rounded-xl transition"
              >
                Publish Journal Entry
              </button>
            </form>
          </div>

          {/* Historical Journal Logs */}
          <div className="lg:col-span-2 p-5 rounded-2xl bg-white/5 border border-white/10 glass flex flex-col justify-between">
            <div>
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-4">Historical Mentoring Stream</h4>
              
              {journalEntries.length === 0 ? (
                <div className="text-center py-20 text-slate-500 text-xs">
                  No daily progress logs filed yet. Writing your journal unlocks self-reflective AI study guidelines.
                </div>
              ) : (
                <div className="space-y-4 max-h-[350px] overflow-y-auto custom-scrollbar pr-1">
                  {journalEntries.slice().reverse().map((entry, idx) => (
                    <div key={idx} className="p-4 rounded-xl bg-black/40 border border-white/5 space-y-2 text-xs">
                      <div className="flex justify-between items-center text-slate-400 font-mono text-[10px]">
                        <span>Journal Date: {entry.date}</span>
                        <span className="text-blue-400 uppercase font-bold">Verified Entry</span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-2 pt-1 border-t border-white/5">
                        <div className="bg-emerald-500/5 p-2 rounded-lg border border-emerald-500/10">
                          <strong className="text-emerald-400 block text-[9px] uppercase tracking-wide">🔥 Achievements / Wins</strong>
                          <p className="text-slate-300 text-[11px] mt-0.5">{entry.wins}</p>
                        </div>
                        <div className="bg-red-500/5 p-2 rounded-lg border border-red-500/10">
                          <strong className="text-red-400 block text-[9px] uppercase tracking-wide">⚠️ Gaps / Mistakes</strong>
                          <p className="text-slate-300 text-[11px] mt-0.5">{entry.mistakes}</p>
                        </div>
                        <div className="bg-blue-500/5 p-2 rounded-lg border border-blue-500/10">
                          <strong className="text-blue-400 block text-[9px] uppercase tracking-wide">🎯 Immediate Targets</strong>
                          <p className="text-slate-300 text-[11px] mt-0.5">{entry.goals}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* RENDER HEALTH & VITALS */}
      {activeSubTab === "health" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 p-5 rounded-2xl bg-white/5 border border-white/10 glass">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-4 flex items-center gap-1.5">
              <Heart className="w-4 h-4 text-red-400" /> Biometric Health Entry
            </h4>

            <form onSubmit={handleHealthSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Sleep Hours (Aim for 7-8h)</label>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="4"
                    max="10"
                    step="0.5"
                    value={sleep}
                    onChange={(e) => setSleep(Number(e.target.value))}
                    className="w-full accent-blue-500"
                  />
                  <span className="text-xs font-bold font-mono text-white whitespace-nowrap">{sleep} hours</span>
                </div>
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Water Hydration (Cups of 250ml)</label>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="2"
                    max="14"
                    value={water}
                    onChange={(e) => setWater(Number(e.target.value))}
                    className="w-full accent-blue-400"
                  />
                  <span className="text-xs font-bold font-mono text-white whitespace-nowrap">{water} cups</span>
                </div>
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Exercise / Stretches (Minutes)</label>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="0"
                    max="60"
                    step="5"
                    value={exercise}
                    onChange={(e) => setExercise(Number(e.target.value))}
                    className="w-full accent-emerald-500"
                  />
                  <span className="text-xs font-bold font-mono text-white whitespace-nowrap">{exercise} mins</span>
                </div>
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1.5">Mental Mood / Vitality</label>
                <div className="grid grid-cols-5 gap-1.5">
                  {(["Great", "Good", "Average", "Anxious", "Exhausted"] as const).map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setMood(m)}
                      className={`py-1 rounded text-[9px] font-bold border transition ${
                        mood === m
                          ? "bg-red-500/20 text-red-300 border-red-500/50"
                          : "bg-white/5 text-slate-400 border-white/5 hover:bg-white/10"
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold py-2.5 px-4 rounded-xl transition"
              >
                Save Biometric Health Check
              </button>
            </form>
          </div>

          <div className="lg:col-span-2 p-5 rounded-2xl bg-white/5 border border-white/10 glass flex flex-col justify-between">
            <div>
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-4 flex items-center gap-1">
                <Smile className="w-4 h-4 text-emerald-400" /> Daily Health & Stress Log History
              </h4>

              {healthLogs.length === 0 ? (
                <div className="text-center py-20 text-slate-500 text-xs">
                  No health logs recorded. Keeping your physical health optimized prevents final examination burnout.
                </div>
              ) : (
                <div className="space-y-3 max-h-[350px] overflow-y-auto custom-scrollbar">
                  {healthLogs.slice().reverse().map((log, idx) => (
                    <div key={idx} className="p-3 rounded-xl bg-black/40 border border-white/5 flex justify-between items-center text-xs">
                      <div>
                        <span className="text-[10px] text-slate-500 font-mono block">{log.date}</span>
                        <div className="flex gap-4 text-slate-300 mt-1">
                          <span>🛌 Sleep: <strong>{log.sleepHours}h</strong></span>
                          <span>💧 Water: <strong>{log.waterCups} cups</strong></span>
                          <span>🏃 Exercise: <strong>{log.exerciseMinutes}m</strong></span>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase ${
                          log.mood === "Great" || log.mood === "Good" ? "bg-emerald-500/15 text-emerald-400" : "bg-amber-500/15 text-amber-400"
                        }`}>
                          Mood: {log.mood}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
