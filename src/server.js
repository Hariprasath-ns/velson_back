import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import morgan from "morgan";
import { checkConnections } from "./config/db.js";
import userRoute from "./routes/userRoute.js";
import referenceMasterRoute from "./routes/referenceMasterRoute.js";
import referenceTypeRoute from "./routes/referenceTypeRoute.js";
import taxLedgerRoute from "./routes/taxLedgerRoute.js";
import taxMasterRoute from "./routes/taxMasterRoute.js";
import itemGroupMasterRoute from "./routes/itemGroupMasterRoute.js";
import prefixRoute from "./routes/prefixRoute.js";
import itemMasterRoute from "./routes/itemMasterRoute.js";

dotenv.config();
const app = express();

app.use(morgan("dev"));
app.use(express.json());
app.use(cors());

app.use("/api", userRoute);
app.use("/api", referenceMasterRoute);
app.use("/api", referenceTypeRoute);
app.use("/api", taxLedgerRoute);
app.use("/api", taxMasterRoute);
app.use("/api", itemGroupMasterRoute);
app.use("/api", prefixRoute);
app.use("/api", itemMasterRoute);

const PORT = process.env.PORT || 5000;

app.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`);
  await checkConnections();
});
