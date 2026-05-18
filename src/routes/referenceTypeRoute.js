import express from "express";
import { dbSelect } from "../middelwares/dbSelect.js";
import {
  getAllTypes,
  getTypeById,
  getValuesByName,
  createType,
  updateType,
  deleteType,
} from "../controllers/referenceTypeController.js";

const router = express.Router();

router.use(dbSelect);

router.get("/reference-types", getAllTypes);
router.get("/reference-types/values/:name", getValuesByName);
router.get("/reference-types/:id", getTypeById);
router.post("/reference-types", createType);
router.put("/reference-types/:id", updateType);
router.delete("/reference-types/:id", deleteType);

export default router;
