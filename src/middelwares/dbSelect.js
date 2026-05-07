import { neonPrisma, dockerPrisma } from "../config/db.js";

export const dbSelect = (req, res, next) => {
  req.db = req.query.db === "neon" ? neonPrisma : dockerPrisma;
  req.dbName = req.query.db === "neon" ? "neon" : "docker";
  next();
};
