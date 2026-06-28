import { neonPrisma, dockerPrisma } from "../config/db.js";

const defaultDb = process.env.DB_ENV === "neon" ? "neon" : "docker";

export const dbSelect = (req, res, next) => {
  const db = req.query.db || defaultDb;
  req.db = db === "neon" ? neonPrisma : dockerPrisma;
  req.dbName = db === "neon" ? "neon" : "docker";
  next();
};
