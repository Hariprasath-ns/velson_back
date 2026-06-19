import express from "express";
import { dbSelect } from "../middelwares/dbSelect.js";
import { authenticate } from "../middelwares/auth.js";
import { authorize } from "../middelwares/authorize.js";
import {
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
  getUserPermissions,
  updateUserPermissions,
  getRolePermissions,
  updateRolePermissions,
  getRolesList,
} from "../controllers/userController.js";

const router = express.Router();

router.use(dbSelect);

// Only admin can manage users
router.get("/users",                  authenticate, authorize("admin"), getUsers);
router.get("/users/:id",              authenticate, authorize("admin"), getUser);
router.post("/users",                 authenticate, authorize("admin"), createUser);
router.put("/users/:id",              authenticate, authorize("admin"), updateUser);
router.delete("/users/:id",           authenticate, authorize("admin"), deleteUser);
router.get("/users/:id/permissions",  authenticate, authorize("admin"), getUserPermissions);
router.put("/users/:id/permissions",  authenticate, authorize("admin"), updateUserPermissions);

// Role permissions management
router.get("/roles",                     authenticate, authorize("admin"), getRolesList);
router.get("/roles/:roleName/permissions", authenticate, authorize("admin"), getRolePermissions);
router.put("/roles/:roleName/permissions", authenticate, authorize("admin"), updateRolePermissions);

export default router;
