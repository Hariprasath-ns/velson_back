import express from "express";
import { dbSelect } from "../middelwares/dbSelect.js";
import {
  getAll,
  getNextNo,
  create,
  update,
  remove,
  updateProcess,
} from "../controllers/jobCardController.js";

const router = express.Router();

router.use(dbSelect);

router.get("/job-card", getAll);
router.get("/job-card/next-no", getNextNo);
router.post("/job-card", create);
router.put("/job-card/line-item/process", updateProcess);
router.put("/job-card/:id", update);
router.delete("/job-card/:id", remove);

export default router;
