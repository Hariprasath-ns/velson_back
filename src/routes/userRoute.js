import express from "express";
import { dbSelect } from "../middlewares/dbSelect.js";
import { authenticate } from "../middlewares/auth.js";
import { authorize } from "../middlewares/authorize.js";
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


// Only admin can manage users
router.get("/users", authorize("admin"), getUsers);
router.get("/users/:id", authorize("admin"), getUser);
router.post("/users", authorize("admin"), createUser);
router.put("/users/:id", authorize("admin"), updateUser);
router.delete("/users/:id", authorize("admin"), deleteUser);
router.get("/users/:id/permissions", authorize("admin"), getUserPermissions);
router.put("/users/:id/permissions", authorize("admin"), updateUserPermissions);

// Role permissions management
router.get("/roles", authorize("admin"), getRolesList);
router.get("/roles/:roleName/permissions", authorize("admin"), getRolePermissions);
router.put("/roles/:roleName/permissions", authorize("admin"), updateRolePermissions);

export default router;
