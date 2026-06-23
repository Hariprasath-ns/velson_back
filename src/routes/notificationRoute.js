import express from "express";
import { authenticate } from "../middelwares/auth.js";
import { authorize } from "../middelwares/authorize.js";
import { dbSelect } from "../middelwares/dbSelect.js";
import * as Controller from "../controllers/notificationController.js";

const router = express.Router();

router.use(dbSelect);

// Notification retrieval and status actions (authenticated users)
router.get("/notifications", authenticate, Controller.getNotifications);
router.put("/notifications/read-all", authenticate, Controller.markAllAsRead);
router.put("/notifications/:id/read", authenticate, Controller.markAsRead);
router.delete("/notifications/:id", authenticate, Controller.deleteNotification);

// User notification preferences (self-configuration)
router.get("/notifications/preferences", authenticate, Controller.getPreferences);
router.put("/notifications/preferences", authenticate, Controller.updatePreferences);

// Notification Rights matrix (admin only)
router.get("/notifications/rights", authenticate, authorize("admin"), Controller.getRightsMatrix);
router.post("/notifications/rights", authenticate, authorize("admin"), Controller.updateRightsMatrix);

// Global settings (admin only)
router.get("/notifications/settings", authenticate, authorize("admin"), Controller.getSettings);
router.post("/notifications/settings", authenticate, authorize("admin"), Controller.updateSettings);

export default router;
