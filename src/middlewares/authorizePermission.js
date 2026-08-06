import { ForbiddenError } from "./customErrors.js";
import { ErrorCodes } from "../utils/errorCodes.js";

const HIDDEN_FOR_STAFF = [
  "users",
  "reference-master",
  "system-info-master",
  "db-copy",
  "restore-db",
  "receipt-entry",
  "receipt-details",
  "voucher-entry",
  "day-report",
  "day-book",
  "ledger-balance",
  "monthly-ledger-balance",
  "outstanding-receipt-report",
  "payment-entry",
  "payment-details",
  "journal-entry",
];

const HIDDEN_FOR_USER = [
  ...HIDDEN_FOR_STAFF,
  "company-master", "employee-master", "ledger-group-master", "machine-master", "contractor-master", "process-master", "part-usage-list", "qc-check-method", "qc-inspection-char", "qc-standard-master", "auto-po",
  "part-number-base", "tax-ledger", "tax-master-menu", "item-group", "item-master",
  "supplier-master", "customer-master", "vehicle-master",
  "quotation-entry", "quotation-details", "marketing-log",
  "purchase-order", "purchase-order-details", "purchase-request", "print-purchase-request",
  "material-request", "print-material-request", "gate-entry", "gate-entry-report", "grn-entry", "grn-entry-report",
  "bom-creation", "customerwise-bom-report", "index-creation", "index-creation-report", "upload-bom", "main-index", "main-index-report", "view-model",
  "customer-complaint-entry", "ccms-entry-details", "dc-entry", "dc-details-report",
  "breakdown-approval-list", "nc-approval", "nc-job-created", "nc-dc-entry", "nc-dc-details",
  "barcode-details", "auto-job-entry", "service-job-entry-details", "conformation-list", "conformation-entry-details",
  "job-card-entry", "process-menu", "tech-auto-job", "view-job-status", "waiting-for-approval", "update-route-details", "process-completed", "mr-approval", "nc-job-created", "nc-approval", "ipr-approval", "job-qty-mismatch", "process-card-close", "job-qc-entry",
  "credit-sales", "sales-details", "quotation-sales", "quotation-details", "dc-sales", "dc-details", "service-bill-entry", "service-bill-details", "service-labour-bill-details", "temp-service-bill-details",
];

export const getModuleFromPath = (path) => {
  const cleanPath = path.split("?")[0].replace(/\/$/, "");
  
  if (cleanPath.startsWith("/api/company-master")) return "company-master";
  if (cleanPath.startsWith("/api/employee-master")) return "employee-master";
  if (cleanPath.startsWith("/api/ledger-group-master")) return "ledger-group-master";
  if (cleanPath.startsWith("/api/machine-master")) return "machine-master";
  if (cleanPath.startsWith("/api/contractor-master")) return "contractor-master";
  if (cleanPath.startsWith("/api/process-master")) return "process-master";
  
  if (cleanPath.startsWith("/api/reference-master")) {
    const parts = cleanPath.split("/");
    if (parts.length > 3) return null; // e.g. /api/reference-master/:type (dropdown utility)
    return "reference-master";
  }

  if (cleanPath.startsWith("/api/reference-type") || cleanPath.startsWith("/api/reference-types")) {
    const parts = cleanPath.split("/");
    if (parts.length > 3) return null; // e.g. /api/reference-types/values/:type (dropdown utility)
    return "reference-master";
  }

  if (cleanPath.startsWith("/api/part-usage-list")) return "part-usage-list";
  if (cleanPath.startsWith("/api/qc-check-method")) return "qc-check-method";
  if (cleanPath.startsWith("/api/qc-inspection-char")) return "qc-inspection-char";
  if (cleanPath.startsWith("/api/qc-standard-master")) return "qc-standard-master";
  if (cleanPath.startsWith("/api/auto-po")) return "auto-po";
  if (cleanPath.startsWith("/api/system-info-master")) return "system-info-master";
  if (cleanPath.startsWith("/api/db-copy")) return "db-copy";
  if (cleanPath.startsWith("/api/restore-db")) return "restore-db";
  
  if (cleanPath.startsWith("/api/part-number-base")) return "part-number-base";
  if (cleanPath.startsWith("/api/tax-ledger")) return "tax-ledger";
  if (cleanPath.startsWith("/api/tax-master")) return "tax-master-menu";
  if (cleanPath.startsWith("/api/tax-master")) return "tax-master-menu";
  if (cleanPath.startsWith("/api/item-group")) return "item-group";
  if (cleanPath.startsWith("/api/item-master")) {
    if (cleanPath.includes("/download-image") || cleanPath.includes("/download-pdf")) return null;
    return "item-master";
  }
  
  if (cleanPath.startsWith("/api/supplier-master")) return "supplier-master";
  if (cleanPath.startsWith("/api/customer-master")) return "customer-master";
  
  if (cleanPath.startsWith("/api/vehicle-master")) return "vehicle-master";
  if (cleanPath.startsWith("/api/service-booking")) return "booking-entry-new";
  if (cleanPath.startsWith("/api/service-detail")) return "service-details-entry";
  if (cleanPath.startsWith("/api/service-spare")) return "service-spare-entry";
  
  if (cleanPath.startsWith("/api/quotation")) return "quotation-entry";
  if (cleanPath.startsWith("/api/marketing-log")) return "marketing-log";
  
  if (cleanPath.startsWith("/api/purchase-request")) return "purchase-request";
  if (cleanPath.startsWith("/api/purchase-master")) {
    if (cleanPath.includes("/next-no")) return null;
    return "purchase-order";
  }
  
  if (cleanPath.startsWith("/api/gate-master")) {
    if (cleanPath.includes("/next-no")) return null;
    return "gate-entry";
  }
  if (cleanPath.startsWith("/api/grn-master")) return "grn-entry";
  if (cleanPath.startsWith("/api/material-request")) {
    if (cleanPath.includes("/next-no") || cleanPath.includes("/by-no")) return null;
    return "material-request";
  }
  
  if (cleanPath.startsWith("/api/receipt-entry")) return "receipt-entry";
  if (cleanPath.startsWith("/api/voucher-entry")) return "voucher-entry";
  
  if (cleanPath.startsWith("/api/bom-creation")) return "bom-creation";
  if (cleanPath.startsWith("/api/index-creation")) return "index-creation";
  if (cleanPath.startsWith("/api/customer-complaint")) return "customer-complaint-entry";
  if (cleanPath.startsWith("/api/machine-breakdown")) return "machine-breakdown";
  if (cleanPath.startsWith("/api/stock-adjustment")) return "stock-management";
  if (cleanPath.startsWith("/api/delivery-challan")) return "dc-entry";
  if (cleanPath.startsWith("/api/credit-sales")) return "credit-sales";
  if (cleanPath.startsWith("/api/service-bill")) return "service-bill-entry";

  
  if (cleanPath.startsWith("/api/material-issue")) return "material-issue";
  if (cleanPath.startsWith("/api/job-card")) {
    if (cleanPath.includes("/next-no")) return null;
    return "job-card-entry";
  }
  if (cleanPath.startsWith("/api/job-process-menu")) return "process-menu";
  if (cleanPath.startsWith("/api/generate-part-number")) return "part-number-base";
  if (cleanPath.startsWith("/api/categories")) return "part-number-base";
  if (cleanPath.startsWith("/api/subcategories")) return "part-number-base";
  if (cleanPath.startsWith("/api/prefixes")) return "item-group";
  if (cleanPath.startsWith("/api/vehicle-service-master")) return "vehicle-service-master";
  
  return null;
};

