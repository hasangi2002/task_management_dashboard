const express = require('express');
const router = express.Router({ mergeParams: true });
const { protect, requireProjectAccess } = require('../middleware/auth');
const {
  getUsers,
  createUser,
  updateUser,
  deleteUser,
  updateMyProfile
} = require("../controllers/userController");

router.use(protect, requireProjectAccess);

router.get("/", getUsers);
router.post("/", createUser);
router.put("/me", updateMyProfile);
router.put("/:id", updateUser);
router.delete("/:id", deleteUser);

module.exports = router;