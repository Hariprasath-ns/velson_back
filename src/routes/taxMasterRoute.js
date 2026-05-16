import express from "express";
import { dbSelect } from "../middelwares/dbSelect.js";
import { getAll, getOne, create, update, remove } from "../controllers/taxMasterController.js";

const router = express.Router();

router.use(dbSelect);

router.get("/tax-master", getAll);
router.get("/tax-master/:id", getOne);
router.post("/tax-master", create);
router.put("/tax-master/:id", update);
router.delete("/tax-master/:id", remove);

export default router;
