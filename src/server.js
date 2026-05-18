import { fileURLToPath } from "url";
import path from "path";
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
import categoryMasterRoute from "./routes/categoryMasterRoute.js";
import subCategoryMasterRoute from "./routes/subCategoryMasterRoute.js";
import partNumberBaseRoute from "./routes/partNumberBaseRoute.js";
import supplierMasterRoute from "./routes/supplierMasterRoute.js";
import customerMasterRoute from "./routes/customerMasterRoute.js";

dotenv.config();
const app = express();
const __dirname = path.dirname(fileURLToPath(import.meta.url));

app.use(morgan("dev"));
app.use(express.json());
app.use(cors());
app.use("/uploads", express.static(path.join(__dirname, "..", "uploads")));

app.use("/api", userRoute);
app.use("/api", referenceMasterRoute);
app.use("/api", referenceTypeRoute);
app.use("/api", taxLedgerRoute);
app.use("/api", taxMasterRoute);
app.use("/api", itemGroupMasterRoute);
app.use("/api", prefixRoute);
app.use("/api", itemMasterRoute);
app.use("/api", categoryMasterRoute);
app.use("/api", subCategoryMasterRoute);
app.use("/api", partNumberBaseRoute);
app.use("/api", supplierMasterRoute);
app.use("/api", customerMasterRoute);

const PORT = process.env.PORT || 5000;

app.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`);
  await checkConnections();
});
