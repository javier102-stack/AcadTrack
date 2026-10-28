
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

    const response = await fetch("http://localhost:11434/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama3.2:1b",
        stream: false,
        messages: [
          {
            role: "system",
            content:
              "You are Academix AI, a friendly academic assistant. Help students organize assignments, break work into manageable steps, and create realistic study plans.",
          },
          {
            role: "user",
            content: prompt.trim(),
          },
        ],
      }),
    });

    if (!response.ok) {
      throw new Error(`Ollama returned status ${response.status}`);
    }

    const data = await response.json();

    return res.json({
      answer: data.message.content,
    });
  } catch (error) {
    console.error("Academix AI error:", error.message);

    return res.status(502).json({
      message:
        "Unable to reach Ollama. Make sure Ollama is running and the model is installed.",
    });
  }
});

module.exports = router;
