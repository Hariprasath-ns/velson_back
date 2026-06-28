import { fileURLToPath } from "url";
import path from "path";
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import morgan from "morgan";

import { checkConnections, neonPrisma, dockerPrisma } from "./config/db.js";
import { authenticate } from "./middlewares/auth.js";
import { requestIdMiddleware, logger } from "./utils/logger.js";
import { notFoundMiddleware } from "./middlewares/notFoundMiddleware.js";
import { errorMiddleware } from "./middlewares/errorMiddleware.js";
import { apiLimiter } from "./middlewares/rateLimiter.js";
import { authorizePermission } from "./middlewares/authorizePermission.js";
import { dbSelect } from "./middlewares/dbSelect.js";

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
import quotationSalesRoute from "./routes/quotationSalesRoute.js";
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
import serviceSpareRoute from "./routes/serviceSpareRoute.js";
import materialRequestRoute from "./routes/materialRequestRoute.js";
import partUsageListRoute from "./routes/partUsageListRoute.js";
import qcCheckMethodRoute from "./routes/qcCheckMethodRoute.js";
import systemInfoMasterRoute from "./routes/systemInfoMasterRoute.js";
import bomCreationRoute from "./routes/bomCreationRoute.js";
import jobCardRoute from "./routes/jobCardRoute.js";
import processMasterRoute from "./routes/processMasterRoute.js";
import customerComplaintRoute from "./routes/customerComplaintRoute.js";
import machineBreakdownRoute from "./routes/machineBreakdownRoute.js";
import materialIssueRoute from "./routes/materialIssueRoute.js";
import stockAdjustmentRoute from "./routes/stockAdjustmentRoute.js";
import notificationRoute from "./routes/notificationRoute.js";
import deliveryChallanRoute from "./routes/deliveryChallanRoute.js";
import outsourcePartsRoute from "./routes/outsourcePartsRoute.js";
import creditSalesRoute from "./routes/creditSalesRoute.js";
import serviceBillRoute from "./routes/serviceBillRoute.js";




dotenv.config();
const app = express();
const __dirname = path.dirname(fileURLToPath(import.meta.url));

app.use(requestIdMiddleware);
app.use(morgan("dev"));
app.use(express.json());
const allowedOrigins = (process.env.ALLOWED_ORIGINS || "")
  .split(",")
  .map(o => o.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (allowedOrigins.length === 0 || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);

// Rate limit all API requests
app.use("/api", apiLimiter);

// Public route — no token required
app.use("/api/auth", authRoute);

// Select DB globally
app.use("/api", dbSelect);

// All routes below this point require a valid JWT
app.use("/api", authenticate);

// Enforce module access permissions globally
app.use("/api", authorizePermission);

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
app.use("/api", quotationSalesRoute);
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
app.use("/api", serviceSpareRoute);
app.use("/api", materialRequestRoute);
app.use("/api", partUsageListRoute);
app.use("/api", qcCheckMethodRoute);
app.use("/api", systemInfoMasterRoute);
app.use("/api", bomCreationRoute);
app.use("/api", jobCardRoute);
app.use("/api", processMasterRoute);
app.use("/api", customerComplaintRoute);
app.use("/api", machineBreakdownRoute);
app.use("/api", materialIssueRoute);
app.use("/api", stockAdjustmentRoute);
app.use("/api", notificationRoute);
app.use("/api", deliveryChallanRoute);
app.use("/api", outsourcePartsRoute);
app.use("/api", creditSalesRoute);
app.use("/api", serviceBillRoute);




// 404 handler for unmatched routes
app.use(notFoundMiddleware);

// Centralized global error handling middleware (must be registered last)
app.use(errorMiddleware);


const PORT = process.env.PORT;

const server = app.listen(PORT, async () => {
  logger.info(`Server running on port ${PORT}`);
  await checkConnections();

  // Purge expired tokens from the blacklist every hour
  setInterval(async () => {
    try {
      const now = new Date();
      await Promise.allSettled([
        neonPrisma.tokenBlacklist.deleteMany({ where: { expiresAt: { lt: now } } }),
        dockerPrisma.tokenBlacklist.deleteMany({ where: { expiresAt: { lt: now } } }),
      ]);
    } catch (err) {
      logger.error("[Blacklist Purge] Error purging expired tokens", err);
    }
  }, 3600000);
});

// Initialize WebSockets and Event Bus subscribers
import { initSocket } from "./services/socketService.js";
import { initNotificationSubscriber } from "./services/notificationSubscriber.js";
import { initAuditSubscriber } from "./services/auditSubscriber.js";
import { initDashboardSubscriber } from "./services/dashboardSubscriber.js";

initSocket(server);
initNotificationSubscriber();
initAuditSubscriber();
initDashboardSubscriber();

// Process-level unhandled exception and rejection handlers
const gracefulShutdown = (signal, code = 0) => {
  logger.info(`Received ${signal}. Starting graceful shutdown...`);
  server.close(() => {
    logger.info("HTTP server closed.");
    process.exit(code);
  });

  // Timeout backup shutdown
  setTimeout(() => {
    logger.error("Could not close connections in time, forcefully shutting down", new Error("Graceful shutdown timeout"));
    process.exit(code);
  }, 10000);
};

process.on("unhandledRejection", (reason, promise) => {
  logger.error("Unhandled Rejection detected at Promise", reason instanceof Error ? reason : new Error(String(reason)));
  gracefulShutdown("unhandledRejection", 1);
});

process.on("uncaughtException", (error) => {
  logger.error("Uncaught Exception detected", error);
  gracefulShutdown("uncaughtException", 1);
});


