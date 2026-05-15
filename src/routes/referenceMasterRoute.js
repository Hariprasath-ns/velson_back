import express from "express";
import { dbSelect } from "../middelwares/dbSelect.js";
import {
  getRecordsByType,
  createRecord,
  updateRecord,
  deleteRecord,
} from "../controllers/referenceMasterController.js";

const router = express.Router();

router.use(dbSelect);

router.get("/reference-master/:type", getRecordsByType);
router.post("/reference-master", createRecord);
router.put("/reference-master/:id", updateRecord);
router.delete("/reference-master/:id", deleteRecord);

export default router;
