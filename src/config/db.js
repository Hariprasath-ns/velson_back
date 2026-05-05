import pg from "pg";
import dotenv from "dotenv";

const { Pool } = pg

dotenv.config();

const pool = new Pool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT,
}); 

pool.on("connect", () => {
    console.log("Connected to the database");
});

export default pool;