require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const mongoose = require("mongoose");

const app = express();
const PORT = process.env.PORT || 3000;

const allowedPriorities = ["low", "medium", "high"];

const connectWithRetry = () => {
  mongoose.connect(process.env.MONGODB_URI, {
    serverSelectionTimeoutMS: 30000,
    socketTimeoutMS: 45000
  }).then(() => {
    console.log("MongoDB connected");
  }).catch(err => {
    console.error("MongoDB connection error. Retrying in 5 seconds...", err);
    setTimeout(connectWithRetry, 5000);
  });
};

connectWithRetry();

// Mongoose Schema and Model
const todoSchema = new mongoose.Schema({
  task: String,
  priority: { type: String, default: "medium" }
});
const Todo = mongoose.model("Todo", todoSchema);

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Home Route - List Todos with Optional Filter
app.get("/", async (req, res) => {
  const { priority } = req.query;
  try {
    const filter = allowedPriorities.includes(priority) ? { priority } : {};
    const todos = await Todo.find(filter);
    res.render("list", { todos, filter: priority });
  } catch (err) {
    console.error(err);
    res.status(500).send("Error loading tasks.");
  }
});

// Add Todo
app.post("/add", async (req, res) => {
  let { task, priority } = req.body;
  if (!task || !task.trim()) return res.redirect("/");
  if (!allowedPriorities.includes(priority)) priority = "medium";

  try {
    await Todo.create({ task: task.trim(), priority });
    res.redirect("/");
  } catch (err) {
    console.error(err);
    res.redirect("/");
  }
});

// Edit Todo
app.post("/edit/:id", async (req, res) => {
  const { id } = req.params;
  let { updatedTask, updatedPriority } = req.body;

  if (!updatedTask || !updatedTask.trim()) return res.redirect("/");
  if (!allowedPriorities.includes(updatedPriority)) updatedPriority = "medium";

  try {
    await Todo.findByIdAndUpdate(id, {
      task: updatedTask.trim(),
      priority: updatedPriority
    });
    res.redirect("/");
  } catch (err) {
    console.error(err);
    res.redirect("/");
  }
});

// Delete Todo
app.post("/delete/:id", async (req, res) => {
  const { id } = req.params;
  try {
    await Todo.findByIdAndDelete(id);
    res.redirect("/");
  } catch (err) {
    console.error(err);
    res.redirect("/");
  }
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
