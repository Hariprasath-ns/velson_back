import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import morgan from "morgan";
import { checkConnections } from "./config/db.js";
import userRoute from "./routes/userRoute.js";

dotenv.config();
const app = express();

app.use(morgan("dev"));
app.use(express.json());
app.use(cors());

app.use("/api", userRoute);

const PORT = process.env.PORT || 5000;

app.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`);
  await checkConnections(); // logs each DB status, never crashes server
});
