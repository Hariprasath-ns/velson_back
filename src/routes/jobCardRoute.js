import express from "express";
import { dbSelect } from "../middlewares/dbSelect.js";
import {
  getAll,
  getNextNo,
  create,
  update,
  remove,
  updateProcess,
  closeRouteCard,
  getJobProcessMenu,
  updateJobProcessMenu,
} from "../controllers/jobCardController.js";

const router = express.Router();


router.get("/job-card", getAll);
router.get("/job-card/next-no", getNextNo);
router.post("/job-card", create);
router.put("/job-card/line-item/process", updateProcess);
router.put("/job-card/:id/close-route-card", closeRouteCard);
router.put("/job-card/:id", update);
router.delete("/job-card/:id", remove);

// Job Process Menu config routes
router.get("/job-process-menu", getJobProcessMenu);
router.put("/job-process-menu", updateJobProcessMenu);

export default router;
