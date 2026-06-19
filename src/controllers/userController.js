import bcrypt from "bcryptjs";
import * as UserModel from "../models/userModel.js";
import { BadRequestError, UnauthorizedError, ForbiddenError, NotFoundError, ConflictError, ValidationError } from "../middelwares/customErrors.js";


export const getUsers = async (req, res) => {
  try {
    const users = await UserModel.getAllUsers(req.db);
    const mapped = users.map(u => ({
      ...u,
      role: u.credentials?.role || "user",
      isActive: u.credentials?.isActive ?? true,
    }));
    res.json({ db: req.dbName, data: mapped });
  } catch (err) {
    throw err;
  }
};

export const getUser = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const user = await UserModel.getUserById(req.db, id);
    if (!user) throw new NotFoundError("User not found");
    res.json({
      db: req.dbName,
      data: { ...user, role: user.credentials?.role || "user", isActive: user.credentials?.isActive ?? true },
    });
  } catch (err) {
    throw err;
  }
};

export const createUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password)
      throw new BadRequestError("name, email, and password required");

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await UserModel.createUser(req.db, { name, email, password: hashedPassword, role });
    res.status(201).json({
      db: req.dbName,
      data: {
        ...user,
        role: user.credentials?.role || "user",
        isActive: user.credentials?.isActive ?? true,
      },
    });
  } catch (err) {
    if (err.code === "P2002")
      throw new ConflictError("Email already exists");
    throw err;
  }
};

export const updateUser = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { name, email, password, role, isActive } = req.body;

    const targetUser = await UserModel.getUserById(req.db, id);
    if (!targetUser) throw new NotFoundError("User not found");

    const reqUserId = req.user?.id;
    const reqUserEmail = req.user?.email;
    const isSelfUpdate = (reqUserId !== undefined && Number(id) === Number(reqUserId)) || 
                         (reqUserEmail && targetUser.email === reqUserEmail);

    if (isSelfUpdate) {
      if (isActive === false) {
        throw new BadRequestError("You cannot deactivate your own account.");
      }
      if (role && role !== "admin") {
        throw new BadRequestError("You cannot change your own role from admin.");
      }
    }

    let hashedPassword;
    if (password) hashedPassword = await bcrypt.hash(password, 10);

    const user = await UserModel.updateUser(req.db, id, {
      name, email, password: hashedPassword, role, isActive,
    });
    res.json({
      db: req.dbName,
      data: {
        ...user,
        role: user.credentials?.role || "user",
        isActive: user.credentials?.isActive ?? true,
      },
    });
  } catch (err) {
    if (err.code === "P2025")
      throw new NotFoundError("User not found");
    throw err;
  }
};

export const deleteUser = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const targetUser = await UserModel.getUserById(req.db, id);
    if (!targetUser) throw new NotFoundError("User not found");

    const reqUserId = req.user?.id;
    const reqUserEmail = req.user?.email;
    const isSelfDelete = (reqUserId !== undefined && Number(id) === Number(reqUserId)) || 
                         (reqUserEmail && targetUser.email === reqUserEmail);

    if (isSelfDelete) {
      throw new BadRequestError("You cannot delete your own account.");
    }

    await UserModel.deleteUser(req.db, id);
    res.status(204).send();
  } catch (err) {
    if (err.code === "P2025")
      throw new NotFoundError("User not found");
    throw err;
  }
};

export const getUserPermissions = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const permissions = await UserModel.getUserPermissions(req.db, id);
    res.json({ success: true, data: permissions });
  } catch (err) {
    throw err;
  }
};

export const updateUserPermissions = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { permissions } = req.body;
    const updated = await UserModel.updateUserPermissions(req.db, id, permissions);
    res.json({ success: true, data: updated });
  } catch (err) {
    throw err;
  }
};

export const getRolePermissions = async (req, res) => {
  try {
    const { roleName } = req.params;
    const permissions = await UserModel.getRolePermissions(req.db, roleName);
    res.json({ success: true, data: permissions });
  } catch (err) {
    throw err;
  }
};

export const updateRolePermissions = async (req, res) => {
  try {
    const { roleName } = req.params;
    const { permissions } = req.body;
    const updated = await UserModel.updateRolePermissions(req.db, roleName, permissions);
    res.json({ success: true, data: updated });
  } catch (err) {
    throw err;
  }
};

export const getRolesList = async (req, res) => {
  try {
    const roles = [
      "ACCOUNTS",
      "ADMIN",
      "DEPT HEAD",
      "ERP",
      "MAINTENANCE",
      "MANAGER",
      "OPERATOR",
      "PRODUCTION",
      "PRODUCTION - SERVICE HEAD",
      "PURCHASE",
      "QUALITY",
      "Quotation Department",
      "SPARES",
      "STORE",
      "STORE HEAD",
      "STORE MATERIAL ISSUE",
      "SUPERVISOR",
      "TECHNICAL",
      "TECHNICAL HEAD"
    ];
    res.json({ success: true, data: roles });
  } catch (err) {
    throw err;
  }
};
