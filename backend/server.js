
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const connectDB = require("./config/db");
const Task = require("./models/task");

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

function isDatabaseUnavailable(error) {
  return (
    mongoose.connection.readyState !== 1 ||
    /MongoNetwork|MongoServerSelection|MongooseServerSelection/.test(
      error.name || ""
    )
  );
}

function databaseErrorResponse(res, message, error) {
  const unavailable = isDatabaseUnavailable(error);

  return res.status(unavailable ? 503 : 500).json({
    success: false,
    message: unavailable ? "Task database is unavailable" : message,
    error: error.message,
  });
}

// Health check
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "TaskFlow server is running!",
  });
});

// Get all tasks and task count
app.get("/api/tasks/count", async (req, res) => {
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
app.get("/api/tasks/:id", async (req, res) => {
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
app.post("/api/tasks", async (req, res) => {
  try {
    const { title, description, dueDate, status, assignedTo } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({
        success: false,
        message: "Task title is required",
      });
    }

    const newTask = await Task.create({
      title: title.trim(),
      description: description || "",
      dueDate: dueDate || "",
      status: status || "Pending",
      assignedTo: assignedTo ?? "",
    });

    res.status(201).json({
      success: true,
      message: "Task created successfully",
      data: newTask,
    });
  } catch (error) {
    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: "Invalid task data",
        error: error.message,
      });
    }

    databaseErrorResponse(res, "Failed to create task", error);
  }
});

// Update a task
app.put("/api/tasks/:id", async (req, res) => {
  try {
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
  } catch (error) {
    if (error.name === "ValidationError" || error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: "Invalid task data",
        error: error.message,
      });
    }

    databaseErrorResponse(res, "Failed to update task", error);
  }
});

// Delete a task
app.delete("/api/tasks/:id", async (req, res) => {
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
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: "Invalid task ID",
        error: error.message,
      });
    }

    databaseErrorResponse(res, "Failed to delete task", error);
  }
});

// Start server only after connecting to MongoDB
async function startServer() {
  try {
    await connectDB();

    app.listen(PORT, () => {
      console.log(`TaskFlow server running at http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Unable to start TaskFlow:", error.message);
    process.exit(1);
  }
}


startServer();
