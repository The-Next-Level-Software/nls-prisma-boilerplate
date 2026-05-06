import express from "express";

// Import module routes
import authRoutes from "../modules/auth/auth.route.js";
import userRoutes from "../modules/user/user.route.js";
import fileRoutes from "../modules/file/file.route.js";
import backupRoutes from "../modules/backup/backup.route.js";

const router = express.Router();

// =======================
// 🔹 MODULE ROUTES
// =======================

router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/files", fileRoutes);
router.use("/backup", backupRoutes);

export default router;
