import express from "express";
import { authenticate } from "../middlewares/auth.js";
import { authorize } from "../middlewares/authorize.js";
import { dbSelect } from "../middlewares/dbSelect.js";
import * as Controller from "../controllers/notificationController.js";

const router = express.Router();


// Notification retrieval and status actions (authenticated users)
router.get("/notifications", Controller.getNotifications);
router.put("/notifications/read-all", Controller.markAllAsRead);
router.put("/notifications/:id/read", Controller.markAsRead);
router.delete("/notifications/:id", Controller.deleteNotification);

// User notification preferences (self-configuration)
router.get("/notifications/preferences", Controller.getPreferences);
router.put("/notifications/preferences", Controller.updatePreferences);

// Notification Rights matrix (admin only)
router.get("/notifications/rights", authorize("admin"), Controller.getRightsMatrix);
router.post("/notifications/rights", authorize("admin"), Controller.updateRightsMatrix);

// Global settings (admin only)
router.get("/notifications/settings", authorize("admin"), Controller.getSettings);
router.post("/notifications/settings", authorize("admin"), Controller.updateSettings);

export default router;
