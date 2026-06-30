import React, { useState } from "react";
import { MistakeItem, SubjectType, SyllabusChapter } from "../types";
import { AlertTriangle, Filter, Search, Plus, Trash2, Tag, BookOpen, BrainCircuit, Activity } from "lucide-react";

interface MistakeNotebookProps {
  chapters: SyllabusChapter[];
  mistakes: MistakeItem[];
  onAddMistake: (mistake: Omit<MistakeItem, "id" | "date" | "reviewCount">) => void;
  onDeleteMistake?: (id: string) => void;
}

export default function MistakeNotebook({ chapters, mistakes, onAddMistake, onDeleteMistake }: MistakeNotebookProps) {
  const [questionText, setQuestionText] = useState("");
  const [correctAnswer, setCorrectAnswer] = useState("");
  const [yourAnswer, setYourAnswer] = useState("");
  const [tag, setTag] = useState<MistakeItem["tag"]>("Concept Error");
  const [notes, setNotes] = useState("");
  const [subject, setSubject] = useState<SubjectType>("Biology");
  const [selectedChapterId, setSelectedChapterId] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterTag, setFilterTag] = useState<string>("all");

  const subjectChapters = chapters.filter(c => c.subject === subject);

  React.useEffect(() => {
    if (subjectChapters.length > 0) {
      setSelectedChapterId(subjectChapters[0].id);
    }
  }, [subject]);

  const tagOptions: MistakeItem["tag"][] = [
    "Concept Error",
    "Formula Error",
    "Calculation Error",
    "Guess",
    "Time Pressure",
    "Silly Mistake",
    "NCERT Fact",
    "Forgot Revision",
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!questionText || !selectedChapterId) return;

    const chap = chapters.find(c => c.id === selectedChapterId);
    const chapterName = chap ? chap.name : "General Topic";

    onAddMistake({
      subject,
      chapterId: selectedChapterId,
      chapterName,
      questionText,
      correctAnswer,
      yourAnswer,
      tag,
      notes,
    });

    setQuestionText("");
    setCorrectAnswer("");
    setYourAnswer("");
    setNotes("");
    setShowAddForm(false);
  };

  // Analyze repeating mistake patterns
  const getRepeatingPatternsAnalysis = () => {
    if (mistakes.length === 0) return null;

    const counts: Record<string, number> = {};
    mistakes.forEach(m => {
      counts[m.tag] = (counts[m.tag] || 0) + 1;
    });

    const sortedPatterns = Object.entries(counts).sort((a, b) => b[1] - a[1]);
    const topTag = sortedPatterns[0]?.[0];
    const topCount = sortedPatterns[0]?.[1];

    let advice = "";
    if (topTag === "Calculation Error") {
      advice = "Calculation errors represent your highest mistake density. You are rushing through physical math. Write out variable equations explicitly, and stop solving complex logs/exponents mentally.";
    } else if (topTag === "NCERT Fact") {
      advice = "NCERT Facts are slipping. NEET focuses heavily on direct lines from Biology and Chemistry textbook tables. Read the NCERT highlighted passages three times and practice flashcards.";
    } else if (topTag === "Formula Error") {
      advice = "Formula mismatch detected. Open the Formula revision book before every practice sprint. Work out derivations for core electrostatics and mechanics.";
    } else if (topTag === "Concept Error") {
      advice = "Underlying concepts are confused. Your current theory tracker is incomplete on these topics. Reset chapter progress to 'weak' and re-watch lectures or reread NCERT closely.";
    } else {
      advice = "Spaced revision is due. Keep logging mistakes regularly to narrow down recurring conceptual gaps.";
    }

    return { topTag, topCount, advice };
  };

  const analysis = getRepeatingPatternsAnalysis();

  const filteredMistakes = mistakes
    .filter(m => m.questionText.toLowerCase().includes(searchQuery.toLowerCase()) || m.chapterName.toLowerCase().includes(searchQuery.toLowerCase()))
    .filter(m => filterTag === "all" || m.tag === filterTag);

  return (
    <div className="space-y-6">
      
      {/* Dynamic Repeating Mistake Pattern Analyzer */}
      {analysis && (
        <div className="p-5 rounded-2xl bg-red-500/5 border border-red-500/15 glass flex flex-col md:flex-row items-start gap-4">
          <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center shrink-0 text-red-400">
            <BrainCircuit className="w-5 h-5 animate-pulse" />
          </div>

          <div>
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              AI Pattern Alert: Repeating <span className="text-red-400 font-extrabold underline">{analysis.topTag}s</span> Detected!
            </h4>
            <p className="text-xs text-slate-300 mt-1 leading-relaxed">{analysis.advice}</p>
            <div className="mt-3.5 flex items-center gap-4 text-[10px] text-slate-400 font-mono">
              <span>Total mistakes cataloged: <strong>{mistakes.length}</strong></span>
              <span>Pattern intensity: <strong>{analysis.topCount} identical tag logs</strong></span>
            </div>
          </div>
        </div>
      )}

      {/* List controls */}
      <div className="flex flex-col md:flex-row gap-3 justify-between items-stretch md:items-center">
        <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-3 py-2 flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-500 shrink-0" />
          <input
            type="text"
            placeholder="Search mistakes by keywords or chapters..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent text-xs text-white focus:outline-none w-full"
          />
        </div>

        <div className="flex gap-2">
          <select
            value={filterTag}
            onChange={(e) => setFilterTag(e.target.value)}
            className="bg-[#0f0f12] text-xs text-slate-300 border border-white/10 rounded-xl px-3 py-2 focus:outline-none focus:border-blue-500"
          >
            <option value="all">All Mistake Types</option>
            {tagOptions.map(t => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>

          <button
            onClick={() => setShowAddForm(true)}
            className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold px-4 py-2 rounded-xl transition flex items-center gap-1.5 shrink-0"
          >
            <Plus className="w-4 h-4" /> Log New Mistake
          </button>
        </div>
      </div>

      {/* Main mistakes layout */}
      {filteredMistakes.length === 0 ? (
        <div className="p-12 text-center border border-dashed border-white/10 rounded-2xl">
          <BookOpen className="w-8 h-8 text-slate-600 mx-auto mb-2" />
          <p className="text-sm text-slate-400">Your mistake notebook is currently pristine. Good job!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredMistakes.map((m) => {
            let tagColor = "bg-slate-500/10 text-slate-400";
            if (m.tag === "Concept Error") tagColor = "bg-red-500/10 text-red-400 border border-red-500/20";
            if (m.tag === "Formula Error") tagColor = "bg-amber-500/10 text-amber-400 border border-amber-500/20";
            if (m.tag === "Calculation Error") tagColor = "bg-orange-500/10 text-orange-400 border border-orange-500/20";
            if (m.tag === "NCERT Fact") tagColor = "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20";
            if (m.tag === "Silly Mistake") tagColor = "bg-purple-500/10 text-purple-400 border border-purple-500/20";

            return (
              <div key={m.id} className="p-5 rounded-2xl bg-white/2 border border-white/5 hover:border-white/10 transition flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between items-start gap-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase ${
                        m.subject === "Biology" ? "bg-emerald-500/10 text-emerald-400" : m.subject === "Physics" ? "bg-purple-500/10 text-purple-400" : "bg-amber-500/10 text-amber-400"
                      }`}>
                        {m.subject}
                      </span>
                      <span className="text-[10px] text-slate-400 font-bold truncate max-w-[150px]" title={m.chapterName}>
                        {m.chapterName}
                      </span>
                    </div>

                    <span className={`px-2 py-0.5 rounded text-[9px] font-bold flex items-center gap-1 ${tagColor}`}>
                      <Tag className="w-2.5 h-2.5" /> {m.tag}
                    </span>
                  </div>

                  <div className="p-3 bg-black/40 rounded-xl border border-white/5 space-y-2">
                    <p className="text-xs text-white font-medium leading-relaxed italic">" {m.questionText} "</p>
                    
                    <div className="grid grid-cols-2 gap-2 text-[10px] border-t border-white/5 pt-2">
                      <div>
                        <span className="text-red-400 block font-semibold">Your choice:</span>
                        <span className="font-mono text-slate-300">{m.yourAnswer || "N/A"}</span>
                      </div>
                      <div>
                        <span className="text-emerald-400 block font-semibold">Correct Answer:</span>
                        <span className="font-mono text-white font-bold">{m.correctAnswer || "N/A"}</span>
                      </div>
                    </div>
                  </div>

                  {m.notes && (
                    <div className="p-2.5 bg-blue-500/5 rounded-xl border border-blue-500/10 text-[11px] text-slate-300">
                      <strong className="text-blue-400">Remedial Action Note:</strong> {m.notes}
                    </div>
                  )}
                </div>

                <div className="flex justify-between items-center text-[10px] text-slate-500 border-t border-white/5 pt-2">
                  <span>Logged: {m.date}</span>
                  {onDeleteMistake && (
                    <button
                      onClick={() => onDeleteMistake(m.id)}
                      className="text-red-400 hover:text-red-300 transition flex items-center gap-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Remove
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add mistake form drawer overlay */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="w-full max-w-lg bg-[#0e0e12] border border-white/10 rounded-3xl p-6 shadow-2xl relative">
            <h3 className="text-lg font-bold text-white mb-1">Add Question to Mistake Notebook</h3>
            <p className="text-xs text-slate-400 mb-5">Analyze your errors carefully. Classifying mistakes prevents repeating them.</p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wide mb-1">Subject</label>
                  <select
                    value={subject}
                    onChange={(e) => setSubject(e.target.value as SubjectType)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500 text-xs"
                  >
                    <option value="Biology">Biology</option>
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

              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wide mb-1">Question / Concept Description</label>
                <textarea
                  value={questionText}
                  onChange={(e) => setQuestionText(e.target.value)}
                  placeholder="e.g. Which hormone triggers ovulation? Or describe the exact question text..."
                  rows={2}
                  required
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wide mb-1">Your Incorrect Choice</label>
                  <input
                    type="text"
                    value={yourAnswer}
                    onChange={(e) => setYourAnswer(e.target.value)}
                    placeholder="e.g. Progesterone / Option B"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wide mb-1">Correct Answer Key</label>
                  <input
                    type="text"
                    value={correctAnswer}
                    onChange={(e) => setCorrectAnswer(e.target.value)}
                    placeholder="e.g. LH (Luteinizing Hormone) / Option D"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wide mb-1">Mistake Reason Tag</label>
                  <select
                    value={tag}
                    onChange={(e) => setTag(e.target.value as any)}
                    className="w-full bg-[#121215] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                  >
                    {tagOptions.map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wide mb-1">Remedial Notes / Key Concept to Remember</label>
                  <input
                    type="text"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="e.g. LH surge happens on 14th day of menstrual cycle due to positive feedback."
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>
              </div>

              <div className="flex gap-3 justify-end pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-4 py-2 text-xs font-semibold bg-white/5 text-white rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold bg-blue-600 text-white rounded-xl"
                >
                  Save Mistake
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
