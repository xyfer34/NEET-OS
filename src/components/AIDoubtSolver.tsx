import React, { useState } from "react";
import { BookOpen, Camera, Sparkles, Send, Trash2, ArrowRight, Loader2, AlertCircle } from "lucide-react";
import { SyllabusChapter, SubjectType } from "../types";

interface AIDoubtSolverProps {
  chapters: SyllabusChapter[];
}

export default function AIDoubtSolver({ chapters }: AIDoubtSolverProps) {
  const [question, setQuestion] = useState("");
  const [image, setImage] = useState<string | null>(null);
  const [subject, setSubject] = useState<SubjectType>("Biology");
  const [selectedChapterId, setSelectedChapterId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [response, setResponse] = useState<string | null>(null);

  const subjectChapters = chapters.filter(c => c.subject === subject);

  React.useEffect(() => {
    if (subjectChapters.length > 0) {
      setSelectedChapterId(subjectChapters[0].id);
    }
  }, [subject]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleClearImage = () => {
    setImage(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question && !image) {
      setError("Please write a doubt or upload an image of the question.");
      return;
    }

    setLoading(true);
    setError(null);
    setResponse(null);

    const activeChap = chapters.find(c => c.id === selectedChapterId)?.name || "";

    try {
      const res = await fetch("/api/doubt", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          question,
          image,
          subject,
          chapter: activeChap,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to resolve your doubt via AI.");
      }

      setResponse(data.response);
    } catch (err: any) {
      console.error(err);
      setError(err?.message || "An error occurred. Check your server API key config.");
    } finally {
      setLoading(false);
    }
  };

  // Pre-configured typical quick doubts for NEET aspirants
  const quickDoubs = [
    { text: "Explain difference between Pteridophytes and Gymnosperms", sub: "Biology" },
    { text: "Derive EMF of self inductance formula", sub: "Physics" },
    { text: "What is Cannizzaro reaction mechanism?", sub: "Chemistry" },
  ];

  // Helper to parse double asterisks and hash headers into basic HTML elements
  const renderFormattedResponse = (text: string) => {
    if (!text) return null;
    const lines = text.split("\n");
    return (
      <div className="space-y-3 text-xs md:text-sm text-slate-300 leading-relaxed font-sans">
        {lines.map((line, index) => {
          let cleanedLine = line.trim();
          if (!cleanedLine) return <div key={index} className="h-2" />;

          // Headers
          if (cleanedLine.startsWith("###")) {
            return (
              <h5 key={index} className="text-sm font-black text-blue-400 uppercase tracking-wider mt-4">
                {cleanedLine.replace("###", "").trim()}
              </h5>
            );
          }
          if (cleanedLine.startsWith("##") || cleanedLine.startsWith("#")) {
            return (
              <h4 key={index} className="text-base font-bold text-white border-b border-white/5 pb-1 mt-6">
                {cleanedLine.replace(/^#+/, "").trim()}
              </h4>
            );
          }

          // Bullet lists
          if (cleanedLine.startsWith("*") || cleanedLine.startsWith("-")) {
            const listText = cleanedLine.slice(1).trim();
            return (
              <ul key={index} className="list-disc pl-5 space-y-1 my-1">
                <li>{parseBoldText(listText)}</li>
              </ul>
            );
          }

          // Numbered lists
          const numMatch = cleanedLine.match(/^(\d+)\.\s(.*)/);
          if (numMatch) {
            return (
              <ol key={index} className="list-decimal pl-5 space-y-1 my-1">
                <li>{parseBoldText(numMatch[2])}</li>
              </ol>
            );
          }

          return <p key={index}>{parseBoldText(cleanedLine)}</p>;
        })}
      </div>
    );
  };

  const parseBoldText = (text: string) => {
    const parts = text.split(/\*\*(.*?)\*\*/g);
    return parts.map((part, i) => {
      if (i % 2 === 1) {
        return <strong key={i} className="text-white font-extrabold">{part}</strong>;
      }
      return part;
    });
  };

  return (
    <div className="space-y-6">
      <div className="p-5 rounded-2xl bg-gradient-to-br from-indigo-900/20 to-blue-900/10 border border-blue-500/20 glass">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-yellow-400" /> AI Doubt Solver (NCERT-Anchored)
        </h3>
        <p className="text-xs text-slate-300 mt-1">
          Upload an image of your question sheet or type a concepts doubt. The NEET OS mentor analyzes questions strictly referencing the latest NCERT syllabi guidelines.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Ask Question Input panel */}
        <div className="lg:col-span-1 p-5 rounded-2xl bg-white/5 border border-white/10 glass">
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Input Area</h4>

          <form onSubmit={handleSubmit} className="space-y-4">
            
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Subject</label>
                <select
                  value={subject}
                  onChange={(e) => setSubject(e.target.value as SubjectType)}
                  className="w-full bg-[#121215] border border-white/10 rounded-lg p-2 text-xs text-white focus:outline-none"
                >
                  <option value="Biology">Biology</option>
                  <option value="Physics">Physics</option>
                  <option value="Chemistry">Chemistry</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Chapter</label>
                <select
                  value={selectedChapterId}
                  onChange={(e) => setSelectedChapterId(e.target.value)}
                  className="w-full bg-[#121215] border border-white/10 rounded-lg p-2 text-xs text-white focus:outline-none"
                >
                  {subjectChapters.map((chap) => (
                    <option key={chap.id} value={chap.id}>{chap.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Write your Doubt</label>
              <textarea
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="Ask e.g. Why is the boiling point of water higher than hydrogen sulfide? Or snap an image of a hard equation..."
                rows={4}
                className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* Image upload area */}
            <div>
              <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1.5">Add Attachment (MCQ Diagram / Sheet)</label>
              
              {!image ? (
                <div className="border border-dashed border-white/10 rounded-xl p-4 text-center hover:bg-white/2 transition relative">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                  />
                  <Camera className="w-6 h-6 text-slate-500 mx-auto mb-1.5" />
                  <p className="text-[10px] text-slate-400 font-bold">Upload image / snap photo</p>
                  <p className="text-[9px] text-slate-600">JPEG, PNG supported (Max 5MB)</p>
                </div>
              ) : (
                <div className="relative rounded-xl overflow-hidden border border-white/10 max-h-36">
                  <img src={image} alt="Doubt Upload" className="w-full object-contain max-h-32 bg-black" />
                  <button
                    type="button"
                    onClick={handleClearImage}
                    className="absolute top-2 right-2 bg-red-600/90 text-white p-1 rounded-full hover:bg-red-500 transition shadow"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 text-white text-xs font-bold py-2.5 px-4 rounded-xl transition flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(37,99,235,0.4)]"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Solving Doubt...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" /> Ask AI Mentor
                </>
              )}
            </button>
          </form>

          {/* Quick Pre-selections */}
          <div className="mt-5 pt-4 border-t border-white/5 space-y-2">
            <span className="text-[9px] uppercase font-bold text-slate-500 tracking-wider">Example queries</span>
            <div className="space-y-1.5">
              {quickDoubs.map((q, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setQuestion(q.text);
                    setSubject(q.sub as SubjectType);
                  }}
                  className="w-full text-left bg-white/2 hover:bg-white/5 p-2 rounded-lg text-[10px] text-slate-400 border border-white/3 flex justify-between items-center transition"
                >
                  <span className="truncate pr-3">"{q.text}"</span>
                  <ArrowRight className="w-3 h-3 text-slate-600" />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Doubt Answer Render area */}
        <div className="lg:col-span-2 p-5 rounded-2xl bg-[#08080b] border border-white/10 flex flex-col justify-between min-h-[400px]">
          <div>
            <div className="flex justify-between items-center border-b border-white/10 pb-3 mb-4">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-emerald-400" /> Resolved Explanation
              </h4>
              <span className="text-[10px] font-mono text-slate-500">NEET UG Specialist Agent</span>
            </div>

            {loading && (
              <div className="py-24 text-center space-y-3">
                <Loader2 className="w-8 h-8 animate-spin text-blue-500 mx-auto" />
                <p className="text-xs text-slate-400">Deep searching NCERT datasets & constructing precise memory tricks...</p>
              </div>
            )}

            {error && (
              <div className="p-4 bg-red-600/10 border border-red-500/20 rounded-xl text-xs text-red-300 flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold">Execution Error</p>
                  <p>{error}</p>
                </div>
              </div>
            )}

            {!loading && !error && !response && (
              <div className="py-24 text-center space-y-3">
                <span className="text-4xl">🦉</span>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Your resolved doubt report will populate here. AI Mentor breaks down theories into digestible bullet points, memory cards, and exam traps.
                </p>
              </div>
            )}

            {!loading && response && (
              <div className="p-4 rounded-xl bg-black/40 border border-white/5 overflow-y-auto custom-scrollbar max-h-[600px]">
                {renderFormattedResponse(response)}
              </div>
            )}
          </div>

          {!loading && response && (
            <p className="text-[9px] text-slate-600 text-center uppercase tracking-widest mt-4">
              NEET OS 2026 AI CO-PILOT. GENERATED EXPLANATIONS ARE RE-VALIDATED TO NCERT GUIDELINES.
            </p>
          )}
        </div>

      </div>
    </div>
  );
}
