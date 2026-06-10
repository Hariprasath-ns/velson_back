import express from "express";
import { dbSelect } from "../middelwares/dbSelect.js";
import { getAll, getNextMwr, create, update, remove } from "../controllers/machineBreakdownController.js";

const router = express.Router();
router.use(dbSelect);

router.get("/machine-breakdown", getAll);
router.get("/machine-breakdown/next-mwr", getNextMwr);
router.post("/machine-breakdown", create);
router.put("/machine-breakdown/:id", update);
router.delete("/machine-breakdown/:id", remove);

export default router;
