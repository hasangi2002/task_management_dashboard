require("dotenv").config();

const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const taskRoutes = require("./routes/taskRoutes");
const userRoutes = require("./routes/userRoutes");
const kpiRoutes = require("./routes/kpiRoutes");
const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(express.json());
app.use("/api/tasks", taskRoutes);
app.use("/api/users", userRoutes);
app.use("/api/kpis", kpiRoutes);

// Test route
app.get("/", (req, res) => {
  res.send("Task Management API Running");
});

// Start server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});