import express from "express";
import UserController from "./user.controller.js";

const router = express.Router();

// =======================
// 🔹 USER ROUTES
// =======================

// Get all users
router.get("/", UserController.getAllUsers);

export default router;
