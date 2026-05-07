import * as UserModel from "../models/userModel.js";

export const getUsers = async (req, res) => {
  try {
    const users = await UserModel.getAllUsers(req.db);
    res.json({ db: req.dbName, data: users });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getUser = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const user = await UserModel.getUserById(req.db, id);
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json({ db: req.dbName, data: user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const createUser = async (req, res) => {
  try {
    const { name, email } = req.body;
    if (!name || !email)
      return res.status(400).json({ error: "name and email required" });
    const user = await UserModel.createUser(req.db, { name, email });
    res.status(201).json({ db: req.dbName, data: user });
  } catch (err) {
    if (err.code === "P2002")
      return res.status(409).json({ error: "Email already exists" });
    res.status(500).json({ error: err.message });
  }
};

export const updateUser = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { name, email } = req.body;
    const user = await UserModel.updateUser(req.db, id, { name, email });
    res.json({ db: req.dbName, data: user });
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
