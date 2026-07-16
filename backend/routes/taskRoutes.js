const express = require("express");
const router = express.Router({ mergeParams: true });
const { protect, requireProjectAccess } = require("../middleware/auth");

const {
  createTask,
  getTasks,
  updateTask,
  deleteTask,
} = require("../controllers/taskController");

router.use(protect, requireProjectAccess);

router.post("/", createTask);
router.get("/", getTasks);
router.put("/:id", updateTask);
router.delete("/:id", deleteTask);

module.exports = router;