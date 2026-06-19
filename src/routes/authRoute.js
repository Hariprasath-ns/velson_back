import express from "express";
import { dbSelect } from "../middelwares/dbSelect.js";
import { login, refresh, logout } from "../controllers/authController.js";
import { loginLimiter } from "../middelwares/rateLimiter.js";

const router = express.Router();

router.post("/login",   dbSelect, loginLimiter, login);
router.post("/refresh", dbSelect, refresh);
router.post("/logout",  dbSelect, logout);

export default router;
