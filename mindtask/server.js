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

  let reply = "MindEase is connected, but Gemini is busy right now. Please try again later.";

  for (const model of models) {
    try {
      console.log("Trying model:", model);

      const response = await ai.models.generateContent({
        model,
        contents: prompt,
      });

      if (response?.text) {
        reply = response.text;
        break;
      }
    } catch (error) {
      console.log(`${model} failed:`, error.status || error.message);
    }
  }

  if (userId) {
    try {
      await prisma.chat.create({
        data: {
          message,
          response: reply,
          userId,
        },
      });
    } catch (error) {
      console.error("Failed saving chat history:", error.message || error);
    }
  }

  return res.json({ reply });
});

// GET CHAT HISTORY BY USER
app.get("/api/chats/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    let chats = await prisma.chat.findMany({
      where: { userId },
      orderBy: { createdAt: "asc" },
    });

    if (chats.length === 0) {
      const user = await prisma.user.findUnique({
        where: { id: userId },
      });

      const firstName = user?.name?.split(" ")[0] || "there";
      const greeting = `Hey ${firstName}! 🌿 I'm MindEase, your wellness companion. How are you feeling today? Whether you're stressed, overwhelmed, or just need to talk — I'm here.`;

      const initialChat = await prisma.chat.create({
        data: {
          message: "",
          response: greeting,
          userId,
        },
      });

      chats = [initialChat];
    }

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
    const { title, content, type, icon, userId } = req.body;

    const note = await prisma.note.create({
      data: {
        title,
        content,
        type,
        icon: icon || "📄",
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
    const { title, status, priority, tag, userId } = req.body;

    const task = await prisma.task.create({
      data: {
        title,
        status,
        priority,
        tag: tag || "Other",
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

// UPDATE PAGE
app.put("/api/pages/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content } = req.body;

    const page = await prisma.page.update({
      where: { id },
      data: { title, content },
    });

    res.json(page);
  } catch (error) {
    res.status(500).json({
      message: "Failed to update page",
      error: error.message,
    });
  }
});

// DELETE PAGE
app.delete("/api/pages/:id", async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.page.delete({
      where: { id },
    });

    res.json({ message: "Page deleted successfully" });
  } catch (error) {
    res.status(500).json({
      message: "Failed to delete page",
      error: error.message,
    });
  }
});

// UPDATE TASK
app.put("/api/tasks/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { title, status, priority, tag } = req.body;

    const updateData = { title, status, priority };
    if (tag !== undefined) updateData.tag = tag;

    const task = await prisma.task.update({
      where: { id },
      data: updateData,
    });

    res.json(task);
  } catch (error) {
    res.status(500).json({
      message: "Failed to update task",
      error: error.message,
    });
  }
});

// DELETE TASK
app.delete("/api/tasks/:id", async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.task.delete({
      where: { id },
    });

    res.json({ message: "Task deleted successfully" });
  } catch (error) {
    res.status(500).json({
      message: "Failed to delete task",
      error: error.message,
    });
  }
});

// UPDATE NOTE
app.put("/api/notes/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, type, icon } = req.body;

    const updateData = { title, content, type };
    if (icon !== undefined) updateData.icon = icon;

    const note = await prisma.note.update({
      where: { id },
      data: updateData,
    });

    res.json(note);
  } catch (error) {
    res.status(500).json({
      message: "Failed to update note",
      error: error.message,
    });
  }
});

// DELETE NOTE
app.delete("/api/notes/:id", async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.note.delete({
      where: { id },
    });

    res.json({ message: "Note deleted successfully" });
  } catch (error) {
    res.status(500).json({
      message: "Failed to delete note",
      error: error.message,
    });
  }
});

app.listen(5000, () => {
  console.log("Gemini server running on http://localhost:5000");
});