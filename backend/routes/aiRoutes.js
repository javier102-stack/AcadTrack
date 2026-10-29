
const express = require("express");

const router = express.Router();

router.post("/study-plan", async (req, res) => {
  try {
    const { prompt } = req.body;

    if (typeof prompt !== "string" || !prompt.trim()) {
      return res.status(400).json({
        message: "Please enter a question or request.",
      });
    }

    const apiKey = process.env.AI_GATEWAY_API_KEY;

    if (!apiKey) {
      console.error("AI_GATEWAY_API_KEY is missing on the server.");

      return res.status(500).json({
        message: "The AI service is not configured yet.",
      });
    }

    const response = await fetch(
      "https://ai-gateway.vercel.sh/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "openai/gpt-4.1-mini",
          messages: [
            {
              role: "system",
              content:
                "You are Academix AI, a friendly academic assistant. Help students organize assignments, break work into manageable steps, and create realistic study plans. Give clear, practical, student-friendly answers.",
            },
            {
              role: "user",
              content: prompt.trim(),
            },
          ],
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error(
        "Vercel AI Gateway error:",
        response.status,
        data.error?.message || "Request failed"
      );

      return res.status(502).json({
        message:
          "The AI service could not generate a response. Please try again.",
      });
    }

    const answer = data.choices?.[0]?.message?.content;

    if (!answer) {
      return res.status(502).json({
        message: "The AI service returned an empty response.",
      });
    }

    return res.json({ answer });
  } catch (error) {
    console.error("Academix AI error:", error.message);

    return res.status(502).json({
      message: "Unable to reach the AI service. Please try again later.",
    });
  }
});

module.exports = router;
