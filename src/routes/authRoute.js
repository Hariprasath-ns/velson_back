import express from "express";
import { dbSelect } from "../middlewares/dbSelect.js";
import { authenticate } from "../middlewares/auth.js";
import { login, refresh, logout, getCurrentUserPermissions } from "../controllers/authController.js";
import { loginLimiter } from "../middlewares/rateLimiter.js";

const router = express.Router();

router.post("/login",   dbSelect, loginLimiter, login);
router.post("/refresh", dbSelect, refresh);
router.post("/logout",  dbSelect, logout);
router.get("/permissions", dbSelect, authenticate, getCurrentUserPermissions);

export default router;
