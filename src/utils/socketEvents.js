export const SOCKET_EVENTS = {
  // Authentication
  USER_CREATED: "user.created",
  USER_UPDATED: "user.updated",
  USER_DELETED: "user.deleted",
  ROLE_UPDATED: "role.updated",
  PERMISSION_UPDATED: "permission.updated",

  // Item Master
  ITEM_CREATED: "item.created",
  ITEM_UPDATED: "item.updated",
  ITEM_DELETED: "item.deleted",
  ITEM_PRICE_UPDATED: "item.price.updated",

  // Purchase
  PURCHASE_REQUEST_CREATED: "purchase-request.created",
  PURCHASE_REQUEST_APPROVED: "purchase-request.approved",
  PURCHASE_ORDER_CREATED: "purchase-order.created",
  PURCHASE_ORDER_APPROVED: "purchase-order.approved",

  // GRN
  GRN_CREATED: "grn.created",
  GRN_UPDATED: "grn.updated",
  GRN_COMPLETED: "grn.completed",

  // Inventory
  STOCK_UPDATED: "stock.updated",
  STOCK_ADJUSTED: "stock.adjusted",
  STOCK_LOW: "stock.low",
  BARCODE_CREATED: "barcode.created",

  // Material
  MATERIAL_REQUEST_CREATED: "material-request.created",
  MATERIAL_REQUEST_APPROVED: "material-request.approved",
  MATERIAL_ISSUE_CREATED: "material-issue.created",

  // Production
  BOM_UPDATED: "bom.updated",
  JOBCARD_CREATED: "jobcard.created",
  JOBCARD_STARTED: "jobcard.started",
  JOBCARD_COMPLETED: "jobcard.completed",

  // Service
  SERVICE_CREATED: "service.created",
  SERVICE_UPDATED: "service.updated",
  SERVICE_COMPLETED: "service.completed",
  SERVICE_SPARE_UPDATED: "service-spare.updated",

  // Complaint
  COMPLAINT_CREATED: "complaint.created",
  COMPLAINT_ASSIGNED: "complaint.assigned",
  COMPLAINT_CLOSED: "complaint.closed",

  // Notifications
  NOTIFICATION_CREATED: "notification.created",
  NOTIFICATION_READ: "notification.read",

  // Machine Breakdown
  MACHINE_BREAKDOWN_CREATED: "machine-breakdown.created",
  MACHINE_BREAKDOWN_UPDATED: "machine-breakdown.updated",

  // Delivery Challan
  DELIVERY_CHALLAN_CREATED: "delivery-challan.created",
  
  // Service Bill Cancellation
  SERVICE_BILL_CANCEL_REQUESTED: "service-bill.cancel.requested",
  SERVICE_BILL_STATUS_UPDATED: "service-bill.status.updated",

  // Dashboard
  DASHBOARD_REFRESH: "dashboard.refresh"
};
