
import "dotenv/config";

import cors from "cors";
import express, { type NextFunction, type Request, type Response } from "express";
import mongoose from "mongoose";
import session from "express-session";
import MongoStore from "connect-mongo";
import bcrypt from "bcryptjs";
import User from "./models/user"

import connectDB from "./config/db.js";
import Task, { type TaskFields, type TaskStatus,type priorityStatus } from "./models/task.js";

const app = express();
const PORT = Number(process.env.PORT) || 5000;
const sessionSecret = process.env.SESSION_SECRET;

if (!sessionSecret) {
  throw new Error("SESSION_SECRET is missing from backend/.env");
}

interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  count?: number;
  data?: T;
  error?: string;
}

interface CreateTaskBody {
  title: string;
  description?: string;
  dueDate?: string;
  status?: TaskStatus;
  priority?: priorityStatus;
  assignedTo?: string;
}

type UpdateTaskBody = Partial<TaskFields>;

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "Unknown error";
}

function errorName(error: unknown): string {
  return error instanceof Error ? error.name : "";
}

// Middleware
app.use(cors());
app.use(express.json());
app.use(
  session({
    name: "taskflow.sid",
    secret: sessionSecret,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: process.env.MONGODB_URI!,
      collectionName: "sessions",
    }),
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    },
  })
);


function isDatabaseUnavailable(error: unknown): boolean {
  const name = error instanceof Error ? error.name : "";
  return (
    mongoose.connection.readyState !== 1 ||
    /MongoNetwork|MongoServerSelection|MongooseServerSelection/.test(name)
  );
}

function databaseErrorResponse(
  res: Response<ApiResponse>,
  message: string,
  error: unknown,
) {
  const unavailable = isDatabaseUnavailable(error);

  return res.status(unavailable ? 503 : 500).json({
    success: false,
    message: unavailable ? "Task database is unavailable" : message,
    error: errorMessage(error),
  });
}

function requireAuthentication(
  req: Request,
  res: Response<ApiResponse>,
  next: NextFunction,
) {
  if (!req.session.userId) {
    return res.status(401).json({
      success: false,
      message: "You must be signed in to access tasks.",
    });
  }

  return next();
}

// Health check
app.get("/", (_req, res: Response<ApiResponse>) => {
  res.status(200).json({
    success: true,
    message: "TaskFlow server is running!",
  });
});

app.get("/api/auth/me", async (req, res) => {
  if (!req.session.userId) {
    return res.status(401).json({
      message: "You are not signed in.",
    });
  }

  try {
    const user = await User.findById(req.session.userId).select("name email role");

    if (!user) {
      return res.status(401).json({
        message: "You are not signed in.",
      });
    }

    return res.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Session lookup error:", error);

    return res.status(500).json({
      message: "Unable to verify your session.",
    });
  }
});

app.post("/api/auth/logout", (req, res) => {
  req.session.destroy((error) => {
    if (error) {
      console.error("Logout error:", error);
      return res.status(500).json({
        message: "Unable to sign out.",
      });
    }

    res.clearCookie("taskflow.sid", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    });

    return res.json({
      message: "Signed out successfully.",
    });
  });
});

app.get("/api/users", requireAuthentication, async (_req, res: Response<ApiResponse>) => {
  try {
    const users = await User.find().select("name email role").sort({ name: 1 });

    return res.json({
      success: true,
      data: users.map((user) => ({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      })),
    });
  } catch (error) {
    return databaseErrorResponse(res, "Failed to fetch users", error);
  }
});

// Get all tasks and task count
app.get("/api/tasks/count", requireAuthentication, async (_req, res: Response<ApiResponse>) => {
  try {
    const tasks = await Task.find().sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: tasks.length,
      data: tasks,
    });
  } catch (error) {
    databaseErrorResponse(res, "Failed to fetch tasks", error);
  }
});

// Get a single task
app.get("/api/tasks/:id", requireAuthentication, async (req, res: Response<ApiResponse>) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    res.status(200).json({
      success: true,
      data: task,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Invalid task ID",
    });
  }
});

// Create a task
app.post(
  "/api/tasks",
  requireAuthentication,
  async (
    req: express.Request<Record<string, never>, unknown, CreateTaskBody>,
    res: Response<ApiResponse>,
  ) => {
  try {
    const { title, description, dueDate, status, priority, assignedTo } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({
        success: false,
        message: "Task title is required",
      });
    }

    if (
      assignedTo !== undefined &&
      typeof assignedTo !== "string"
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid task assignee",
      });
    }

    const assignee = assignedTo
      ? await User.findById(assignedTo).select("_id")
      : null;

    if (assignedTo && !assignee) {
      return res.status(400).json({
        success: false,
        message: "The selected assignee does not exist.",
      });
    }

    const newTask = await Task.create({
      title: title.trim(),
      description: description || "",
      dueDate: dueDate || "",
      status: status || "Pending",
      priority: priority || "Medium",
      assignedTo: assignee?.id ?? "",
    });

    res.status(201).json({
      success: true,
      message: "Task created successfully",
      data: newTask,
    });
  } catch (error: unknown) {
    if (
      errorName(error) === "ValidationError" ||
      errorName(error) === "CastError"
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid task data",
        error: errorMessage(error),
      });
    }

    databaseErrorResponse(res, "Failed to create task", error);
  }
});

