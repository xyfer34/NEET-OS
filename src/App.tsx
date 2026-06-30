import React, { useState, useEffect } from "react";
import { StudentProfile, SyllabusChapter, PracticeLog, MockTestLog, MistakeItem, FormulaItem, Flashcard, JournalEntry, HealthLog } from "./types";
import { NEET_SYLLABUS_TEMPLATE, FORMULAS_TEMPLATE, FLASHCARDS_TEMPLATE } from "./data";

// Sub-components
import SetupFlow from "./components/SetupFlow";
import SyllabusTracker from "./components/SyllabusTracker";
import QuestionPractice from "./components/QuestionPractice";
import MockTestAnalyzer from "./components/MockTestAnalyzer";
import MistakeNotebook from "./components/MistakeNotebook";
import StudyTimer from "./components/StudyTimer";
import AIDoubtSolver from "./components/AIDoubtSolver";
import AuxiliaryTools from "./components/AuxiliaryTools";

// Icons
import {
  Sparkles,
  BookOpen,
  Calendar,
  CheckCircle,
  Flame,
  Award,
  Zap,
  Activity,
  Plus,
  Clock,
  Target,
  PenTool,
  Bookmark,
  TrendingUp,
  HelpCircle,
  LogOut,
  RefreshCw,
  Bell,
  Sliders,
  ChevronRight
} from "lucide-react";

