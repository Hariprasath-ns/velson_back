import { neonPrisma, dockerPrisma } from "./src/config/db.js";
import dotenv from "dotenv";

dotenv.config();

const db = process.env.DB_ENV === "neon" ? neonPrisma : dockerPrisma;

const notificationConfigs = [
  // Authentication
  {
    event: "user.created",
    module: "Authentication",
    action: "created",
    titleTemplate: "User Account Created",
    messageTemplate: "User account for {{name}} ({{email}}) has been created.",
    description: "Triggers when a new user account is created."
  },
  {
    event: "user.updated",
    module: "Authentication",
    action: "updated",
    titleTemplate: "User Account Updated",
    messageTemplate: "User account details for {{name}} have been modified.",
    description: "Triggers when user details are modified."
  },
  {
    event: "user.deleted",
    module: "Authentication",
    action: "deleted",
    titleTemplate: "User Account Deleted",
    messageTemplate: "User account for {{name}} has been deleted.",
    description: "Triggers when a user account is deleted."
  },
  {
    event: "role.updated",
    module: "Authentication",
    action: "updated",
    titleTemplate: "Role Permissions Updated",
    messageTemplate: "System permissions for role {{role}} have been modified.",
    description: "Triggers when role-level permissions are updated."
  },
  {
    event: "permission.updated",
    module: "Authentication",
    action: "updated",
    titleTemplate: "User Custom Permissions Modified",
    messageTemplate: "Custom permission sets for {{name}} have been updated.",
    description: "Triggers when explicit user permissions are modified."
  },

  // Item Master
  {
    event: "item.created",
    module: "Item Master",
    action: "created",
    titleTemplate: "New Item Created",
    messageTemplate: "Item {{partNo}} - {{partName}} has been added to Item Master.",
    description: "Triggers when a new item is created in Item Master."
  },
  {
    event: "item.updated",
    module: "Item Master",
    action: "updated",
    titleTemplate: "Item Master Updated",
    messageTemplate: "Item details for {{partNo}} have been modified.",
    description: "Triggers when item details are updated."
  },
  {
    event: "item.deleted",
    module: "Item Master",
    action: "deleted",
    titleTemplate: "Item Deleted",
    messageTemplate: "Item {{partNo}} has been removed from Item Master.",
    description: "Triggers when an item is deleted."
  },
  {
    event: "item.price.updated",
    module: "Item Master",
    action: "price.updated",
    titleTemplate: "Item Price Adjusted",
    messageTemplate: "The unit purchase rate of item {{partNo}} has changed to ₹{{rate}}.",
    description: "Triggers when item purchase rate changes."
  },

  // Purchase
  {
    event: "purchase-request.created",
    module: "Purchase",
    action: "created",
    titleTemplate: "New Purchase Request Submited",
    messageTemplate: "Purchase request {{prNo}} has been submitted by {{createdBy}}.",
    description: "Triggers when a purchase request is submitted."
  },
  {
    event: "purchase-request.approved",
    module: "Purchase",
    action: "approved",
    titleTemplate: "Purchase Request Approved",
    messageTemplate: "Purchase request {{prNo}} has been approved.",
    description: "Triggers when a PR is approved."
  },
  {
    event: "purchase-order.created",
    module: "Purchase",
    action: "created",
    titleTemplate: "New Purchase Order Generated",
    messageTemplate: "Purchase order {{poNo}} has been created for supplier {{supplierName}}.",
    description: "Triggers when a PO is created."
  },
  {
    event: "purchase-order.approved",
    module: "Purchase",
    action: "approved",
    titleTemplate: "Purchase Order Approved",
    messageTemplate: "Purchase order {{poNo}} has been approved by {{approvedBy}}.",
    description: "Triggers when a PO is approved."
  },

  // GRN
  {
    event: "grn.created",
    module: "GRN",
    action: "created",
    titleTemplate: "Goods Receipt Note Created",
    messageTemplate: "GRN {{grnNo}} has been recorded for PO {{poNo}}.",
    description: "Triggers when GRN is created."
  },
  {
    event: "grn.updated",
    module: "GRN",
    action: "updated",
    titleTemplate: "GRN Modified",
    messageTemplate: "GRN details for {{grnNo}} have been updated.",
    description: "Triggers when a GRN is updated."
  },
  {
    event: "grn.completed",
    module: "GRN",
    action: "completed",
    titleTemplate: "GRN Verification Completed",
    messageTemplate: "GRN {{grnNo}} has been verified and stock successfully posted.",
    description: "Triggers when a GRN is completed/closed."
  },

  // Inventory
  {
    event: "stock.updated",
    module: "Inventory",
    action: "updated",
    titleTemplate: "Stock Qty Updated",
    messageTemplate: "Stock for part {{partNo}} updated. New Avail Qty: {{stockQty}}.",
    description: "Triggers when general stock balances are updated."
  },
  {
    event: "stock.adjusted",
    module: "Inventory",
    action: "adjusted",
    titleTemplate: "Stock Adjustment Recorded",
    messageTemplate: "Stock adjustment ({{type}}) of {{qty}} {{uom}} registered for part {{partNo}}.",
    description: "Triggers when a manual stock adjustment is recorded."
  },
  {
    event: "stock.low",
    module: "Inventory",
    action: "low",
    titleTemplate: "Warning: Low Stock Alert",
    messageTemplate: "Part {{partNo}} is below the reorder level. Available: {{stockQty}}, Min: {{minStock}}.",
    description: "Triggers when stock falls below reorder limits."
  },
  {
    event: "barcode.created",
    module: "Inventory",
    action: "created",
    titleTemplate: "Barcode Registered",
    messageTemplate: "New barcode {{barcode}} registered for item {{partNo}}.",
    description: "Triggers when new barcodes are registered."
  },

  // Material
  {
    event: "material-request.created",
    module: "Material",
    action: "created",
    titleTemplate: "Material Request Submitted",
    messageTemplate: "Material request {{mrNo}} created for department {{department}}.",
    description: "Triggers when a material request is submitted."
  },
  {
    event: "material-request.approved",
    module: "Material",
    action: "approved",
    titleTemplate: "Material Request Approved",
    messageTemplate: "Material request {{mrNo}} approved for dispatch.",
    description: "Triggers when an MR is approved."
  },
  {
    event: "material-issue.created",
    module: "Material",
    action: "created",
    titleTemplate: "Material Issued",
    messageTemplate: "Material issue {{issueNo}} completed for Job {{serviceJobNo}}.",
    description: "Triggers when materials are issued to a job."
  },

  // Production
  {
    event: "bom.updated",
    module: "Production",
    action: "updated",
    titleTemplate: "BOM Modified",
    messageTemplate: "Bill of Materials for assembly {{bomNo}} has been modified.",
    description: "Triggers when BOM is updated."
  },
  {
    event: "jobcard.created",
    module: "Production",
    action: "created",
    titleTemplate: "Job Card Issued",
    messageTemplate: "New Job Card {{jobNo}} created for model {{model}}.",
    description: "Triggers when a job card is created."
  },
  {
    event: "jobcard.started",
    module: "Production",
    action: "started",
    titleTemplate: "Job Card Processing Started",
    messageTemplate: "Job Card {{jobNo}} has transitioned into processing.",
    description: "Triggers when job card work starts."
  },
  {
    event: "jobcard.completed",
    module: "Production",
    action: "completed",
    titleTemplate: "Job Card Completed",
    messageTemplate: "Job Card {{jobNo}} has been successfully completed.",
    description: "Triggers when a job card is completed."
  },

  // Service
  {
    event: "service.created",
    module: "Service",
    action: "created",
    titleTemplate: "Service Job Booking Created",
    messageTemplate: "Service booking Job {{serviceJobNo}} created for vehicle {{vehicleNo}}.",
    description: "Triggers when a service job booking is created."
  },
  {
    event: "service.updated",
    module: "Service",
    action: "updated",
    titleTemplate: "Service Details Modified",
    messageTemplate: "Service details updated for Job {{serviceJobNo}}.",
    description: "Triggers when service details are modified."
  },
  {
    event: "service.completed",
    module: "Service",
    action: "completed",
    titleTemplate: "Service Job Completed",
    messageTemplate: "Service Job {{serviceJobNo}} has been marked as Completed.",
    description: "Triggers when a service job completes."
  },
  {
    event: "service-spare.updated",
    module: "Service",
    action: "updated",
    titleTemplate: "Service Spares List Updated",
    messageTemplate: "Spares request list updated for Service Job {{serviceJobNo}}.",
    description: "Triggers when service spares are modified."
  },

  // Complaint
  {
    event: "complaint.created",
    module: "Complaint",
    action: "created",
    titleTemplate: "New Customer Complaint Logged",
    messageTemplate: "Complaint {{ccNo}} has been logged for customer {{customerName}}.",
    description: "Triggers when a new customer complaint is received."
  },
  {
    event: "complaint.assigned",
    module: "Complaint",
    action: "assigned",
    titleTemplate: "Complaint Assigned",
    messageTemplate: "Customer complaint {{ccNo}} assigned to attender {{attenderName}}.",
    description: "Triggers when a complaint is assigned."
  },
  {
    event: "complaint.closed",
    module: "Complaint",
    action: "closed",
    titleTemplate: "Complaint Resolved",
    messageTemplate: "Customer complaint {{ccNo}} has been marked as Closed.",
    description: "Triggers when a complaint is resolved."
  }
];

async function seed() {
  console.log("Seeding NotificationConfig...");
  try {
    let created = 0;
    let skipped = 0;
    
    for (const config of notificationConfigs) {
      const existing = await db.notificationConfig.findUnique({
        where: { event: config.event }
      });
      
      if (!existing) {
        await db.notificationConfig.create({ data: config });
        console.log(`  [+] Created: ${config.event}`);
        created++;
      } else {
        // Update template fields just in case they changed
        await db.notificationConfig.update({
          where: { event: config.event },
          data: {
            titleTemplate: config.titleTemplate,
            messageTemplate: config.messageTemplate,
            module: config.module,
            action: config.action,
            description: config.description
          }
        });
        skipped++;
      }
    }
    
    console.log(`\nNotification configuration seed complete.`);
    console.log(`  Created: ${created}`);
    console.log(`  Updated/Skipped: ${skipped}`);
  } catch (err) {
    console.error("Error seeding notification configurations:", err);
    process.exit(1);
  } finally {
    await db.$disconnect();
  }
}

seed();
