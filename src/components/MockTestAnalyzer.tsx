import React, { useState } from "react";
import { MockTestLog, SyllabusChapter } from "../types";
import { Award, AlertTriangle, TrendingUp, HelpCircle, Plus, CheckCircle, Activity, ChevronRight, PieChart } from "lucide-react";

interface MockTestAnalyzerProps {
  chapters: SyllabusChapter[];
  mockLogs: MockTestLog[];
  onAddMockLog: (log: Omit<MockTestLog, "id" | "timestamp">) => void;
}

export default function MockTestAnalyzer({ chapters, mockLogs, onAddMockLog }: MockTestAnalyzerProps) {
  // Input Form States
  const [physicsMarks, setPhysicsMarks] = useState(135);
  const [chemistryMarks, setChemistryMarks] = useState(145);
  const [biologyMarks, setBiologyMarks] = useState(300);
  const [correct, setCorrect] = useState(145);
  const [wrong, setWrong] = useState(25);
  const [skipped, setSkipped] = useState(10);
  const [timeLeft, setTimeLeft] = useState(15);
  const [selectedWeakChapters, setSelectedWeakChapters] = useState<string[]>([]);
  const [selectedReasons, setSelectedReasons] = useState<string[]>([]);
  const [showForm, setShowForm] = useState(false);

  // Suggested tags
  const mistakeReasonsOptions = [
    "Calculation Error",
    "Formula Missed/Forgotten",
    "Conceptual Confusion",
    "Time Pressure Rush",
    "Misread Question/Negation Option",
    "NCERT Fact Out of Mind",
    "Unforced Silly Mistake",
    "Guessed Wrongly",
  ];

  const handleToggleReason = (reason: string) => {
    if (selectedReasons.includes(reason)) {
      setSelectedReasons(selectedReasons.filter(r => r !== reason));
    } else {
      setSelectedReasons([...selectedReasons, reason]);
    }
  };

  const handleToggleChapter = (name: string) => {
    if (selectedWeakChapters.includes(name)) {
      setSelectedWeakChapters(selectedWeakChapters.filter(c => c !== name));
    } else {
      setSelectedWeakChapters([...selectedWeakChapters, name]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const total = Number(physicsMarks) + Number(chemistryMarks) + Number(biologyMarks);
    
    onAddMockLog({
      date: new Date().toISOString().split("T")[0],
      physicsMarks: Number(physicsMarks),
      chemistryMarks: Number(chemistryMarks),
      biologyMarks: Number(biologyMarks),
      totalMarks: total,
      correct: Number(correct),
      wrong: Number(wrong),
      skipped: Number(skipped),
      timeLeftMinutes: Number(timeLeft),
      weakChapters: selectedWeakChapters,
      mistakeReasons: selectedReasons,
    });

    setShowForm(false);
    setSelectedWeakChapters([]);
    setSelectedReasons([]);
  };

  // Generate Analytical Heuristic Reports based on mock log history
  const generateAnalysisReport = (latestLog: MockTestLog) => {
    const totalPossible = 720;
    const scorePct = (latestLog.totalMarks / totalPossible) * 100;

    let strengths: string[] = [];
    let weaknesses: string[] = [];
    let suggestions: string[] = [];

    // Analyze Marks Distribution
    if (latestLog.biologyMarks >= 320) {
      strengths.push("High proficiency in Biology (Botany & Zoology). Solid NCERT grip.");
    } else {
      weaknesses.push("Biology is below the threshold of 320. NEET requires 340+ in Biology for elite ranks.");
      suggestions.push("Do back-to-back active recall sessions of NCERT Biology. Focus strictly on Pteridophytes, Plant Kingdom, and Human Physiology diagrams.");
    }

    if (latestLog.physicsMarks >= 140) {
      strengths.push("Strong calculation stamina and high-efficiency mathematical applications in Physics.");
    } else {
      weaknesses.push("Physics score is weak (<140 marks). Losing points on high-yield chapters.");
      suggestions.push("Create a Formula Quick Revision Sheet specifically for Electrostatics and Laws of Motion. Complete at least 45 PYQs for these chapters.");
    }

    if (latestLog.chemistryMarks >= 140) {
      strengths.push("Excellent balance between Physical, Organic, and Inorganic Chemistry.");
    } else {
      weaknesses.push("Chemistry is pulling down your aggregate marks. Likely slipping in Named Organic Reactions or Mole Concept numericals.");
      suggestions.push("Study Named Reactions (Aldol, Cannizzaro, etc.) from the formula book and solve 20 chemical kinetics numericals.");
    }

    // Analyze Mistake reasons
    if (latestLog.mistakeReasons.includes("Calculation Error")) {
      suggestions.push("Slow down during basic arithmetic in Physical Chemistry. Write down step-by-step variables rather than quick mental math.");
    }
    if (latestLog.mistakeReasons.includes("Formula Missed/Forgotten")) {
      suggestions.push("Dedicate 20 minutes before bedtime to bookmark and revise the Formula Book. Focus on mechanics formulas.");
    }
    if (latestLog.mistakeReasons.includes("Time Pressure Rush") || latestLog.timeLeftMinutes <= 0) {
      suggestions.push("Use the Deep Work timer to set speed drill restrictions. Aim for <50 seconds per Biology question.");
    }

    // Fill defaults if empty
    if (strengths.length === 0) strengths.push("Consistent attempt rate across all three subjects.");
    if (weaknesses.length === 0) weaknesses.push("Mild accuracy gaps under final exam-like timing.");
    if (suggestions.length === 0) suggestions.push("Double check your incorrect questions and log them into the Mistake Notebook immediately.");

    return { strengths, weaknesses, suggestions };
  };

  const latestTest = mockLogs[mockLogs.length - 1];
  const report = latestTest ? generateAnalysisReport(latestTest) : null;

  return (
    <div className="space-y-6">
      {/* Overview stats of Mock test history */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Latest Mock Score Card */}
        <div className="md:col-span-2 p-6 rounded-3xl bg-gradient-to-br from-purple-600/10 to-blue-600/10 border border-purple-500/20 glass flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Award className="w-5 h-5 text-yellow-400" /> NEET Mock Test Performance Analyzer
                </h3>
                <p className="text-xs text-slate-400">Log standard test series mock papers to obtain expected rank predictions.</p>
              </div>
              <button
                onClick={() => setShowForm(true)}
                className="bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold py-2 px-4 rounded-xl transition"
              >
                Log New Mock Test
              </button>
            </div>

            {latestTest ? (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
                <div className="bg-black/30 p-4 rounded-2xl border border-white/5 text-center md:col-span-1">
                  <span className="text-[10px] text-slate-400 uppercase tracking-widest block mb-1">Total Score</span>
                  <span className="text-3xl font-black text-white font-mono">{latestTest.totalMarks}</span>
                  <span className="text-[10px] text-slate-500 block">/ 720</span>
                </div>

                <div className="md:col-span-3 grid grid-cols-3 gap-3 text-center">
                  <div className="bg-purple-500/5 p-3 rounded-xl border border-purple-500/10">
                    <span className="text-[10px] text-purple-400 font-bold block">Physics</span>
                    <span className="text-xl font-bold font-mono text-white">{latestTest.physicsMarks}</span>
                    <span className="text-[9px] text-slate-500 block">/ 180</span>
                  </div>
                  <div className="bg-amber-500/5 p-3 rounded-xl border border-amber-500/10">
                    <span className="text-[10px] text-amber-400 font-bold block">Chemistry</span>
                    <span className="text-xl font-bold font-mono text-white">{latestTest.chemistryMarks}</span>
                    <span className="text-[9px] text-slate-500 block">/ 180</span>
                  </div>
                  <div className="bg-emerald-500/5 p-3 rounded-xl border border-emerald-500/10">
                    <span className="text-[10px] text-emerald-400 font-bold block">Biology</span>
                    <span className="text-xl font-bold font-mono text-white">{latestTest.biologyMarks}</span>
                    <span className="text-[9px] text-slate-500 block">/ 360</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-8 text-center border border-dashed border-white/5 rounded-2xl">
                <p className="text-xs text-slate-500">No mock tests registered yet. Log your first mock paper above to unlock score trends.</p>
              </div>
            )}
          </div>

          {latestTest && (
            <div className="mt-4 p-3 rounded-xl bg-purple-500/5 border border-purple-500/15 flex justify-between items-center text-xs">
              <span className="text-slate-400">Mock metrics: Correct: <strong>{latestTest.correct}</strong> • Incorrect: <strong>{latestTest.wrong}</strong> • Skipped: <strong>{latestTest.skipped}</strong></span>
              <span className="text-purple-300 font-mono">Time Left: {latestTest.timeLeftMinutes} mins</span>
            </div>
          )}
        </div>

        {/* Expected Score Trend Card */}
        <div className="p-5 rounded-3xl bg-white/5 border border-white/10 glass">
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
            <TrendingUp className="w-4 h-4 text-emerald-400" /> Score Tendency Trend
          </h4>

          {mockLogs.length === 0 ? (
            <div className="text-center py-10">
              <span className="text-3xl text-slate-600">📈</span>
              <p className="text-[11px] text-slate-500 mt-2">Log tests to construct a beautiful visual scoring trendline.</p>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="h-28 flex items-end justify-between px-2 pt-4 bg-black/20 rounded-xl border border-white/5">
                {mockLogs.map((log, idx) => {
                  const barHeight = (log.totalMarks / 720) * 100;
                  return (
                    <div key={log.id || idx} className="flex-1 flex flex-col items-center group relative cursor-pointer">
                      <div className="absolute bottom-full mb-1 bg-purple-600 text-white text-[9px] font-bold py-0.5 px-1.5 rounded opacity-0 group-hover:opacity-100 transition whitespace-nowrap">
                        {log.totalMarks} Marks
                      </div>
                      <div
                        className="w-5 bg-gradient-to-t from-purple-600 to-indigo-500 rounded-t shadow-[0_0_8px_rgba(168,85,247,0.3)] transition-all duration-300"
                        style={{ height: `${Math.max(15, barHeight)}%` }}
                      />
                      <span className="text-[9px] text-slate-500 mt-1.5">T{idx + 1}</span>
                    </div>
                  );
                })}
              </div>
              <p className="text-[10px] text-slate-500 text-center uppercase tracking-wide">Aggregate Mock Timeline (Latest on Right)</p>
            </div>
          )}
        </div>
      </div>

      {/* AI Strategist Mock Analysis Report Panel */}
      {latestTest && report && (
        <div className="p-6 rounded-2xl bg-white/5 border border-white/10 glass space-y-6">
          <div className="flex items-center gap-2 border-b border-white/10 pb-3">
            <div className="w-8 h-8 rounded-full bg-blue-600/20 flex items-center justify-center text-blue-400">
              <Activity className="w-4 h-4" />
            </div>
            <div>
              <h4 className="font-bold text-white text-sm">NEET OS Intelligent Strategic Report</h4>
              <p className="text-[10px] text-slate-500 uppercase tracking-widest">Score maximization algorithm active</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Subject Strengths */}
            <div className="space-y-3">
              <h5 className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500" /> Competitive Strengths
              </h5>
              <ul className="space-y-2">
                {report.strengths.map((str, i) => (
                  <li key={i} className="text-xs text-slate-300 flex items-start gap-2 bg-emerald-500/5 p-2.5 rounded-lg border border-emerald-500/10">
                    <span className="text-emerald-400 font-bold">✓</span>
                    <span>{str}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Preparation Gaps */}
            <div className="space-y-3">
              <h5 className="text-xs font-bold text-red-400 uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" /> Critical Preparation Gaps
              </h5>
              <ul className="space-y-2">
                {report.weaknesses.map((weak, i) => (
                  <li key={i} className="text-xs text-slate-300 flex items-start gap-2 bg-red-500/5 p-2.5 rounded-lg border border-red-500/10">
                    <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                    <span>{weak}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Score Maximizing Action Steps */}
            <div className="space-y-3">
              <h5 className="text-xs font-bold text-blue-400 uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-blue-500" /> Priority High-Yield Actions
              </h5>
              <ul className="space-y-2">
                {report.suggestions.map((sug, i) => (
                  <li key={i} className="text-xs text-slate-300 flex items-start gap-2 bg-blue-500/5 p-2.5 rounded-lg border border-blue-500/10">
                    <ChevronRight className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                    <span>{sug}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Mock Test Input overlay drawer */}
      {showForm && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="w-full max-w-xl bg-[#0e0e12] border border-white/10 rounded-3xl p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto custom-scrollbar">
            <h3 className="text-lg font-bold text-white mb-1">Enter Mock Test Result</h3>
            <p className="text-xs text-slate-400 mb-5">Provide full breakdown of marks and incorrect answers to enable exact predictive rank recommendations.</p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[10px] text-purple-400 uppercase font-bold mb-1">Physics Marks</label>
                  <input
                    type="number"
                    max="180"
                    value={physicsMarks}
                    onChange={(e) => setPhysicsMarks(Number(e.target.value))}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-xs font-mono focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-[10px] text-amber-400 uppercase font-bold mb-1">Chemistry Marks</label>
                  <input
                    type="number"
                    max="180"
                    value={chemistryMarks}
                    onChange={(e) => setChemistryMarks(Number(e.target.value))}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-xs font-mono focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-[10px] text-emerald-400 uppercase font-bold mb-1">Biology Marks</label>
                  <input
                    type="number"
                    max="360"
                    value={biologyMarks}
                    onChange={(e) => setBiologyMarks(Number(e.target.value))}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-xs font-mono focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 bg-white/2 p-3 rounded-2xl border border-white/5">
                <div>
                  <label className="block text-[10px] text-emerald-400 font-bold mb-1">No. Correct</label>
                  <input
                    type="number"
                    value={correct}
                    onChange={(e) => setCorrect(Number(e.target.value))}
                    className="w-full bg-black/30 border border-white/10 rounded-lg py-1.5 px-2.5 text-xs text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[10px] text-red-400 font-bold mb-1">No. Wrong</label>
                  <input
                    type="number"
                    value={wrong}
                    onChange={(e) => setWrong(Number(e.target.value))}
                    className="w-full bg-black/30 border border-white/10 rounded-lg py-1.5 px-2.5 text-xs text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[10px] text-slate-400 font-bold mb-1">No. Skipped</label>
                  <input
                    type="number"
                    value={skipped}
                    onChange={(e) => setSkipped(Number(e.target.value))}
                    className="w-full bg-black/30 border border-white/10 rounded-lg py-1.5 px-2.5 text-xs text-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] text-slate-400 uppercase font-bold mb-1">Time Left in Exam (Mins)</label>
                  <input
                    type="number"
                    value={timeLeft}
                    onChange={(e) => setTimeLeft(Number(e.target.value))}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-xs font-mono"
                  />
                </div>
              </div>

              {/* Mistake reasons multi selection */}
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide mb-2">Core Mistake Reasons in Test</label>
                <div className="flex flex-wrap gap-2">
                  {mistakeReasonsOptions.map((reason) => {
                    const isSelected = selectedReasons.includes(reason);
                    return (
                      <button
                        key={reason}
                        type="button"
                        onClick={() => handleToggleReason(reason)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition ${
                          isSelected ? "bg-purple-500/20 text-purple-300 border-purple-500/40" : "bg-white/5 text-slate-400 border-white/5 hover:bg-white/10"
                        }`}
                      >
                        {reason}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Weak Chapters from Syllabus picker */}
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide mb-2">Pinpoint Weak Chapters from this test</label>
                <div className="h-28 overflow-y-auto custom-scrollbar border border-white/10 bg-black/30 rounded-xl p-2.5 space-y-1">
                  {chapters.map((chap) => {
                    const isSel = selectedWeakChapters.includes(chap.name);
                    return (
                      <button
                        key={chap.id}
                        type="button"
                        onClick={() => handleToggleChapter(chap.name)}
                        className={`w-full text-left px-2 py-1 text-xs rounded truncate flex justify-between ${
                          isSel ? "bg-purple-600/20 text-purple-300 border border-purple-500/30" : "text-slate-400 hover:bg-white/5"
                        }`}
                      >
                        <span>{chap.name}</span>
                        <span>{isSel ? "⚠️" : ""}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex gap-3 justify-end pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2 text-xs font-bold rounded-xl bg-white/5 text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold rounded-xl bg-purple-600 text-white"
                >
                  Save Mock Analysis
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