export const authorizePermission = async (req, res, next) => {
  try {
    const user = req.user;
    if (!user) {
      return next(); // Auth middleware handles non-authenticated
    }

    const roleUpper = (user.role || "").toUpperCase();

    if (roleUpper === "ADMIN" || user.id === 0) {
      return next(); // Admins bypass
    }

    const module = getModuleFromPath(req.baseUrl + req.path);
    if (!module) {
      return next(); // Non-configurable module (e.g. metadata options or utility endpoints)
    }

    // Determine the type of action requested
    // GET -> Display/Read
    // POST -> Save/Create
    // PUT/PATCH -> Edit/Update
    // DELETE -> Delete
    // Wait, print is handled at client side or download endpoints
    const method = req.method.toUpperCase();
    let actionKey = "canDisplay";
    if (method === "POST") actionKey = "canSave";
    if (method === "PUT" || method === "PATCH") actionKey = "canEdit";
    if (method === "DELETE") actionKey = "canDelete";
    
    // First check user-specific permission overrides (absolute priority)
    const userPerm = await req.db.userPermission.findUnique({
      where: {
        userId_module: {
          userId: user.id,
          module: module,
        },
      },
    });

    if (userPerm) {
      if (userPerm[actionKey]) {
        return next();
      }
      throw new ForbiddenError(`Forbidden: you do not have ${actionKey.slice(3).toLowerCase()} permission for ${module}`, ErrorCodes.FORBIDDEN);
    }

    // Check if user has role-based permissions configured in database
    const rolePerms = await req.db.rolePermission.findMany({
      where: { role: user.role },
    });

    if (rolePerms && rolePerms.length > 0) {
      const match = rolePerms.find((p) => p.module === module);
      if (match && match[actionKey]) {
        return next();
      }
      throw new ForbiddenError(`Forbidden: you do not have ${actionKey.slice(3).toLowerCase()} permission for ${module}`, ErrorCodes.FORBIDDEN);
    }

    // Fallback: Hybrid Access Policy (evaluate role restriction)
    if (roleUpper === "USER" || roleUpper === "STORE") {
      if (HIDDEN_FOR_USER.includes(module)) {
        if (module === "item-master" && method === "GET") {
          return next();
        }
        throw new ForbiddenError("Forbidden: insufficient permissions", ErrorCodes.FORBIDDEN);
      }
      return next();
    }
    if (roleUpper === "STAFF" || roleUpper === "ERP") {
      if (HIDDEN_FOR_STAFF.includes(module)) {
        throw new ForbiddenError("Forbidden: insufficient permissions", ErrorCodes.FORBIDDEN);
      }
      return next();
    }

    // For any other role, if no database permissions are configured, they are unauthorized by default
    throw new ForbiddenError("Forbidden: insufficient permissions", ErrorCodes.FORBIDDEN);
  } catch (err) {
    next(err);
  }
};
