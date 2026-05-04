import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import process from "process";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const prisma = new PrismaClient();

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

const models = [
  "gemini-2.5-flash-lite",
  "gemini-2.5-flash",
  "gemini-2.5-pro",
];

// TEST DATABASE
app.get("/api/test-db", async (req, res) => {
  try {
    await prisma.$connect();

    res.json({
      message: "MongoDB Prisma database connected successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: "Database connection failed",
      error: error.message,
    });
  }
});

// ✅ ADD THIS HERE 👇
app.get("/api/users", async (req, res) => {
  try {
    const users = await prisma.user.findMany();
    res.json(users);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch users",
      error: error.message,
    });
  }
});

// SIGN UP
app.post("/api/auth/register", async (req, res) => {
  try {
    const { email, password, name } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required",
      });
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(400).json({
        message: "Email already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
      },
    });

    res.status(201).json({
      message: "User registered successfully",
      user,
    });
  } catch (error) {
    res.status(500).json({
      message: "Registration failed",
      error: error.message,
    });
  }
});

// LOGIN
app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);

    if (!isPasswordCorrect) {
      return res.status(401).json({
        message: "Invalid password",
      });
    }

    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      message: "Login successful",
      token,
      user,
    });
  } catch (error) {
    res.status(500).json({
      message: "Login failed",
      error: error.message,
    });
  }
});

// GEMINI CHAT — same logic, with optional database saving
app.post("/api/chat", async (req, res) => {
  const { message, userId } = req.body;

  if (!message) {
    return res.status(400).json({ reply: "Please enter a message." });
  }

  const prompt = `
You are MindEase, a supportive mental wellness assistant inside MindTask.

Rules:
- Be kind, calm, and supportive.
- Keep responses short and comforting.
- Suggest simple coping steps.
- Do not diagnose the user.
- If the user mentions self-harm, suicide, or danger, tell them to contact emergency services or a trusted person immediately.

User message: ${message}
`;

  for (const model of models) {
    try {
      console.log("Trying model:", model);

      const response = await ai.models.generateContent({
        model,
        contents: prompt,
      });

      const reply = response.text;

      // Save chat only if userId is provided
      if (userId) {
        await prisma.chat.create({
          data: {
            message,
            response: reply,
            userId,
          },
        });
      }

      return res.json({ reply });
    } catch (error) {
      console.log(`${model} failed:`, error.status || error.message);
    }
  }

  return res.status(500).json({
    reply:
      "MindEase is connected, but Gemini is busy right now. Please try again later.",
  });
});

// GET CHAT HISTORY BY USER
app.get("/api/chats/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    const chats = await prisma.chat.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });

    res.json(chats);
  } catch (error) {
    res.status(500).json({
      message: "Failed to get chat history",
      error: error.message,
    });
  }
});

// CREATE NOTE
app.post("/api/notes", async (req, res) => {
  try {
    const { title, content, userId } = req.body;

    const note = await prisma.note.create({
      data: {
        title,
        content,
        userId,
      },
    });

    res.status(201).json(note);
  } catch (error) {
    res.status(500).json({
      message: "Failed to create note",
      error: error.message,
    });
  }
});

// GET NOTES BY USER
app.get("/api/notes/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    const notes = await prisma.note.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });

    res.json(notes);
  } catch (error) {
    res.status(500).json({
      message: "Failed to get notes",
      error: error.message,
    });
  }
});

// CREATE TASK
app.post("/api/tasks", async (req, res) => {
  try {
    const { title, status, priority, userId } = req.body;

    const task = await prisma.task.create({
      data: {
        title,
        status,
        priority,
        userId,
      },
    });

    res.status(201).json(task);
  } catch (error) {
    res.status(500).json({
      message: "Failed to create task",
      error: error.message,
    });
  }
});

// GET TASKS BY USER
app.get("/api/tasks/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    const tasks = await prisma.task.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });

    res.json(tasks);
  } catch (error) {
    res.status(500).json({
      message: "Failed to get tasks",
      error: error.message,
    });
  }
});

// CREATE PAGE
app.post("/api/pages", async (req, res) => {
  try {
    const { title, content, userId } = req.body;

    const page = await prisma.page.create({
      data: {
        title,
        content,
        userId,
      },
    });

    res.status(201).json(page);
  } catch (error) {
    res.status(500).json({
      message: "Failed to create page",
      error: error.message,
    });
  }
});

// GET PAGES BY USER
app.get("/api/pages/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    const pages = await prisma.page.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });

    res.json(pages);
  } catch (error) {
    res.status(500).json({
      message: "Failed to get pages",
      error: error.message,
    });
  }
});

app.listen(5000, () => {
  console.log("Gemini server running on http://localhost:5000");
});