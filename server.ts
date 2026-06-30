import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

// Increase payload size limit to support image uploads in doubt solver
app.use(express.json({ limit: "15mb" }));

// Initialize GoogleGenAI client on the server side
let ai: GoogleGenAI | null = null;
function getAIClient() {
  if (!ai) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn("GEMINI_API_KEY environment variable is not defined. AI features will fallback to client-side heuristics.");
      return null;
    }
    ai = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return ai;
}

// 1. API: AI Doubt Solver
app.post("/api/doubt", async (req, res) => {
  try {
    const { question, image, subject, chapter } = req.body;
    if (!question && !image) {
      return res.status(400).json({ error: "Please provide a text question or an image." });
    }

    const aiClient = getAIClient();
    if (!aiClient) {
      return res.status(503).json({
        error: "AI service is currently unconfigured. Please configure your GEMINI_API_KEY in Secrets.",
      });
    }

    // Build the instruction specifically targeting NEET UG preparation guidelines
    const systemInstruction = `You are an elite, highly-rated NEET UG (Biology, Chemistry, Physics) mentor and subject matter expert. Your goal is to explain concepts with absolute clarity, mapping them precisely to the official NCERT syllabus.
For every explanation, follow this premium structure:
1. **NCERT Direct Reference**: Cite the specific chapter, section, and standard concepts from NCERT Class 11 or 12.
2. **Simplified Core Concept**: Explain the underlying science using simple, visual, and conceptual language. Avoid jargon where possible.
3. **NEET Exam Tricks & Memory Aids**: Provide mnemonics, formula shortcuts, or quick identification rules for multiple-choice questions.
4. **Common Mistakes & Pitfalls**: Highlight typical examiner traps, misread terms, or silly math/formula errors.
Keep your response professional, analytical, and highly structured using markdown. Provide step-by-step mathematical solutions for Physics/Chemistry when needed.`;

    let contents: any[] = [];

    if (image && image.startsWith("data:")) {
      // Split off metadata to extract base64 data
      const parts = image.split(",");
      const mimeMatch = parts[0].match(/data:(.*?);/);
      const mimeType = mimeMatch ? mimeMatch[1] : "image/jpeg";
      const base64Data = parts[1];

      contents.push({
        inlineData: {
          mimeType,
          data: base64Data,
        },
      });
    }

    const contextPrompt = `Subject: ${subject || "General NEET UG Science"}\nChapter/Topic: ${chapter || "General Revision"}\n\nQuestion/Doubt:\n${question || "Please analyze this image and explain the concepts involved."}`;
    contents.push({ text: contextPrompt });

    const response = await aiClient.models.generateContent({
      model: "gemini-3.5-flash",
      contents: contents,
      config: {
        systemInstruction,
        temperature: 0.2, // Low temperature for high precision and correct scientific facts
      },
    });

    return res.json({ response: response.text });
  } catch (error: any) {
    console.error("Doubt Solver API error:", error);
    return res.status(500).json({ error: error?.message || "An unexpected error occurred while analyzing the doubt." });
  }
});

// 2. API: AI Planner & Recommendation Advisor
app.post("/api/recommendations", async (req, res) => {
  try {
    const studentProfile = req.body;
    const aiClient = getAIClient();
    if (!aiClient) {
      return res.status(503).json({
        error: "AI service is currently unconfigured. Please configure your GEMINI_API_KEY in Secrets.",
      });
    }

    const systemInstruction = `You are a legendary NEET UG chief strategist and counselor. You analyze student metrics and give laser-targeted, non-generic, actionable advice.
Do NOT give vague, motivational fluff like "study hard" or "stay positive".
Instead, act like a strict performance analyst. Your only goal is to maximize their final NEET score.
Examine their days remaining, target score, subject marks, weak/strong chapters, current backlog, wake/sleep patterns, mock test counts, and accuracy.
Recommend:
1. **Critical High-Yield Focus**: The single highest-impact chapter or action they must do TODAY to gain immediate marks.
2. **Backlog Elimination Plan**: Practical allocation of their study hours to cover weak chapters without messing up the current timeline.
3. **Accuracy & Time Hacks**: Heuristics to fix silly mistakes based on their current correct/wrong/skipped ratio.
4. **Mock Test Strategy**: When and how to take their next test, with exact strategy targets.
Keep your analysis concise, structured in clear markdown, and direct.`;

    const prompt = `Student Metrics Profile:
- Days Remaining: ${studentProfile.daysRemaining} days
- Target Score: ${studentProfile.targetScore} / 720
- Current Estimated Average Mock Score: ${studentProfile.currentAverageMarks || studentProfile.currentMarks} / 720
- Subject Marks Breakdown: Physics (${studentProfile.physicsMarks || 0}), Chemistry (${studentProfile.chemistryMarks || 0}), Biology (${studentProfile.biologyMarks || 0})
- Daily Study Budget: ${studentProfile.dailyStudyHours} hours
- Schooling: ${studentProfile.schoolMode || "Self Study / Dummy School"}
- Preparation Type: ${studentProfile.coachingMode || "Self-Study"}
- Backlog Severity: ${studentProfile.currentBacklog || "None"}
- Weak Chapters: ${studentProfile.weakChapters || "Not specified"}
- Strong Chapters: ${studentProfile.strongChapters || "Not specified"}
- Mock Tests Given: ${studentProfile.mockTestsGiven || 0}
- Current Question Accuracy: ${studentProfile.currentAccuracy || "Unknown"}%
- Study Time Preference: ${studentProfile.preferredStudyTime || "Flexible"}
- Sleep Schedule: Wake up at ${studentProfile.wakeUpTime || "6:00 AM"}, Sleep at ${studentProfile.sleepTime || "10:00 PM"}

Analyze these metrics and output a bespoke strategizer report with clear markdown headings and a concise summary.`;

    const response = await aiClient.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction,
        temperature: 0.3,
      },
    });

    return res.json({ response: response.text });
  } catch (error: any) {
    console.error("AI Recommendations API error:", error);
    return res.status(500).json({ error: error?.message || "An unexpected error occurred while generating recommendation reports." });
  }
});

// Configure Vite or Static Assets handling
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    console.log("Starting server in Development Mode (with Vite integration)...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    console.log("Starting server in Production Mode (serving static builds)...");
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`NEET OS Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