export default function App() {
  // Main States
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [syllabus, setSyllabus] = useState<SyllabusChapter[]>(NEET_SYLLABUS_TEMPLATE);
  const [practiceLogs, setPracticeLogs] = useState<PracticeLog[]>([]);
  const [mockLogs, setMockLogs] = useState<MockTestLog[]>([]);
  const [mistakes, setMistakes] = useState<MistakeItem[]>([]);
  const [formulas, setFormulas] = useState<FormulaItem[]>(FORMULAS_TEMPLATE);
  const [flashcards, setFlashcards] = useState<Flashcard[]>(FLASHCARDS_TEMPLATE);
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([]);
  const [healthLogs, setHealthLogs] = useState<HealthLog[]>([]);

  // Navigation state
  const [activeTab, setActiveTab] = useState<"dashboard" | "syllabus" | "practice" | "mock" | "mistakes" | "doubt" | "auxiliary">("dashboard");

  // AI Planner state
  const [aiReport, setAiReport] = useState<string | null>(null);
  const [loadingAiReport, setLoadingAiReport] = useState(false);
  const [aiReportError, setAiReportError] = useState<string | null>(null);

  // Notification state
  const [toasts, setToasts] = useState<{ id: string; message: string; type: "success" | "xp" }[]>([]);

  // Load state from localStorage on mount
  useEffect(() => {
    try {
      const storedProfile = localStorage.getItem("neet_os_profile");
      const storedSyllabus = localStorage.getItem("neet_os_syllabus");
      const storedPractice = localStorage.getItem("neet_os_practice");
      const storedMocks = localStorage.getItem("neet_os_mocks");
      const storedMistakes = localStorage.getItem("neet_os_mistakes");
      const storedFormulas = localStorage.getItem("neet_os_formulas");
      const storedFlashcards = localStorage.getItem("neet_os_flashcards");
      const storedJournal = localStorage.getItem("neet_os_journal");
      const storedHealth = localStorage.getItem("neet_os_health");

      if (storedProfile) setProfile(JSON.parse(storedProfile));
      if (storedSyllabus) setSyllabus(JSON.parse(storedSyllabus));
      if (storedPractice) setPracticeLogs(JSON.parse(storedPractice));
      if (storedMocks) setMockLogs(JSON.parse(storedMocks));
      if (storedMistakes) setMistakes(JSON.parse(storedMistakes));
      if (storedFormulas) setFormulas(JSON.parse(storedFormulas));
      if (storedFlashcards) setFlashcards(JSON.parse(storedFlashcards));
      if (storedJournal) setJournalEntries(JSON.parse(storedJournal));
      if (storedHealth) setHealthLogs(JSON.parse(storedHealth));
    } catch (e) {
      console.error("Failed to restore NEET OS cached state:", e);
    }
  }, []);

  // Save states on updates
  useEffect(() => {
    if (profile) localStorage.setItem("neet_os_profile", JSON.stringify(profile));
  }, [profile]);

  useEffect(() => {
    localStorage.setItem("neet_os_syllabus", JSON.stringify(syllabus));
  }, [syllabus]);

  useEffect(() => {
    localStorage.setItem("neet_os_practice", JSON.stringify(practiceLogs));
  }, [practiceLogs]);

  useEffect(() => {
    localStorage.setItem("neet_os_mocks", JSON.stringify(mockLogs));
  }, [mockLogs]);

  useEffect(() => {
    localStorage.setItem("neet_os_mistakes", JSON.stringify(mistakes));
  }, [mistakes]);

  useEffect(() => {
    localStorage.setItem("neet_os_formulas", JSON.stringify(formulas));
  }, [formulas]);

  useEffect(() => {
    localStorage.setItem("neet_os_flashcards", JSON.stringify(flashcards));
  }, [flashcards]);

  useEffect(() => {
    localStorage.setItem("neet_os_journal", JSON.stringify(journalEntries));
  }, [journalEntries]);

  useEffect(() => {
    localStorage.setItem("neet_os_health", JSON.stringify(healthLogs));
  }, [healthLogs]);

  // Fetch AI Strategic recommendations
  const fetchAiStrategicReport = async (studentProfile: StudentProfile) => {
    setLoadingAiReport(true);
    setAiReportError(null);
    try {
      // Calculate current avg mock marks
      const avgMarks = mockLogs.length > 0
        ? Math.round(mockLogs.reduce((acc, m) => acc + m.totalMarks, 0) / mockLogs.length)
        : studentProfile.currentMarks;

      const res = await fetch("/api/recommendations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...studentProfile,
          currentAverageMarks: avgMarks,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to fetch response.");
      }
      setAiReport(data.response);
    } catch (err: any) {
      console.error(err);
      setAiReportError(err?.message || "Verify your API key setup in Secrets configuration.");
    } finally {
      setLoadingAiReport(false);
    }
  };

  // Trigger recommendations when profile changes or on dashboard launch
  useEffect(() => {
    if (profile && !aiReport && !loadingAiReport) {
      fetchAiStrategicReport(profile);
    }
  }, [profile]);

  // Toast notifier
  const addToast = (message: string, type: "success" | "xp" = "success") => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  // XP progression engine
  const addXP = (amount: number, reason: string) => {
    if (!profile) return;
    setProfile((prev) => {
      if (!prev) return null;
      const newXP = prev.xp + amount;
      const requiredXPForNextLevel = prev.level * 1000;
      
      let newLevel = prev.level;
      if (newXP >= requiredXPForNextLevel) {
        newLevel += 1;
        addToast(`🎉 Level Up! You are now Level ${newLevel}! (${getLevelBadge(newLevel)})`, "success");
      }

      addToast(`+${amount} XP: ${reason}`, "xp");

      return {
        ...prev,
        xp: newXP,
        level: newLevel,
      };
    });
  };

  // Profile setup submission
  const handleSetupComplete = (
    newProfile: StudentProfile,
    completedChapterIds: string[],
    weakChapterIds: string[],
    strongChapterIds: string[]
  ) => {
    // 1. Set the profile
    setProfile(newProfile);

    // 2. Adjust mastery values in chapters list
    const updatedSyllabus = syllabus.map((chap) => {
      let mastery = chap.masteryStatus;
      let theory = chap.theoryDone;
      let ncert = chap.ncertReadCount;
      let ques = chap.questionPracticeCount;

      if (completedChapterIds.includes(chap.id)) {
        mastery = "mastered";
        theory = true;
        if (ncert === 0) ncert = 1;
        if (ques === 0) ques = 50;
      } else if (weakChapterIds.includes(chap.id)) {
        mastery = "weak";
        theory = true;
        ques = 5;
      } else if (strongChapterIds.includes(chap.id)) {
        mastery = "mastered";
        theory = true;
        if (ncert === 0) ncert = 2;
        if (ques === 0) ques = 75;
      }

      return {
        ...chap,
        masteryStatus: mastery,
        theoryDone: theory,
        ncertReadCount: ncert,
        questionPracticeCount: ques,
      };
    });

    setSyllabus(updatedSyllabus);
    addToast("NEET OS Engine Configured Successfully!", "success");
  };

  // Update single syllabus chapter
  const handleUpdateChapter = (updatedChap: SyllabusChapter) => {
    setSyllabus((prev) => prev.map((c) => (c.id === updatedChap.id ? updatedChap : c)));
    addXP(40, `Updated study metrics for ${updatedChap.name}`);
  };

  // Add MCQ Practice log
  const handleAddPracticeLog = (logData: Omit<PracticeLog, "id" | "timestamp">) => {
    const newLog: PracticeLog = {
      ...logData,
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
    };

    setPracticeLogs((prev) => [...prev, newLog]);

    // Update the syllabus chapter practice counts
    setSyllabus((prev) =>
      prev.map((c) => {
        if (c.id === logData.chapterId) {
          const newPracticeCount = c.questionPracticeCount + logData.correct + logData.wrong + logData.skipped;
          // Recalculate mastery status automatically
          let status = c.masteryStatus;
          if (c.theoryDone && c.ncertReadCount >= 1 && c.pyqsDone && newPracticeCount >= 40 && c.mockTested) {
            status = "mastered";
          } else if (newPracticeCount < 15 && c.theoryDone) {
            status = "weak";
          } else {
            status = "revision_due";
          }
          return {
            ...c,
            questionPracticeCount: newPracticeCount,
            masteryStatus: status,
          };
        }
        return c;
      })
    );

    const totalQuestions = logData.correct + logData.wrong + logData.skipped;
    addXP(Math.round(totalQuestions * 1.5), `Logged practice session of ${totalQuestions} MCQs`);
  };

  // Add Mock Test Log
  const handleAddMockLog = (mockData: Omit<MockTestLog, "id" | "timestamp">) => {
    const newMock: MockTestLog = {
      ...mockData,
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
    };

    setMockLogs((prev) => [...prev, newMock]);

    // Set any logged weak chapters status to 'weak'
    setSyllabus((prev) =>
      prev.map((c) => {
        if (mockData.weakChapters.includes(c.name)) {
          return { ...c, masteryStatus: "weak" };
        }
        return c;
      })
    );

    addXP(250, "Completed NEET Full/Part Mock Test Session");

    // Force refresh AI advice with new mock scores
    if (profile) {
      fetchAiStrategicReport(profile);
    }
  };

  // Add Mistake Log
  const handleAddMistake = (mistakeData: Omit<MistakeItem, "id" | "date" | "reviewCount">) => {
    const newMistake: MistakeItem = {
      ...mistakeData,
      id: Date.now().toString(),
      date: new Date().toISOString().split("T")[0],
      reviewCount: 0,
    };

    setMistakes((prev) => [...prev, newMistake]);
    addXP(30, "Added question to Mistake Notebook");
  };

  const handleDeleteMistake = (id: string) => {
    setMistakes((prev) => prev.filter((m) => m.id !== id));
  };

  // Formulas Bookmark Toggle
  const handleToggleFormulaBookmark = (id: string) => {
    setFormulas((prev) =>
      prev.map((f) => (f.id === id ? { ...f, isBookmarked: !f.isBookmarked } : f))
    );
    addToast("Formula bookmarks updated", "success");
  };

  // Flashcards Spaced Recalls
  const handleReviewFlashcard = (id: string, ratedDifficulty: "easy" | "hard") => {
    setFlashcards((prev) =>
      prev.map((fc) => {
        if (fc.id === id) {
          const newBox = ratedDifficulty === "easy" ? Math.min(5, fc.box + 1) : 1;
          const reviewInDays = newBox === 1 ? 1 : newBox === 2 ? 3 : newBox === 3 ? 7 : newBox === 4 ? 15 : 30;
          
          const reviewDate = new Date();
          reviewDate.setDate(reviewDate.getDate() + reviewInDays);

          return {
            ...fc,
            box: newBox,
            nextReviewDate: reviewDate.toISOString().split("T")[0],
          };
        }
        return fc;
      })
    );

    addXP(25, "Finished Leitner spaced recall revision");
  };

  // Daily Journal Logging
  const handleAddJournal = (wins: string, mistakes: string, goals: string) => {
    const newEntry: JournalEntry = {
      date: new Date().toISOString().split("T")[0],
      wins,
      mistakes,
      goals,
    };

    setJournalEntries((prev) => [...prev, newEntry]);
    addXP(60, "Filed daily reflective journal report");
  };

  // Save Health Log
  const handleSaveHealthLog = (sleep: number, water: number, exercise: number, mood: HealthLog["mood"]) => {
    const newLog: HealthLog = {
      date: new Date().toISOString().split("T")[0],
      sleepHours: sleep,
      waterCups: water,
      exerciseMinutes: exercise,
      mood,
    };

    setHealthLogs((prev) => [...prev, newLog]);
    addXP(50, "Filed biometric health statistics");
  };

  // Study hours logger
  const handleAddStudyHours = (minutes: number) => {
    addXP(Math.round(minutes * 3.5), `Logged ${minutes} minutes of deeply focused study`);
  };

  // Heuristic Level badges
  const getLevelBadge = (lvl: number) => {
    if (lvl >= 10) return "AIR 1 Contender (Elite)";
    if (lvl >= 7) return "High-Scoring Competitor";
    if (lvl >= 4) return "Dedicated NEET Aspirant";
    return "Consistent Learner";
  };

  // Logout reset option
  const handleResetApp = () => {
    if (window.confirm("⚠️ Are you sure you want to reset NEET OS? This wipes your profile, logs, and progress history.")) {
      localStorage.clear();
      window.location.reload();
    }
  };

  // Calculate overall syllabus completions percentage
  const totalChaptersCount = syllabus.length;
  const completedChaptersCount = syllabus.filter(
    (c) => c.theoryDone && c.ncertReadCount >= 1 && c.questionPracticeCount >= 30
  ).length;
  const overallSyllabusPercentage = Math.round((completedChaptersCount / (totalChaptersCount || 1)) * 100);

  // If no profile, render setup flow
  if (!profile) {
    return <SetupFlow onComplete={handleSetupComplete} />;
  }

  return (
    <div className="min-h-screen bg-[#050507] text-[#e4e4e7] font-sans selection:bg-blue-600/30">
      
      {/* Visual background gradient accents */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(37,99,235,0.08),transparent_50%)] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(168,85,247,0.05),transparent_40%)] pointer-events-none" />

      {/* Floating Notification Toasts */}
      <div className="fixed top-4 right-4 z-50 space-y-2 pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`p-3.5 rounded-xl border text-xs font-bold shadow-xl flex items-center gap-2 animate-fade-in glass pointer-events-auto ${
              toast.type === "xp"
                ? "border-amber-500/30 text-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.15)]"
                : "border-blue-500/30 text-blue-300 shadow-[0_0_12px_rgba(59,130,246,0.15)]"
            }`}
          >
            {toast.type === "xp" ? <Zap className="w-4 h-4 text-amber-400" /> : <CheckCircle className="w-4 h-4 text-blue-400" />}
            <span>{toast.message}</span>
          </div>
        ))}
      </div>

      {/* Main Container Layout */}
      <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-6">
        
        {/* Navigation Top Bar */}
        <header className="p-4 md:p-5 rounded-3xl bg-[#09090b]/80 border border-white/10 glass flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-600 flex items-center justify-center shadow-[0_0_15px_rgba(37,99,235,0.4)]">
              <span className="text-white font-bold text-xl font-display">N</span>
            </div>
            <div>
              <h1 className="text-lg font-bold text-white font-display tracking-tight flex items-center gap-1.5">
                NEET <span className="text-blue-500">OS</span>
                <span className="text-[9px] uppercase tracking-widest bg-blue-500/10 border border-blue-500/20 text-blue-400 px-2 py-0.5 rounded-full font-sans">v1.2 Premium</span>
              </h1>
              <p className="text-[10px] text-slate-400">Aspirant Score-Maximization Engine</p>
            </div>
          </div>

          {/* Nav Links */}
          <nav className="flex flex-wrap items-center gap-1.5 bg-black/40 p-1 rounded-2xl border border-white/5">
            {[
              { id: "dashboard", label: "Dashboard", emoji: "🏠" },
              { id: "syllabus", label: "Syllabus", emoji: "📚" },
              { id: "practice", label: "MCQ Practice", emoji: "🎯" },
              { id: "mock", label: "Mock Analyzer", emoji: "🏆" },
              { id: "mistakes", label: "Mistakes Notebook", emoji: "📓" },
              { id: "doubt", label: "Doubt Solver", emoji: "🦉" },
              { id: "auxiliary", label: "Helpers", emoji: "🎒" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1 ${
                  activeTab === tab.id
                    ? "bg-blue-600 text-white shadow-[0_0_10px_rgba(37,99,235,0.3)]"
                    : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
                }`}
              >
                <span>{tab.emoji}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>

          {/* Action Tools: Restart Setup */}
          <div className="flex items-center gap-3">
            <button
              onClick={handleResetApp}
              className="p-2 rounded-xl bg-white/2 hover:bg-red-500/10 hover:text-red-400 border border-white/5 transition text-slate-400"
              title="Reset profile and clear data"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* Global Progress Strip */}
        <section className="grid grid-cols-2 md:grid-cols-5 gap-3.5">
          <div className="p-3.5 bg-white/2 border border-white/5 rounded-2xl flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center shrink-0">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] uppercase text-slate-500 tracking-wider">Exam Countdown</span>
              <p className="text-base font-black text-white font-mono">{profile.daysRemaining} Days</p>
            </div>
          </div>

          <div className="p-3.5 bg-white/2 border border-white/5 rounded-2xl flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center shrink-0">
              <Target className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] uppercase text-slate-500 tracking-wider">Target Marks</span>
              <p className="text-base font-black text-white font-mono">{profile.targetScore} / 720</p>
            </div>
          </div>

          <div className="p-3.5 bg-white/2 border border-white/5 rounded-2xl flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center shrink-0">
              <Flame className="w-5 h-5 animate-bounce" />
            </div>
            <div>
              <span className="text-[10px] uppercase text-slate-500 tracking-wider">Focus Level</span>
              <p className="text-base font-black text-white font-mono">Lvl {profile.level}</p>
            </div>
          </div>

          <div className="p-3.5 bg-white/2 border border-white/5 rounded-2xl flex items-center gap-3 col-span-2 md:col-span-2">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <span className="text-[10px] uppercase text-slate-500 tracking-wider flex justify-between">
                <span>Syllabus Completed</span>
                <span className="font-bold text-emerald-400 font-mono">{overallSyllabusPercentage}%</span>
              </span>
              <div className="h-1.5 bg-white/5 rounded-full mt-1 overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${overallSyllabusPercentage}%` }} />
              </div>
            </div>
          </div>
        </section>

        {/* Dynamic Inner Tab Router */}
        <main className="space-y-6">
          
          {/* TAB: DASHBOARD */}
          {activeTab === "dashboard" && (
            <div className="space-y-6">
              
              {/* Daily study timer banner */}
              <StudyTimer onAddStudyHours={handleAddStudyHours} />

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* AI Study Planner bespoke advice box */}
                <div className="lg:col-span-2 p-6 rounded-3xl bg-gradient-to-br from-indigo-950/20 to-blue-900/10 border border-indigo-500/20 glass flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-center mb-4">
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-yellow-400 animate-pulse" />
                        <h3 className="text-sm font-bold uppercase tracking-wider text-white">Bespot AI Strategist Advice</h3>
                      </div>
                      
                      <button
                        onClick={() => fetchAiStrategicReport(profile)}
                        disabled={loadingAiReport}
                        className="text-[10px] uppercase font-bold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition"
                      >
                        <RefreshCw className={`w-3 h-3 ${loadingAiReport ? "animate-spin" : ""}`} /> Regenerate Plan
                      </button>
                    </div>

                    {loadingAiReport && (
                      <div className="py-24 text-center space-y-3">
                        <span className="loading-spinner block mx-auto text-blue-400">⚡</span>
                        <p className="text-xs text-slate-400">Analyzing diagnostic metrics, weak areas, and score acceleration potentials...</p>
                      </div>
                    )}

                    {aiReportError && (
                      <div className="p-4 bg-red-600/15 border border-red-500/20 rounded-xl text-xs text-red-300">
                        <p className="font-bold">Advice Generation Suspended</p>
                        <p className="mt-1">{aiReportError}</p>
                        <p className="mt-2 text-[10px] text-slate-500">Provide a valid GEMINI_API_KEY environment variable to enable full strategic optimization reports.</p>
                      </div>
                    )}

                    {!loadingAiReport && !aiReportError && !aiReport && (
                      <div className="py-12 text-center text-xs text-slate-500">
                        No advice compiled yet. Click regenerate plan to analyze current logs.
                      </div>
                    )}

                    {!loadingAiReport && aiReport && (
                      <div className="text-xs md:text-sm text-slate-300 leading-relaxed space-y-3 max-h-[400px] overflow-y-auto custom-scrollbar pr-2">
                        {/* Custom Heuristic Markdown parser */}
                        {aiReport.split("\n").map((line, idx) => {
                          const cleaned = line.trim();
                          if (!cleaned) return <div key={idx} className="h-1" />;
                          
                          if (cleaned.startsWith("###")) {
                            return <h5 key={idx} className="text-xs font-extrabold text-indigo-400 uppercase tracking-widest mt-3.5 mb-1.5">{cleaned.replace("###", "").trim()}</h5>;
                          }
                          if (cleaned.startsWith("##") || cleaned.startsWith("#")) {
                            return <h4 key={idx} className="text-sm font-black text-white border-b border-white/5 pb-1 mt-4 mb-2">{cleaned.replace(/^#+/, "").trim()}</h4>;
                          }
                          if (cleaned.startsWith("*") || cleaned.startsWith("-")) {
                            return (
                              <li key={idx} className="list-disc pl-4 text-xs my-0.5 text-slate-300">
                                {cleaned.slice(1).trim()}
                              </li>
                            );
                          }
                          return <p key={idx} className="text-xs text-slate-300 my-1">{cleaned}</p>;
                        })}
                      </div>
                    )}
                  </div>

                  <p className="text-[10px] text-slate-500 text-center uppercase tracking-widest mt-4">
                    NEET OS 2026 CO-PILOT. INTEGRATED TO GEMINI FOR ACCELERATED RANK COMPILATIONS.
                  </p>
                </div>

                {/* Sub-panels: Streak, Level Progress, Coaching Status */}
                <div className="space-y-6">
                  
                  {/* Streak & Consistency metrics */}
                  <div className="p-5 rounded-2xl bg-white/5 border border-white/10 glass space-y-4">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Flame className="w-4 h-4 text-orange-400" /> Consistency Streak Status
                    </h4>

                    <div className="flex justify-between items-center">
                      <div>
                        <span className="text-3xl font-black text-white font-mono">{profile.streak} Days</span>
                        <p className="text-[10px] text-slate-400 mt-1">Study consecutive days to unlock XP multipliers.</p>
                      </div>

                      <div className="w-12 h-12 rounded-full bg-orange-500/10 flex items-center justify-center text-orange-400 border border-orange-500/20">
                        <Flame className="w-6 h-6 animate-pulse" />
                      </div>
                    </div>
                  </div>

                  {/* Achievements and level badge */}
                  <div className="p-5 rounded-2xl bg-white/5 border border-white/10 glass space-y-4">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Award className="w-4 h-4 text-yellow-400" /> Rank Multiplier Level
                    </h4>

                    <div>
                      <span className="text-xs font-extrabold text-blue-400">{getLevelBadge(profile.level)}</span>
                      <div className="flex justify-between items-center text-[10px] text-slate-400 mt-2">
                        <span>Total XP: {profile.xp}</span>
                        <span>Next Level: {profile.level * 1000} XP</span>
                      </div>
                      
                      <div className="h-1.5 bg-white/5 rounded-full overflow-hidden mt-1.5">
                        <div
                          className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full"
                          style={{ width: `${Math.min(100, (profile.xp / (profile.level * 1000)) * 100)}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Quick stats about Mock vs Goal */}
                  <div className="p-5 rounded-2xl bg-white/5 border border-white/10 glass space-y-4">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Activity className="w-4 h-4 text-emerald-400" /> Score Gap Analyzer
                    </h4>

                    <div className="space-y-2.5">
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-400">Current Mock Score:</span>
                        <span className="font-bold text-slate-200 font-mono">
                          {mockLogs.length > 0 ? mockLogs[mockLogs.length - 1].totalMarks : profile.currentMarks} Marks
                        </span>
                      </div>
                      
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-400">Score Gap to Target:</span>
                        <span className="font-bold text-red-400 font-mono">
                          -{profile.targetScore - (mockLogs.length > 0 ? mockLogs[mockLogs.length - 1].totalMarks : profile.currentMarks)} Marks
                        </span>
                      </div>

                      <div className="flex justify-between text-xs">
                        <span className="text-slate-400">Target score:</span>
                        <span className="font-bold text-emerald-400 font-mono">{profile.targetScore} Marks</span>
                      </div>
                    </div>
                  </div>

                </div>

              </div>

            </div>
          )}

          {/* TAB: SYLLABUS */}
          {activeTab === "syllabus" && (
            <SyllabusTracker syllabus={syllabus} onUpdateChapter={handleUpdateChapter} />
          )}

          {/* TAB: PRACTICE */}
          {activeTab === "practice" && (
            <QuestionPractice
              chapters={syllabus}
              practiceLogs={practiceLogs}
              onAddLog={handleAddPracticeLog}
              onClearLogs={() => {
                if (window.confirm("Are you sure you want to clear practice log history?")) {
                  setPracticeLogs([]);
                }
              }}
              dailyTarget={profile.dailyStudyHours * 12} // Heuristics target based on hours
            />
          )}

          {/* TAB: MOCK ANALYZER */}
          {activeTab === "mock" && (
            <MockTestAnalyzer chapters={syllabus} mockLogs={mockLogs} onAddMockLog={handleAddMockLog} />
          )}

          {/* TAB: MISTAKES NOTEBOOK */}
          {activeTab === "mistakes" && (
            <MistakeNotebook
              chapters={syllabus}
              mistakes={mistakes}
              onAddMistake={handleAddMistake}
              onDeleteMistake={handleDeleteMistake}
            />
          )}

          {/* TAB: DOUBT SOLVER */}
          {activeTab === "doubt" && <AIDoubtSolver chapters={syllabus} />}

          {/* TAB: HELPERS/AUXILIARY */}
          {activeTab === "auxiliary" && (
            <AuxiliaryTools
              chapters={syllabus}
              formulas={formulas}
              onToggleFormulaBookmark={handleToggleFormulaBookmark}
              flashcards={flashcards}
              onReviewFlashcard={handleReviewFlashcard}
              journalEntries={journalEntries}
              onAddJournal={handleAddJournal}
              healthLogs={healthLogs}
              onSaveHealthLog={handleSaveHealthLog}
            />
          )}

        </main>

        {/* Humble and Clean Outer Footer */}
        <footer className="text-center py-8 text-[11px] text-slate-500 uppercase tracking-widest border-t border-white/5 mt-12">
          <span>NEET OS © 2026 • CREATED BY AN ELITE TEAM OF GEOMATIC STRATEGISTS AND MEDICAL MENTORS</span>
        </footer>

      </div>
    </div>
  );
}
