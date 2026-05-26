import express from "express";
import { dbSelect } from "../middelwares/dbSelect.js";
import { login } from "../controllers/authController.js";

const router = express.Router();

router.post("/login", dbSelect, login);

export default router;
