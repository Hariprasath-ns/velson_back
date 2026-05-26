import bcrypt from "bcryptjs";
import * as UserModel from "../models/userModel.js";

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
    res.status(500).json({ error: err.message });
  }
};

export const getUser = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const user = await UserModel.getUserById(req.db, id);
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json({
      db: req.dbName,
      data: { ...user, role: user.credentials?.role || "user", isActive: user.credentials?.isActive ?? true },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const createUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password)
      return res.status(400).json({ error: "name, email, and password required" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await UserModel.createUser(req.db, { name, email, password: hashedPassword, role });
    res.status(201).json({ db: req.dbName, data: { ...user, role: user.credentials?.role } });
  } catch (err) {
    if (err.code === "P2002")
      return res.status(409).json({ error: "Email already exists" });
    res.status(500).json({ error: err.message });
  }
};

export const updateUser = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { name, email, password, role, isActive } = req.body;

    let hashedPassword;
    if (password) hashedPassword = await bcrypt.hash(password, 10);

    const user = await UserModel.updateUser(req.db, id, {
      name, email, password: hashedPassword, role, isActive,
    });
    res.json({ db: req.dbName, data: { ...user, role: user.credentials?.role } });
  } catch (err) {
    if (err.code === "P2025")
      return res.status(404).json({ error: "User not found" });
    res.status(500).json({ error: err.message });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await UserModel.deleteUser(req.db, id);
    res.status(204).send();
  } catch (err) {
    if (err.code === "P2025")
      return res.status(404).json({ error: "User not found" });
    res.status(500).json({ error: err.message });
  }
};
