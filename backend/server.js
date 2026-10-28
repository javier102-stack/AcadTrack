  const cookieParser = require("cookie-parser");
  const express = require("express");
  const mongoose = require("mongoose");
  const cors = require("cors");
  const notesRouter = require('./routes/notes');  
  require("dotenv").config();

  const app = express();

  // Middleware
  app.use(
    cors({
      origin: ["https://acad-track-ochre.vercel.app"],
      credentials: true,
    })
  );
  app.use(express.json());
  app.use(cookieParser());

  // Existing task routes — keep this
  app.use("/api/tasks", require("./routes/taskRoutes"));

  // New authentication routes
  app.use("/api/auth", require("./routes/authRoutes"));

  app.use("/api/ai", require("./routes/aiRoutes"));

  // Mount the notes API endpoint
  app.use('/api/notes', notesRouter);

  // Test route
  app.get("/", (req, res) => {
    res.send("Academix backend is running!");
  });

  // Connect to MongoDB
  mongoose
    .connect(process.env.MONGO_URI)
    .then(() => {
      console.log("MongoDB connected successfully!");

      app.listen(process.env.PORT, "0.0.0.0", () => {
        console.log(
          `Server running on port ${process.env.PORT}`
        );
      });
    })
    .catch((error) => {
      console.error("MongoDB connection failed:", error.message);
    });
