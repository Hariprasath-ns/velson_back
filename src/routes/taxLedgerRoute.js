import express from "express";
import { dbSelect } from "../middlewares/dbSelect.js";
import { getAll, getOne, create, update, remove } from "../controllers/taxLedgerController.js";

const router = express.Router();


router.get("/tax-ledger", getAll);
router.get("/tax-ledger/:id", getOne);
router.post("/tax-ledger", create);
router.put("/tax-ledger/:id", update);
router.delete("/tax-ledger/:id", remove);

export default router;
