import { fileURLToPath } from "url";
import path from "path";
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import morgan from "morgan";

import { checkConnections } from "./config/db.js";
import { authenticate } from "./middelwares/auth.js";

import authRoute from "./routes/authRoute.js";
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
import vehicleMasterRoute from "./routes/vehicleMasterRoute.js";
import quotationRoute from "./routes/quotationRoute.js";
import purchaseRequestRoute from "./routes/purchaseRequestRoute.js";
import purchaseMasterRoute from "./routes/purchaseMasterRoute.js";
import gateMasterRoute from "./routes/gateMasterRoute.js";
import grnMasterRoute from "./routes/grnMasterRoute.js";
import companyMasterRoute from "./routes/companyMasterRoute.js";
import employeeMasterRoute from "./routes/employeeMasterRoute.js";
import contractorMasterRoute from "./routes/contractorMasterRoute.js";
import machineMasterRoute from "./routes/machineMasterRoute.js";
import vehicleServiceMasterRoute from "./routes/vehicleServiceMasterRoute.js";
import serviceBookingRoute from "./routes/serviceBookingRoute.js";
import serviceDetailRoute from "./routes/serviceDetailRoute.js";
import materialRequestRoute from "./routes/materialRequestRoute.js";
import partUsageListRoute from "./routes/partUsageListRoute.js";
import qcCheckMethodRoute from "./routes/qcCheckMethodRoute.js";
import systemInfoMasterRoute from "./routes/systemInfoMasterRoute.js";

dotenv.config();
const app = express();
const __dirname = path.dirname(fileURLToPath(import.meta.url));

app.use(morgan("dev"));
app.use(express.json());
app.use(cors());

// Public route — no token required
app.use("/api/auth", authRoute);

// All routes below this point require a valid JWT
app.use("/api", authenticate);

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
app.use("/api", vehicleMasterRoute);
app.use("/api", quotationRoute);
app.use("/api", purchaseRequestRoute);
app.use("/api", purchaseMasterRoute);
app.use("/api", gateMasterRoute);
app.use("/api", grnMasterRoute);
app.use("/api", companyMasterRoute);
app.use("/api", employeeMasterRoute);
app.use("/api", contractorMasterRoute);
app.use("/api", machineMasterRoute);
app.use("/api", vehicleServiceMasterRoute);
app.use("/api", serviceBookingRoute);
app.use("/api", serviceDetailRoute);
app.use("/api", materialRequestRoute);
app.use("/api", partUsageListRoute);
app.use("/api", qcCheckMethodRoute);
app.use("/api", systemInfoMasterRoute);

const PORT = process.env.PORT || 5000;

app.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`);
  await checkConnections();
});
