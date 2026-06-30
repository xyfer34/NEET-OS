import React, { useState } from "react";
import { StudentProfile } from "../types";
import { NEET_SYLLABUS_TEMPLATE } from "../data";
import { Calendar, Award, BookOpen, Clock, Activity, CheckCircle, Flame } from "lucide-react";

interface SetupFlowProps {
  onComplete: (profile: StudentProfile, completedChapterIds: string[], weakChapterIds: string[], strongChapterIds: string[]) => void;
}

export default function SetupFlow({ onComplete }: SetupFlowProps) {
  const [step, setStep] = useState(1);
  const totalSteps = 4;

  // Form State
  const [examDate, setExamDate] = useState("2027-05-02"); // Next year's May
  const [targetScore, setTargetScore] = useState(680);
  const [currentMarks, setCurrentMarks] = useState(450);
  const [physicsMarks, setPhysicsMarks] = useState(110);
  const [chemistryMarks, setChemistryMarks] = useState(120);
  const [biologyMarks, setBiologyMarks] = useState(220);
  const [dailyStudyHours, setDailyStudyHours] = useState(8);
  const [schoolMode, setSchoolMode] = useState<"Dummy" | "Regular" | "Completed">("Dummy");
  const [coachingMode, setCoachingMode] = useState<"Self Study" | "Online Coaching" | "Offline Coaching">("Online Coaching");
  const [currentBacklog, setCurrentBacklog] = useState<"None" | "Mild (1-5 chapters)" | "Moderate (6-15 chapters)" | "Severe (15+ chapters)">("Mild (1-5 chapters)");
  const [mockTestsGiven, setMockTestsGiven] = useState(4);
  const [currentAccuracy, setCurrentAccuracy] = useState(78);
  const [preferredStudyTime, setPreferredStudyTime] = useState<"Morning" | "Afternoon" | "Late Night" | "Flexible">("Morning");
  const [wakeUpTime, setWakeUpTime] = useState("06:00");
  const [sleepTime, setSleepTime] = useState("23:00");

  // Chapter Selection States
  const [completedChapters, setCompletedChapters] = useState<string[]>(["phy-01", "chem-01", "bio-01"]);
  const [weakChapters, setWeakChapters] = useState<string[]>(["phy-03", "chem-04", "bio-03"]);
  const [strongChapters, setStrongChapters] = useState<string[]>(["phy-08", "chem-03", "bio-04"]);

  // Calculate Days Remaining
  const calculateDaysRemaining = (dateStr: string) => {
    const diff = new Date(dateStr).getTime() - new Date().getTime();
    return Math.max(1, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  };

  const handleNext = () => {
    if (step < totalSteps) {
      setStep(step + 1);
    } else {
      const days = calculateDaysRemaining(examDate);
      const profile: StudentProfile = {
        examDate,
        daysRemaining: days,
        currentMarks: Number(currentMarks),
        physicsMarks: Number(physicsMarks),
        chemistryMarks: Number(chemistryMarks),
        biologyMarks: Number(biologyMarks),
        targetScore: Number(targetScore),
        dailyStudyHours: Number(dailyStudyHours),
        schoolMode,
        coachingMode,
        currentBacklog,
        weakChapters: weakChapters.map(id => NEET_SYLLABUS_TEMPLATE.find(c => c.id === id)?.name || id),
        strongChapters: strongChapters.map(id => NEET_SYLLABUS_TEMPLATE.find(c => c.id === id)?.name || id),
        chaptersCompleted: completedChapters,
        mockTestsGiven: Number(mockTestsGiven),
        currentAccuracy: Number(currentAccuracy),
        preferredStudyTime,
        wakeUpTime,
        sleepTime,
        xp: 150, // Starting bonus
        level: 1,
        streak: 1,
        lastActiveDate: new Date().toISOString().split("T")[0],
      };
      onComplete(profile, completedChapters, weakChapters, strongChapters);
    }
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const toggleSelection = (id: string, list: string[], setList: React.Dispatch<React.SetStateAction<string[]>>) => {
    if (list.includes(id)) {
      setList(list.filter(item => item !== id));
    } else {
      setList([...list, id]);
    }
  };

  return (
    <div className="min-h-screen bg-[#050507] text-[#e4e4e7] flex items-center justify-center p-4 font-sans selection:bg-blue-600/30">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(37,99,235,0.08),transparent_40%)] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(168,85,247,0.06),transparent_40%)] pointer-events-none" />

      <div className="w-full max-w-2xl bg-[#09090b]/90 border border-white/10 rounded-2xl p-6 md:p-8 shadow-2xl relative overflow-hidden glass">
        {/* Progress Bar */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-white/5">
          <div
            className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-300 shadow-[0_0_8px_#3b82f6]"
            style={{ width: `${(step / totalSteps) * 100}%` }}
          />
        </div>

        {/* Header Logo */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center shadow-[0_0_15px_rgba(37,99,235,0.4)]">
            <span className="text-white font-bold text-lg font-display">N</span>
          </div>
          <div>
            <h1 className="text-lg font-bold font-display tracking-tight text-white">NEET <span className="text-blue-500">OS</span></h1>
            <p className="text-[10px] uppercase tracking-wider text-slate-500">Initialization Engine</p>
          </div>
        </div>

        {/* Step Contents */}
        {step === 1 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold font-display text-white mb-2 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-blue-400" /> Let's align your Target
              </h2>
              <p className="text-sm text-slate-400">Establish the exam date, target scores, and current marks to formulate high-impact recommendations.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1.5">Exam Date</label>
                <input
                  type="date"
                  value={examDate}
                  onChange={(e) => setExamDate(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-blue-500 transition font-mono text-sm"
                />
                <span className="text-[10px] text-blue-400 mt-1 block">({calculateDaysRemaining(examDate)} Days remaining)</span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1.5">Target Score (Out of 720)</label>
                <input
                  type="number"
                  min="300"
                  max="720"
                  value={targetScore}
                  onChange={(e) => setTargetScore(Math.min(720, Number(e.target.value)))}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-blue-500 transition font-mono text-sm"
                />
              </div>
            </div>

            <div className="bg-white/5 rounded-2xl p-4 border border-white/5 space-y-4">
              <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Current Score Diagnostic</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                <div className="md:col-span-1">
                  <label className="block text-[11px] text-slate-400 mb-1">Total Mock Marks</label>
                  <input
                    type="number"
                    value={currentMarks}
                    onChange={(e) => {
                      const total = Number(e.target.value);
                      setCurrentMarks(total);
                      // Auto distribute to fill Physics/Chem/Bio roughly
                      setPhysicsMarks(Math.round(total * 0.25));
                      setChemistryMarks(Math.round(total * 0.25));
                      setBiologyMarks(Math.round(total * 0.5));
                    }}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-2.5 py-1.5 text-white focus:outline-none focus:border-blue-500 text-sm font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-purple-400 mb-1">Physics (180)</label>
                  <input
                    type="number"
                    value={physicsMarks}
                    onChange={(e) => {
                      const p = Number(e.target.value);
                      setPhysicsMarks(p);
                      setCurrentMarks(p + chemistryMarks + biologyMarks);
                    }}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-2.5 py-1.5 text-white focus:outline-none focus:border-blue-500 text-sm font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-amber-400 mb-1">Chemistry (180)</label>
                  <input
                    type="number"
                    value={chemistryMarks}
                    onChange={(e) => {
                      const c = Number(e.target.value);
                      setChemistryMarks(c);
                      setCurrentMarks(physicsMarks + c + biologyMarks);
                    }}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-2.5 py-1.5 text-white focus:outline-none focus:border-blue-500 text-sm font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-emerald-400 mb-1">Biology (360)</label>
                  <input
                    type="number"
                    value={biologyMarks}
                    onChange={(e) => {
                      const b = Number(e.target.value);
                      setBiologyMarks(b);
                      setCurrentMarks(physicsMarks + chemistryMarks + b);
                    }}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-2.5 py-1.5 text-white focus:outline-none focus:border-blue-500 text-sm font-mono"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold font-display text-white mb-2 flex items-center gap-2">
                <Clock className="w-5 h-5 text-indigo-400" /> Daily Routine & Study Budget
              </h2>
              <p className="text-sm text-slate-400">Your routine determines the realistic load NEET OS will schedule for you.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1.5">Daily Dedicated Study Hours</label>
                <select
                  value={dailyStudyHours}
                  onChange={(e) => setDailyStudyHours(Number(e.target.value))}
                  className="w-full bg-[#121214] border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-indigo-500 text-sm"
                >
                  <option value="4">4 Hours (Light Revision)</option>
                  <option value="6">6 Hours (Moderate Prep)</option>
                  <option value="8">8 Hours (Standard Aspirant)</option>
                  <option value="10">10 Hours (Intensive Plan)</option>
                  <option value="12">12 Hours (Syllabus Sprint)</option>
                  <option value="14">14 Hours (Extreme AIR Focus)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1.5">Schooling Status</label>
                <div className="grid grid-cols-3 gap-2">
                  {(["Dummy", "Regular", "Completed"] as const).map((mode) => (
                    <button
                      key={mode}
                      type="button"
                      onClick={() => setSchoolMode(mode)}
                      className={`px-2 py-2 text-xs font-bold rounded-lg border transition ${
                        schoolMode === mode
                          ? "bg-indigo-600/20 text-indigo-300 border-indigo-500/50"
                          : "bg-white/5 text-slate-400 border-white/5 hover:bg-white/10"
                      }`}
                    >
                      {mode}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1.5">Coaching Infrastructure</label>
                <select
                  value={coachingMode}
                  onChange={(e) => setCoachingMode(e.target.value as any)}
                  className="w-full bg-[#121214] border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-indigo-500 text-sm"
                >
                  <option value="Self Study">Self Study (Completely Self Guided)</option>
                  <option value="Online Coaching">Online Coaching (PW, Unacademy, etc)</option>
                  <option value="Offline Coaching">Offline Coaching (Allen, Resonance, Aakash)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1.5">Active Backlogs Status</label>
                <select
                  value={currentBacklog}
                  onChange={(e) => setCurrentBacklog(e.target.value as any)}
                  className="w-full bg-[#121214] border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-indigo-500 text-sm"
                >
                  <option value="None">No Active Backlogs (Clean State)</option>
                  <option value="Mild (1-5 chapters)">Mild Backlog (1-5 chapters behind)</option>
                  <option value="Moderate (6-15 chapters)">Moderate Backlog (6-15 chapters)</option>
                  <option value="Severe (15+ chapters)">Severe Backlog (15+ chapters behind)</option>
                </select>
              </div>
            </div>

            <div className="bg-white/5 rounded-2xl p-4 border border-white/5 space-y-3">
              <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                <Flame className="w-4 h-4 text-orange-400 animate-pulse" /> Sleep & Active Time Preference
              </h3>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[10px] text-slate-400 uppercase mb-1">Wake up</label>
                  <input
                    type="time"
                    value={wakeUpTime}
                    onChange={(e) => setWakeUpTime(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-white focus:outline-none focus:border-indigo-500 text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-400 uppercase mb-1">Sleep time</label>
                  <input
                    type="time"
                    value={sleepTime}
                    onChange={(e) => setSleepTime(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-white focus:outline-none focus:border-indigo-500 text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-400 uppercase mb-1">Best Study</label>
                  <select
                    value={preferredStudyTime}
                    onChange={(e) => setPreferredStudyTime(e.target.value as any)}
                    className="w-full bg-[#121214] border border-white/10 rounded-lg px-2 py-1 text-white focus:outline-none focus:border-indigo-500 text-xs"
                  >
                    <option value="Morning">Morning</option>
                    <option value="Afternoon">Afternoon</option>
                    <option value="Late Night">Late Night</option>
                    <option value="Flexible">Flexible</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold font-display text-white mb-2 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-emerald-400" /> Syllabus Mapping & Completed Units
              </h2>
              <p className="text-sm text-slate-400">Select chapters that are completely read and require only practice or light revision.</p>
            </div>

            <div className="h-64 overflow-y-auto custom-scrollbar border border-white/10 rounded-xl p-3 bg-black/40 space-y-4">
              {(["Biology", "Physics", "Chemistry"] as const).map((subj) => (
                <div key={subj} className="space-y-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 sticky top-0 bg-[#0e0e11] py-1 px-2 rounded flex justify-between">
                    <span>{subj} Syllabus</span>
                    <span className="text-[10px] text-slate-500">
                      {completedChapters.filter(id => id.startsWith(subj.slice(0,3).toLowerCase())).length} Selected
                    </span>
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {NEET_SYLLABUS_TEMPLATE.filter(c => c.subject === subj).map((chap) => {
                      const isCompleted = completedChapters.includes(chap.id);
                      return (
                        <button
                          key={chap.id}
                          type="button"
                          onClick={() => toggleSelection(chap.id, completedChapters, setCompletedChapters)}
                          className={`text-left px-3 py-2 rounded-lg text-xs font-medium border flex items-center justify-between transition ${
                            isCompleted
                              ? "bg-emerald-500/10 text-emerald-300 border-emerald-500/40"
                              : "bg-white/5 text-slate-400 border-white/5 hover:bg-white/10"
                          }`}
                        >
                          <span className="truncate pr-2">{chap.name}</span>
                          {isCompleted ? (
                            <span className="text-emerald-400 font-bold shrink-0">✓</span>
                          ) : (
                            <span className="text-slate-600 shrink-0">+</span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold font-display text-white mb-2 flex items-center gap-2">
                <Activity className="w-5 h-5 text-amber-400" /> Strengths, Weaknesses & Accuracy
              </h2>
              <p className="text-sm text-slate-400">Pinpoint weak areas so the AI planner can immediately prioritize revising those sections.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1.5">No. of Mock Tests Given</label>
                <input
                  type="number"
                  value={mockTestsGiven}
                  onChange={(e) => setMockTestsGiven(Number(e.target.value))}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-amber-500 font-mono text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1.5">Current MCQ Accuracy (%)</label>
                <input
                  type="number"
                  min="30"
                  max="100"
                  value={currentAccuracy}
                  onChange={(e) => setCurrentAccuracy(Math.min(100, Number(e.target.value)))}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-amber-500 font-mono text-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-red-400 uppercase tracking-wide mb-1.5">Identify Weak Chapters</label>
                <div className="h-36 overflow-y-auto custom-scrollbar border border-white/5 bg-black/30 rounded-lg p-2 space-y-1">
                  {NEET_SYLLABUS_TEMPLATE.map((chap) => {
                    const isWeak = weakChapters.includes(chap.id);
                    return (
                      <button
                        key={chap.id}
                        type="button"
                        onClick={() => toggleSelection(chap.id, weakChapters, setWeakChapters)}
                        className={`w-full text-left px-2 py-1 rounded text-[11px] truncate flex justify-between ${
                          isWeak ? "bg-red-500/10 text-red-300 border border-red-500/30" : "text-slate-400 hover:bg-white/5"
                        }`}
                      >
                        <span>{chap.name}</span>
                        <span>{isWeak ? "⚠️" : ""}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-emerald-400 uppercase tracking-wide mb-1.5">Identify Strong Chapters</label>
                <div className="h-36 overflow-y-auto custom-scrollbar border border-white/5 bg-black/30 rounded-lg p-2 space-y-1">
                  {NEET_SYLLABUS_TEMPLATE.map((chap) => {
                    const isStrong = strongChapters.includes(chap.id);
                    return (
                      <button
                        key={chap.id}
                        type="button"
                        onClick={() => toggleSelection(chap.id, strongChapters, setStrongChapters)}
                        className={`w-full text-left px-2 py-1 rounded text-[11px] truncate flex justify-between ${
                          isStrong ? "bg-emerald-500/10 text-emerald-300 border border-emerald-500/30" : "text-slate-400 hover:bg-white/5"
                        }`}
                      >
                        <span>{chap.name}</span>
                        <span>{isStrong ? "💎" : ""}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Buttons footer */}
        <div className="flex justify-between items-center mt-8 pt-4 border-t border-white/10">
          <div>
            <span className="text-xs text-slate-500 font-mono">Step {step} of {totalSteps}</span>
          </div>

          <div className="flex gap-3">
            {step > 1 && (
              <button
                type="button"
                onClick={handleBack}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-white/5 hover:bg-white/10 text-white border border-white/10 transition"
              >
                Back
              </button>
            )}

            <button
              type="button"
              onClick={handleNext}
              className="px-6 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-[0_0_15px_rgba(37,99,235,0.4)] transition"
            >
              {step === totalSteps ? "Boot NEET OS" : "Continue"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
