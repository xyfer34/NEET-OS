import React, { useState } from "react";
import { SyllabusChapter, SubjectType } from "../types";
import { BookOpen, Check, Award, AlertCircle, Plus, Minus, Search, Grid, Eye } from "lucide-react";

interface SyllabusTrackerProps {
  syllabus: SyllabusChapter[];
  onUpdateChapter: (chapter: SyllabusChapter) => void;
}

export default function SyllabusTracker({ syllabus, onUpdateChapter }: SyllabusTrackerProps) {
  const [activeTab, setActiveTab] = useState<SubjectType>("Biology");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterMastery, setFilterMastery] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");

  // Subject Stats
  const getSubjectStats = (subj: SubjectType) => {
    const chapters = syllabus.filter(c => c.subject === subj);
    const total = chapters.length;
    const completed = chapters.filter(c => c.theoryDone && c.ncertReadCount > 0 && c.questionPracticeCount > 0).length;
    const avgNCERTReads = chapters.reduce((acc, c) => acc + c.ncertReadCount, 0) / (total || 1);
    const mastered = chapters.filter(c => c.masteryStatus === "mastered").length;
    const percentage = Math.round((completed / (total || 1)) * 100);

    return { total, completed, avgNCERTReads: avgNCERTReads.toFixed(1), mastered, percentage };
  };

  const bioStats = getSubjectStats("Biology");
  const phyStats = getSubjectStats("Physics");
  const chemStats = getSubjectStats("Chemistry");

  // Handle updates to chapter elements
  const toggleTheory = (chap: SyllabusChapter) => {
    const updated = { ...chap, theoryDone: !chap.theoryDone };
    recalculateMastery(updated);
  };

  const incrementNCERT = (chap: SyllabusChapter) => {
    const updated = { ...chap, ncertReadCount: Math.min(3, chap.ncertReadCount + 1), highlighted: true };
    recalculateMastery(updated);
  };

  const decrementNCERT = (chap: SyllabusChapter) => {
    const updated = { ...chap, ncertReadCount: Math.max(0, chap.ncertReadCount - 1) };
    if (updated.ncertReadCount === 0) updated.highlighted = false;
    recalculateMastery(updated);
  };

  const toggleNotes = (chap: SyllabusChapter) => {
    const updated = { ...chap, notesReviewed: !chap.notesReviewed };
    recalculateMastery(updated);
  };

  const toggleFormulas = (chap: SyllabusChapter) => {
    const updated = { ...chap, formulaRevised: !chap.formulaRevised };
    recalculateMastery(updated);
  };

  const adjustQuestions = (chap: SyllabusChapter, amount: number) => {
    const updated = { ...chap, questionPracticeCount: Math.max(0, chap.questionPracticeCount + amount) };
    recalculateMastery(updated);
  };

  const togglePYQs = (chap: SyllabusChapter) => {
    const updated = { ...chap, pyqsDone: !chap.pyqsDone };
    recalculateMastery(updated);
  };

  const toggleMock = (chap: SyllabusChapter) => {
    const updated = { ...chap, mockTested: !chap.mockTested };
    recalculateMastery(updated);
  };

  const recalculateMastery = (chap: SyllabusChapter) => {
    // Logic for setting mastery status automatically based on student inputs:
    // - Mastered (Green): Theory + At least 1 NCERT Read + PYQs + >40 Questions + Mock Tested
    // - Revision Due (Yellow): Theory + Notes + Formulas done but questions are low, or scheduled revision
    // - Weak (Red): Question count < 10 or manually set to weak (Theory may be done but zero practice)
    // - Not Started (Gray): Theory false and NCERT read 0
    let status: SyllabusChapter["masteryStatus"] = "not_started";

    if (!chap.theoryDone && chap.ncertReadCount === 0 && chap.questionPracticeCount === 0) {
      status = "not_started";
    } else if (chap.theoryDone && chap.ncertReadCount >= 1 && chap.pyqsDone && chap.questionPracticeCount >= 40 && chap.mockTested) {
      status = "mastered";
    } else if (chap.questionPracticeCount < 15 && chap.theoryDone) {
      status = "weak";
    } else {
      status = "revision_due";
    }

    onUpdateChapter({ ...chap, masteryStatus: status });
  };

  // Filtered Chapters
  const filteredChapters = syllabus
    .filter(c => c.subject === activeTab)
    .filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase()))
    .filter(c => {
      if (filterMastery === "all") return true;
      return c.masteryStatus === filterMastery;
    });

  return (
    <div className="space-y-6">
      {/* Subject Metric Switcher */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {([
          { subj: "Biology", stats: bioStats, color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20" },
          { subj: "Physics", stats: phyStats, color: "text-purple-400", bg: "bg-purple-500/10", border: "border-purple-500/20" },
          { subj: "Chemistry", stats: chemStats, color: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/20" },
        ] as const).map(({ subj, stats, color, bg, border }) => (
          <button
            key={subj}
            onClick={() => setActiveTab(subj)}
            className={`p-4 rounded-2xl border text-left transition relative overflow-hidden ${
              activeTab === subj ? `bg-white/5 ${border} ring-1 ring-blue-500/50` : "bg-white/2 hover:bg-white/5 border-white/10"
            }`}
          >
            <div className="flex justify-between items-start mb-2">
              <span className={`text-xs uppercase tracking-wider font-bold ${color}`}>{subj}</span>
              <span className="text-xl font-black">{stats.percentage}%</span>
            </div>
            
            <div className="h-1.5 bg-white/5 rounded-full overflow-hidden mb-3">
              <div
                className={`h-full rounded-full ${
                  subj === "Biology" ? "bg-emerald-500" : subj === "Physics" ? "bg-purple-500" : "bg-amber-500"
                }`}
                style={{ width: `${stats.percentage}%` }}
              />
            </div>

            <div className="flex gap-4 text-[10px] text-slate-400">
              <span>Completed: <strong>{stats.completed}/{stats.total}</strong></span>
              <span>Mastered: <strong className={color}>{stats.mastered}</strong></span>
              <span>NCERT Reads: <strong>{stats.avgNCERTReads}x</strong></span>
            </div>
          </button>
        ))}
      </div>

      {/* Interactive Knowledge Map Graph */}
      <div className="p-5 rounded-2xl bg-white/5 border border-white/10 glass">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 mb-4">
          <div>
            <h3 className="font-bold text-white flex items-center gap-2">
              <Grid className="w-4 h-4 text-blue-400" /> Interactive Knowledge Map
            </h3>
            <p className="text-xs text-slate-400">Visual mapping of the entire syllabus. Watch your grid turn green as you reach maximum score readiness.</p>
          </div>
          
          <div className="flex flex-wrap gap-3 text-[10px] bg-black/40 px-3 py-1.5 rounded-lg border border-white/5">
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-emerald-500 inline-block" /> Mastered</span>
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-amber-500 inline-block" /> Needs Revision</span>
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-red-500/70 inline-block animate-pulse" /> Weak Areas</span>
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-slate-700 inline-block" /> Not Started</span>
          </div>
        </div>

        {/* Global syllabus pixel map */}
        <div className="grid grid-cols-6 sm:grid-cols-12 md:grid-cols-18 gap-2 p-3 bg-black/20 rounded-xl border border-white/5">
          {syllabus.map((c) => {
            let color = "bg-slate-800 text-slate-500";
            if (c.masteryStatus === "mastered") color = "bg-emerald-500 text-white shadow-[0_0_8px_rgba(16,185,129,0.3)]";
            if (c.masteryStatus === "revision_due") color = "bg-amber-500 text-black";
            if (c.masteryStatus === "weak") color = "bg-red-500/80 text-white animate-pulse";

            const initials = c.subject[0] + (c.name.match(/\b(\w)/g)?.slice(0, 2).join("") || "");

            return (
              <div
                key={c.id}
                className={`aspect-square rounded-lg flex flex-col items-center justify-center p-1 text-[10px] font-bold transition-all hover:scale-105 cursor-pointer relative group ${color}`}
                onClick={() => {
                  setActiveTab(c.subject);
                  setSearchQuery(c.name);
                }}
              >
                <span>{initials}</span>
                
                {/* Tooltip */}
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-48 bg-[#09090b] border border-white/10 text-white p-2 rounded-lg text-[10px] font-normal leading-relaxed opacity-0 pointer-events-none group-hover:opacity-100 transition z-50 shadow-xl">
                  <p className="font-bold text-slate-300 mb-0.5">{c.subject} - {c.name}</p>
                  <p className="text-slate-400 capitalize">Mastery: <span className="font-semibold text-white">{c.masteryStatus.replace("_", " ")}</span></p>
                  <p className="text-slate-400">NCERT: {c.ncertReadCount}x | Practice: {c.questionPracticeCount} MCQs</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Syllabus Table Filters */}
      <div className="flex flex-col md:flex-row gap-3 justify-between items-stretch md:items-center">
        <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-3 py-1.5 flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-500 shrink-0" />
          <input
            type="text"
            placeholder={`Search ${activeTab} chapters...`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent text-xs text-white focus:outline-none w-full"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery("")} className="text-xs text-slate-400 hover:text-white">Clear</button>
          )}
        </div>

        <div className="flex gap-2 items-center">
          <select
            value={filterMastery}
            onChange={(e) => setFilterMastery(e.target.value)}
            className="bg-[#0f0f12] text-xs text-slate-300 border border-white/10 rounded-xl px-3 py-2 focus:outline-none focus:border-blue-500"
          >
            <option value="all">All Mastery Levels</option>
            <option value="mastered">Mastered (Green)</option>
            <option value="revision_due">Revision Due (Yellow)</option>
            <option value="weak">Weak Areas (Red)</option>
            <option value="not_started">Not Started (Gray)</option>
          </select>

          <div className="flex rounded-xl bg-white/5 border border-white/10 p-0.5">
            <button
              onClick={() => setViewMode("list")}
              className={`p-1.5 rounded-lg transition ${viewMode === "list" ? "bg-white/10 text-white" : "text-slate-500 hover:text-slate-300"}`}
            >
              <Eye className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setViewMode("grid")}
              className={`p-1.5 rounded-lg transition ${viewMode === "grid" ? "bg-white/10 text-white" : "text-slate-500 hover:text-slate-300"}`}
            >
              <Grid className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Chapters Render */}
      {filteredChapters.length === 0 ? (
        <div className="p-12 text-center border border-dashed border-white/10 rounded-2xl">
          <BookOpen className="w-8 h-8 text-slate-600 mx-auto mb-2" />
          <p className="text-sm text-slate-400 font-medium">No chapters match your search filter.</p>
          <button onClick={() => { setSearchQuery(""); setFilterMastery("all"); }} className="text-xs text-blue-400 mt-2 hover:underline">Reset Filters</button>
        </div>
      ) : viewMode === "list" ? (
        <div className="space-y-4">
          {filteredChapters.map((chap) => {
            // Calculate indicators
            let cardBorder = "border-white/5";
            let statusBadge = "bg-slate-500/10 text-slate-400";
            
            if (chap.masteryStatus === "mastered") {
              cardBorder = "border-emerald-500/30";
              statusBadge = "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20";
            } else if (chap.masteryStatus === "revision_due") {
              cardBorder = "border-amber-500/30";
              statusBadge = "bg-amber-500/10 text-amber-400 border border-amber-500/20";
            } else if (chap.masteryStatus === "weak") {
              cardBorder = "border-red-500/30 animate-pulse";
              statusBadge = "bg-red-500/10 text-red-400 border border-red-500/20";
            }

            return (
              <div
                key={chap.id}
                className={`p-4 md:p-5 rounded-2xl bg-white/2 border ${cardBorder} flex flex-col md:flex-row justify-between items-start md:items-center gap-4 transition hover:bg-white/5`}
              >
                <div className="space-y-1.5 max-w-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono text-slate-500">Class {chap.classGrade}</span>
                    <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-tight ${statusBadge}`}>
                      {chap.masteryStatus.replace("_", " ")}
                    </span>
                  </div>
                  <h4 className="font-bold text-white text-sm md:text-base">{chap.name}</h4>
                  <div className="flex flex-wrap gap-2 text-[10px] text-slate-400">
                    <span className="flex items-center gap-1">
                      <span className={`w-1.5 h-1.5 rounded-full ${chap.theoryDone ? "bg-emerald-400" : "bg-slate-600"}`} /> Theory
                    </span>
                    <span className="flex items-center gap-1">
                      <span className={`w-1.5 h-1.5 rounded-full ${chap.ncertReadCount >= 1 ? "bg-emerald-400" : "bg-slate-600"}`} /> NCERT ({chap.ncertReadCount}x)
                    </span>
                    <span className="flex items-center gap-1">
                      <span className={`w-1.5 h-1.5 rounded-full ${chap.notesReviewed ? "bg-emerald-400" : "bg-slate-600"}`} /> Notes
                    </span>
                    <span className="flex items-center gap-1">
                      <span className={`w-1.5 h-1.5 rounded-full ${chap.formulaRevised ? "bg-emerald-400" : "bg-slate-600"}`} /> Formulas
                    </span>
                    <span className="flex items-center gap-1">
                      <span className={`w-1.5 h-1.5 rounded-full ${chap.pyqsDone ? "bg-emerald-400" : "bg-slate-600"}`} /> PYQs
                    </span>
                  </div>
                </div>

                {/* Sub-trackers detailed action panel */}
                <div className="flex flex-wrap items-center gap-2.5 bg-black/30 p-2.5 rounded-xl border border-white/5 w-full md:w-auto justify-between md:justify-start">
                  
                  {/* Theory Toggle */}
                  <button
                    onClick={() => toggleTheory(chap)}
                    className={`px-2.5 py-1.5 rounded-lg text-[11px] font-bold flex items-center gap-1 transition ${
                      chap.theoryDone ? "bg-emerald-500/20 text-emerald-400" : "bg-white/5 text-slate-400 hover:bg-white/10"
                    }`}
                  >
                    Theory {chap.theoryDone && <Check className="w-3 h-3" />}
                  </button>

                  {/* NCERT reads count control */}
                  <div className="flex items-center gap-1.5 bg-white/5 px-2 py-1 rounded-lg">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter mr-1">NCERT</span>
                    <button
                      onClick={() => decrementNCERT(chap)}
                      className="p-0.5 rounded text-slate-400 hover:bg-white/10"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="text-xs font-mono font-bold text-emerald-400 w-3 text-center">{chap.ncertReadCount}</span>
                    <button
                      onClick={() => incrementNCERT(chap)}
                      className="p-0.5 rounded text-slate-400 hover:bg-white/10"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>

                  {/* Notes & Formula check */}
                  <div className="flex gap-1">
                    <button
                      onClick={() => toggleNotes(chap)}
                      className={`p-1.5 rounded-lg text-xs transition ${chap.notesReviewed ? "bg-blue-500/20 text-blue-400" : "bg-white/5 text-slate-400"}`}
                      title="Notes Reviewed"
                    >
                      📓
                    </button>
                    <button
                      onClick={() => toggleFormulas(chap)}
                      className={`p-1.5 rounded-lg text-xs transition ${chap.formulaRevised ? "bg-amber-500/20 text-amber-400" : "bg-white/5 text-slate-400"}`}
                      title="Formula Sheet Reviewed"
                    >
                      📐
                    </button>
                  </div>

                  {/* Question Practice Count */}
                  <div className="flex items-center gap-1 bg-white/5 px-2 py-1 rounded-lg">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter mr-1">Ques</span>
                    <button
                      onClick={() => adjustQuestions(chap, -10)}
                      className="p-0.5 rounded text-slate-400 hover:bg-white/10"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="text-xs font-mono font-bold text-white px-1">{chap.questionPracticeCount}</span>
                    <button
                      onClick={() => adjustQuestions(chap, 10)}
                      className="p-0.5 rounded text-slate-400 hover:bg-white/10"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>

                  {/* PYQs and Mock Test Checks */}
                  <div className="flex gap-1">
                    <button
                      onClick={() => togglePYQs(chap)}
                      className={`px-2 py-1 rounded-lg text-[10px] font-bold transition ${
                        chap.pyqsDone ? "bg-purple-500/20 text-purple-400" : "bg-white/5 text-slate-500"
                      }`}
                    >
                      PYQ
                    </button>
                    <button
                      onClick={() => toggleMock(chap)}
                      className={`px-2 py-1 rounded-lg text-[10px] font-bold transition ${
                        chap.mockTested ? "bg-indigo-500/20 text-indigo-400" : "bg-white/5 text-slate-500"
                      }`}
                    >
                      Mock
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredChapters.map((chap) => {
            let borderCls = "border-white/5";
            let dotCls = "bg-slate-600";
            if (chap.masteryStatus === "mastered") { borderCls = "border-emerald-500/30"; dotCls = "bg-emerald-500"; }
            else if (chap.masteryStatus === "revision_due") { borderCls = "border-amber-500/30"; dotCls = "bg-amber-500"; }
            else if (chap.masteryStatus === "weak") { borderCls = "border-red-500/30 animate-pulse"; dotCls = "bg-red-500"; }

            return (
              <div key={chap.id} className={`p-4 rounded-xl bg-white/2 border ${borderCls} flex flex-col justify-between space-y-3`}>
                <div>
                  <div className="flex justify-between items-start mb-1">
                    <span className="text-[9px] font-mono text-slate-500">Class {chap.classGrade}</span>
                    <span className="flex items-center gap-1 text-[9px] font-bold text-slate-300">
                      <span className={`w-2 h-2 rounded-full ${dotCls}`} /> {chap.masteryStatus.replace("_", " ")}
                    </span>
                  </div>
                  <h5 className="font-bold text-white text-xs leading-tight h-8 overflow-hidden">{chap.name}</h5>
                </div>

                <div className="grid grid-cols-2 gap-1.5 text-[10px] bg-black/20 p-2 rounded-lg border border-white/5">
                  <button onClick={() => toggleTheory(chap)} className="text-left py-0.5 hover:text-white flex items-center gap-1 text-slate-400">
                    Theory: <span className={chap.theoryDone ? "text-emerald-400" : "text-slate-600"}>{chap.theoryDone ? "Yes" : "No"}</span>
                  </button>
                  <button onClick={() => incrementNCERT(chap)} className="text-left py-0.5 hover:text-white flex items-center gap-1 text-slate-400">
                    NCERT: <span className="text-emerald-400 font-mono">{chap.ncertReadCount}x</span>
                  </button>
                  <button onClick={() => toggleNotes(chap)} className="text-left py-0.5 hover:text-white flex items-center gap-1 text-slate-400">
                    Notes: <span className={chap.notesReviewed ? "text-blue-400" : "text-slate-600"}>{chap.notesReviewed ? "Yes" : "No"}</span>
                  </button>
                  <button onClick={() => adjustQuestions(chap, 20)} className="text-left py-0.5 hover:text-white flex items-center gap-1 text-slate-400">
                    Practice: <span className="text-white font-mono">{chap.questionPracticeCount}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
