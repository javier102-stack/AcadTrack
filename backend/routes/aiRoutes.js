
const express = require("express");
const router = express.Router();

router.post("/study-plan", async (req, res) => {
  try {
    const { prompt } = req.body;

    if (typeof prompt !== "string" || !prompt.trim()) {
      return res.status(400).json({
        message: "Please enter a question or request."
      });
    }

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      console.error("GEMINI_API_KEY is missing.");
      return res.status(500).json({
        message: "The AI service is not configured yet."
      });
    }

    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite:generateContent",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": apiKey
        },
        body: JSON.stringify({
          system_instruction: {
            parts: [{
              text: "You are Academix AI, a friendly academic assistant. Help students organize assignments, break work into manageable steps, create realistic study plans, and prepare for exams. Give clear, practical, student-friendly answers. Do not claim to modify or save tasks."
            }]
          },
          contents: [{
            role: "user",
            parts: [{ text: prompt.trim() }]
          }],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 2048
          }
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error(
        "Gemini API error:",
        response.status,
        data.error?.message || "Request failed"
      );

      return res.status(502).json({
        message: "Gemini could not generate a response. Please try again."
      });
    }

    const answer = data.candidates?.[0]?.content?.parts
      ?.map(part => part.text || "")
      .join("")
      .trim();

    if (!answer) {
      console.error(
        "Gemini returned no text:",
        data.promptFeedback || data.candidates?.[0]?.finishReason
      );

      return res.status(502).json({
        message: "Gemini returned an empty response. Please try again."
      });
    }

    return res.json({ answer });

  } catch (error) {
    console.error("Academix AI error:", error.message);

    return res.status(502).json({
      message: "Unable to reach Gemini. Please try again later."
    });
  }
});

module.exports = router;
