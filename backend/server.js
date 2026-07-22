require("dotenv").config();

const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const { generalLimiter, authLimiter } = require('./middleware/rateLimiter');

const authRoutes = require("./routes/authRoutes");
const projectRoutes = require("./routes/projectRoutes");
const taskRoutes = require("./routes/taskRoutes");
const userRoutes = require("./routes/userRoutes");
const kpiRoutes = require("./routes/kpiRoutes");
const templateRoutes = require("./routes/templateRoutes");
const notificationRoutes = require("./routes/notificationRoutes");

const { startScheduler } = require("./services/scheduler");
const app = express();

connectDB();

app.use(cors());
app.use(express.json());

app.use('/api/auth', authLimiter);
app.use('/api', generalLimiter);

app.use("/api/auth", authRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/projects/:projectId/tasks", taskRoutes);
app.use("/api/projects/:projectId/users", userRoutes);
app.use("/api/projects/:projectId/kpis", kpiRoutes);
app.use("/api/projects/:projectId/templates", templateRoutes);
app.use("/api/notifications", notificationRoutes);

app.get("/", (req, res) => {
  res.send("Task Management API Running");
});

startScheduler();

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});