// Update a task
app.put(
  "/api/tasks/:id",
  requireAuthentication,
  async (
    req: express.Request<{ id: string }, unknown, UpdateTaskBody>,
    res: Response<ApiResponse>,
  ) => {
  try {
    if (
      req.body.assignedTo !== undefined &&
      typeof req.body.assignedTo !== "string"
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid task assignee",
      });
    }

    if (req.body.assignedTo) {
      const assignee = await User.findById(req.body.assignedTo).select("_id");

      if (!assignee) {
        return res.status(400).json({
          success: false,
          message: "The selected assignee does not exist.",
        });
      }
    }

    const updatedTask = await Task.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!updatedTask) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Task updated successfully",
      data: updatedTask,
    });
  } catch (error: unknown) {
    if (
      errorName(error) === "ValidationError" ||
      errorName(error) === "CastError"
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid task data",
        error: errorMessage(error),
      });
    }

    databaseErrorResponse(res, "Failed to update task", error);
  }
});

// Delete a task
app.delete(
  "/api/tasks/:id",
  requireAuthentication,
  async (req: express.Request<{ id: string }>, res: Response<ApiResponse>) => {
  try {
    const deletedTask = await Task.findByIdAndDelete(req.params.id);

    if (!deletedTask) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Task deleted successfully",
      data: deletedTask,
    });
  } catch (error: unknown) {
    if (errorName(error) === "CastError") {
      return res.status(400).json({
        success: false,
        message: "Invalid task ID",
        error: errorMessage(error),
      });
    }

    databaseErrorResponse(res, "Failed to delete task", error);
  }
});

app.post("/api/auth/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (
      typeof name !== "string" ||
      typeof email !== "string" ||
      typeof password !== "string"
    ) {
      return res.status(400)
      .json({
        message: "Name, email and password are required.",
      });
    }

    const cleanName = name.trim();
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanName || cleanName.length > 100) {
      return res.status(400).json({
        message: "Enter a valid name.",
      });
    }

    if (password.length < 8 || password.length > 72) {
      return res.status(400).json({
        message: "Password must be 8–72 characters long.",
      });
    }

    const existing = await User.findOne({
      email: cleanEmail,
    });

    if (existing) {
      return res.status(409).json({
        message: "An account with this email already exists.",
      });
    }

    const passwordHash = await bcrypt.hash(password, 12);

    await User.create({
      name: cleanName,
      email: cleanEmail,
      passwordHash,
    });

    return res.status(201).json({
      message: "Account created successfully.",
    });
  } catch (error) {
    console.error("Signup error:", error);

    return res.status(500).json({
      message: "Unable to create account.",
    });
  }
});

app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password, rememberMe } = req.body;

    if (
      typeof email !== "string" ||
      typeof password !== "string"
    ) {
      return res.status(400).json({
        message: "Email and password are required.",
      });
    }

    const user = await User.findOne({
      email: email.trim().toLowerCase(),
    }).select("+passwordHash");

    if (
      !user ||
      !(await bcrypt.compare(password, user.passwordHash))
    ) {
      return res.status(401).json({
        message: "Invalid email or password.",
      });
    }

    await new Promise<void>((resolve, reject) => {
      req.session.regenerate((error) => {
        if (error) reject(error);
        else resolve();
      });
    });

    req.session.userId = user.id;

    req.session.cookie.maxAge =
      rememberMe === true
        ? 7 * 24 * 60 * 60 * 1000
        : undefined;

    await new Promise<void>((resolve, reject) => {
      req.session.save((error) => {
        if (error) reject(error);
        else resolve();
      });
    });

    return res.json({
      message: "Signed in successfully.",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Login error:", error);

    return res.status(500).json({
      message: "Unable to sign in.",
    });
  }
});

// Start server only after connecting to MongoDB
async function startServer() {
  try {
    await connectDB();

    app.listen(PORT, () => {
      console.log(`TaskFlow server running at http://localhost:${PORT}`);
    });
  } catch (error: unknown) {
    console.error("Unable to start TaskFlow:", errorMessage(error));
    process.exit(1);
  }
}


void startServer();
