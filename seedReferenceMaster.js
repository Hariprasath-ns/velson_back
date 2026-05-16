import { neonPrisma, dockerPrisma } from "./src/config/db.js";
import dotenv from "dotenv";

dotenv.config();

const db = process.env.DB_ENV === "neon" ? neonPrisma : dockerPrisma;

const seedData = [
  // Account Type
  { referenceType: "Account Type", code: "001", description: "ACCOUNTS",        updatedBy: "ADMIN" },
  { referenceType: "Account Type", code: "002", description: "GODOWN",           updatedBy: "ADMIN" },
  { referenceType: "Account Type", code: "003", description: "LIABILITIES",      updatedBy: "ADMIN" },
  { referenceType: "Account Type", code: "004", description: "OTHER STAFF",      updatedBy: "ADMIN" },
  { referenceType: "Account Type", code: "005", description: "BANK COLLECTION",  updatedBy: "ADMIN" },
  
    // Vehicle_Type
    { referenceType: "Vehicle_Type", code: "001", description: "V2I",                         updatedBy: "admin" },
    { referenceType: "Vehicle_Type", code: "002", description: "V4",                          updatedBy: "admin" },
    { referenceType: "Vehicle_Type", code: "003", description: "V4I",                         updatedBy: "admin" },
    { referenceType: "Vehicle_Type", code: "004", description: "V7",                          updatedBy: "admin" },
    { referenceType: "Vehicle_Type", code: "005", description: "V3i",                         updatedBy: "admin" },
    { referenceType: "Vehicle_Type", code: "006", description: "V9",                          updatedBy: "admin" },
    { referenceType: "Vehicle_Type", code: "007", description: "VEDC",                        updatedBy: "Sales" },
    { referenceType: "Vehicle_Type", code: "008", description: "RC",                          updatedBy: "admin" },
    { referenceType: "Vehicle_Type", code: "009", description: "V10",                         updatedBy: "admin" },
    { referenceType: "Vehicle_Type", code: "010", description: "POWERPACK",                   updatedBy: "admin" },
    { referenceType: "Vehicle_Type", code: "011", description: "VELSON",                      updatedBy: "Sales" },
    { referenceType: "Vehicle_Type", code: "012", description: "Velson customer requirement", updatedBy: "ADMIN" },
    { referenceType: "Vehicle_Type", code: "014", description: "GRIPPER",                     updatedBy: "Sales" },
    { referenceType: "Vehicle_Type", code: "015", description: "GEARBOX",                     updatedBy: "ADMIN" },
    { referenceType: "Vehicle_Type", code: "017", description: "SAMP",                        updatedBy: "Sales" },
    { referenceType: "Vehicle_Type", code: "018", description: "COMMON",                      updatedBy: "ADMIN" },
    { referenceType: "Vehicle_Type", code: "020", description: "UNDERGROUND DRILL",           updatedBy: "admin" },
    { referenceType: "Vehicle_Type", code: "021", description: "Consumables",                 updatedBy: "ADMIN" },
    { referenceType: "Vehicle_Type", code: "022", description: "V3 XL",                       updatedBy: "Sales" },
    { referenceType: "Vehicle_Type", code: "023", description: "COMPRESSOR",                  updatedBy: "Sales" },
    { referenceType: "Vehicle_Type", code: "024", description: "EQUALIZER BEAM",              updatedBy: "Sales" },
    { referenceType: "Vehicle_Type", code: "025", description: "VEM",                         updatedBy: "Sales" },
    { referenceType: "Vehicle_Type", code: "026", description: "CORE DRILL",                  updatedBy: "ADMIN" },
    { referenceType: "Vehicle_Type", code: "027", description: "HDE",                         updatedBy: "Sales" },
    { referenceType: "Vehicle_Type", code: "029", description: "GRADE CONTROL MACHINE",       updatedBy: "admin" },
    { referenceType: "Vehicle_Type", code: "030", description: "MICROBLAST",                  updatedBy: "ADMIN" },
    { referenceType: "Vehicle_Type", code: "031", description: "MINICORE",                    updatedBy: "admin" },
    { referenceType: "Vehicle_Type", code: "032", description: "HD 300",                      updatedBy: "ADMIN" },
    { referenceType: "Vehicle_Type", code: "033", description: "AUTO JOB",                    updatedBy: "admin" },
    { referenceType: "Vehicle_Type", code: "034", description: "HMD",                         updatedBy: "sales" },
    { referenceType: "Vehicle_Type", code: "035", description: "MDD",                         updatedBy: "ADMIN" },
    { referenceType: "Vehicle_Type", code: "036", description: "V1",                          updatedBy: "Sales" },
  
    // Material_Grade
    { referenceType: "Material_Grade", code: "001", description: "MS",        updatedBy: "admin" },
    { referenceType: "Material_Grade", code: "002", description: "EN8",       updatedBy: "admin" },
    { referenceType: "Material_Grade", code: "003", description: "EN19",      updatedBy: "admin" },
    { referenceType: "Material_Grade", code: "004", description: "NYLON",     updatedBy: "admin" },
    { referenceType: "Material_Grade", code: "005", description: "BRASS",     updatedBy: "admin" },
    { referenceType: "Material_Grade", code: "006", description: "ALUMINIUM", updatedBy: "admin" },
    { referenceType: "Material_Grade", code: "007", description: "EN36",      updatedBy: "ADMIN" },
    { referenceType: "Material_Grade", code: "008", description: "EN31",      updatedBy: "ADMIN" },

  // Area
  { referenceType: "Area", code: "001", description: "Valasaravakkam",      updatedBy: "admin"    },
  { referenceType: "Area", code: "002", description: "Chennai",             updatedBy: "admin"    },
  { referenceType: "Area", code: "014", description: "Kanchipuram",         updatedBy: "admin"    },
  { referenceType: "Area", code: "015", description: "mannai",              updatedBy: "infac"    },
  { referenceType: "Area", code: "016", description: "COIMBATORE",          updatedBy: "purchase" },
  { referenceType: "Area", code: "017", description: "BANGALORE",           updatedBy: "purchase" },
  { referenceType: "Area", code: "018", description: "SANKARI",             updatedBy: "ACCOUNTS" },
  { referenceType: "Area", code: "019", description: "ASSAM",               updatedBy: "ACCOUNTS" },
  { referenceType: "Area", code: "020", description: "TIRUCHENGODE (TK)",   updatedBy: "ACCOUNTS" },
  { referenceType: "Area", code: "021", description: "NATRAMPALLY",         updatedBy: "ACCOUNTS" },
  { referenceType: "Area", code: "022", description: "VILLUPURAM",          updatedBy: "ACCOUNTS" },

  // Booking_Status
  { referenceType: "Booking_Status", code: "001", description: "BOOKING",    updatedBy: "ADMIN" },
  { referenceType: "Booking_Status", code: "002", description: "PRODUCTION", updatedBy: "ADMIN" },
  { referenceType: "Booking_Status", code: "003", description: "SERVICE",    updatedBy: "ADMIN" },
  { referenceType: "Booking_Status", code: "004", description: "SALES",      updatedBy: "ADMIN" },
  { referenceType: "Booking_Status", code: "005", description: "COMPLAINT",  updatedBy: "ADMIN" },
  { referenceType: "Booking_Status", code: "006", description: "R&D",        updatedBy: "admin" },

  // Booking_Vehicle_Name
  { referenceType: "Booking_Vehicle_Name", code: "001", description: "JCB",                      updatedBy: "ADMIN"    },
  { referenceType: "Booking_Vehicle_Name", code: "002", description: "TATA HITACHI 210",         updatedBy: "sales"    },
  { referenceType: "Booking_Vehicle_Name", code: "003", description: "KOBELCO",                  updatedBy: "quotation"},
  { referenceType: "Booking_Vehicle_Name", code: "004", description: "NEW CHASIS",               updatedBy: "quotation"},
  { referenceType: "Booking_Vehicle_Name", code: "005", description: "ECOMET",                   updatedBy: "quotation"},
  { referenceType: "Booking_Vehicle_Name", code: "006", description: "LEYLAND",                  updatedBy: "sales"    },
  { referenceType: "Booking_Vehicle_Name", code: "007", description: "LEYLAND CHASIS BS VI",     updatedBy: "sales"    },
  { referenceType: "Booking_Vehicle_Name", code: "008", description: "NEW FABRICATION",          updatedBy: "sales"    },
  { referenceType: "Booking_Vehicle_Name", code: "009", description: "FODDER FEEDER",            updatedBy: "sales"    },
  { referenceType: "Booking_Vehicle_Name", code: "010", description: "CUSTOMER OWN",             updatedBy: "sales"    },
  { referenceType: "Booking_Vehicle_Name", code: "011", description: "AMW",                      updatedBy: "Sales"    },
  { referenceType: "Booking_Vehicle_Name", code: "012", description: "TATA HITACHI 215",         updatedBy: "Sales"    },
  { referenceType: "Booking_Vehicle_Name", code: "013", description: "HYUNDAI 140",              updatedBy: "Sales"    },
  { referenceType: "Booking_Vehicle_Name", code: "014", description: "HYUNDAI",                  updatedBy: "sales"    },
  { referenceType: "Booking_Vehicle_Name", code: "015", description: "XCMG 210",                 updatedBy: "sales"    },
  { referenceType: "Booking_Vehicle_Name", code: "016", description: "TATA HITACHI 200",         updatedBy: "sales"    },
  { referenceType: "Booking_Vehicle_Name", code: "017", description: "SINO TRUCK",               updatedBy: "sales"    },
  { referenceType: "Booking_Vehicle_Name", code: "018", description: "HMD",                      updatedBy: "Sales"    },
  { referenceType: "Booking_Vehicle_Name", code: "019", description: "DOOSAN",                   updatedBy: "Sales"    },
  { referenceType: "Booking_Vehicle_Name", code: "020", description: "SANY",                     updatedBy: "Sales"    },
  { referenceType: "Booking_Vehicle_Name", code: "021", description: "WHEEL LOADER",             updatedBy: "Sales"    },
  { referenceType: "Booking_Vehicle_Name", code: "022", description: "TATA HITACHI 220",         updatedBy: "Sales"    },
  { referenceType: "Booking_Vehicle_Name", code: "023", description: "LIUGONG",                  updatedBy: "Sales"    },
  { referenceType: "Booking_Vehicle_Name", code: "024", description: "ACE",                      updatedBy: "sales"    },
  { referenceType: "Booking_Vehicle_Name", code: "025", description: "MAHINDRA",                 updatedBy: "sales"    },
  { referenceType: "Booking_Vehicle_Name", code: "026", description: "ESCORT",                   updatedBy: "sales"    },
  { referenceType: "Booking_Vehicle_Name", code: "027", description: "OM",                       updatedBy: "sales"    },
  { referenceType: "Booking_Vehicle_Name", code: "028", description: "MAN",                      updatedBy: "sales"    },
  { referenceType: "Booking_Vehicle_Name", code: "029", description: "HYUNDAI 215",              updatedBy: "sales"    },
  { referenceType: "Booking_Vehicle_Name", code: "030", description: "RESEARCH AND DEVELOPMENT", updatedBy: "DESIGN01" },
  { referenceType: "Booking_Vehicle_Name", code: "031", description: "Compressor",               updatedBy: "sales"    },
  { referenceType: "Booking_Vehicle_Name", code: "032", description: "TATA HITACHI 370",         updatedBy: "sales"    },

  // Breakdown_Email  (codes 002 and 003 are intentionally absent per source data)
  { referenceType: "Breakdown_Email", code: "001", description: "itsupport@greatooindia.com", updatedBy: "admin" },
  { referenceType: "Breakdown_Email", code: "004", description: "puresh@greatooindia.com",    updatedBy: "ADMIN" },
  { referenceType: "Breakdown_Email", code: "005", description: "knapan@greatooindia.com",    updatedBy: "ADMIN" },
  { referenceType: "Breakdown_Email", code: "006", description: "eraghu@greatooindia.com",    updatedBy: "ADMIN" },
  { referenceType: "Breakdown_Email", code: "007", description: "wujinlang@greatooindia.com", updatedBy: "ADMIN" },

  // Currency
  { referenceType: "Currency", code: "001", description: "INR", updatedBy: "admin" },
  { referenceType: "Currency", code: "002", description: "CNY", updatedBy: "admin" },

  // DC_Type
  { referenceType: "DC_Type", code: "001", description: "RETURNABLE",          updatedBy: "ADMIN" },
  { referenceType: "DC_Type", code: "002", description: "NON RETURNBLE",        updatedBy: "ADMIN" },
  { referenceType: "DC_Type", code: "003", description: "JOB WORK",             updatedBy: "ADMIN" },
  { referenceType: "DC_Type", code: "004", description: "HEAT TREATMENT",       updatedBy: "ADMIN" },
  { referenceType: "DC_Type", code: "005", description: "REWORK",               updatedBy: "ADMIN" },
  { referenceType: "DC_Type", code: "006", description: "SAMPLE",               updatedBy: "ADMIN" },
  { referenceType: "DC_Type", code: "007", description: "PRODUCTION MATERIAL",  updatedBy: "ADMIN" },

  // Freight
  { referenceType: "Freight", code: "001", description: "Freight Inward",                  updatedBy: "admin" },
  { referenceType: "Freight", code: "002", description: "Freight Outward",                 updatedBy: "admin" },
  { referenceType: "Freight", code: "003", description: "Gas cutting Charges",             updatedBy: "admin" },
  { referenceType: "Freight", code: "004", description: "Packing and forwarding charges",  updatedBy: "ADMIN" },
  { referenceType: "Freight", code: "005", description: "ACCOMMODATION CHARGES",           updatedBy: "ADMIN" },
  { referenceType: "Freight", code: "006", description: "FARE CHARGES",                    updatedBy: "ADMIN" },
  { referenceType: "Freight", code: "007", description: "TESTING CHARGES",                 updatedBy: "ADMIN" },
  { referenceType: "Freight", code: "008", description: "HANDLING CHARGES",                updatedBy: "ADMIN" },
  { referenceType: "Freight", code: "009", description: "OTHERS",                          updatedBy: "ADMIN" },

  // Designation
  { referenceType: "Designation", code: "001", description: "STAFF",     updatedBy: "admin" },
  { referenceType: "Designation", code: "002", description: "OPERATORS", updatedBy: "admin" },
  { referenceType: "Designation", code: "003", description: "TRAINEE",   updatedBy: "admin" },
  { referenceType: "Designation", code: "004", description: "Helper",    updatedBy: "admin" },
  { referenceType: "Designation", code: "005", description: "INCHARGE",  updatedBy: "admin" },

  // Department  (codes start at 2 per source data)
  { referenceType: "Department", code: "2",  description: "ACCOUNTS",              updatedBy: "admin" },
  { referenceType: "Department", code: "3",  description: "MARKETING",             updatedBy: "admin" },
  { referenceType: "Department", code: "4",  description: "PURCHASE",              updatedBy: "admin" },
  { referenceType: "Department", code: "5",  description: "PLANNING",              updatedBy: "admin" },
  { referenceType: "Department", code: "6",  description: "DRAWING",               updatedBy: "admin" },
  { referenceType: "Department", code: "7",  description: "ELECTRICAL",            updatedBy: "admin" },
  { referenceType: "Department", code: "8",  description: "CNC GAS CUTTING",       updatedBy: "admin" },
  { referenceType: "Department", code: "9",  description: "CNC",                   updatedBy: "admin" },
  { referenceType: "Department", code: "10", description: "CONVENTIONAL",          updatedBy: "admin" },
  { referenceType: "Department", code: "11", description: "STORE & ACCOUNTS",      updatedBy: "ADMIN" },
  { referenceType: "Department", code: "12", description: "CUTTING & BENDING",     updatedBy: "admin" },
  { referenceType: "Department", code: "13", description: "FABRICATION",           updatedBy: "admin" },
  { referenceType: "Department", code: "14", description: "QUALITY",               updatedBy: "admin" },
  { referenceType: "Department", code: "15", description: "ASSEMBLY",              updatedBy: "admin" },
  { referenceType: "Department", code: "16", description: "HYDRAULIC",             updatedBy: "admin" },
  { referenceType: "Department", code: "17", description: "ENVIRONMENT MANAGER",   updatedBy: "admin" },
  { referenceType: "Department", code: "18", description: "OUT SOURCE",            updatedBy: "admin" },
  { referenceType: "Department", code: "19", description: "PA(OWNER)",             updatedBy: "admin" },
  { referenceType: "Department", code: "20", description: "OFFICE",               updatedBy: "admin" },
  { referenceType: "Department", code: "21", description: "APPLICATION ENGINEER",  updatedBy: "admin" },
  { referenceType: "Department", code: "22", description: "STORE",                 updatedBy: "admin" },
  { referenceType: "Department", code: "23", description: "TRANSPORT",             updatedBy: "admin" },
  { referenceType: "Department", code: "24", description: "CONTRACTOR",            updatedBy: "admin" },
  { referenceType: "Department", code: "25", description: "PARCEL",               updatedBy: "admin" },
  { referenceType: "Department", code: "26", description: "ADMIN",                 updatedBy: "admin" },
  { referenceType: "Department", code: "27", description: "V4i",                   updatedBy: "admin" },
  { referenceType: "Department", code: "28", description: "V7",                    updatedBy: "admin" },
  { referenceType: "Department", code: "29", description: "V5i",                   updatedBy: "admin" },
  { referenceType: "Department", code: "30", description: "V9",                    updatedBy: "admin" },
  { referenceType: "Department", code: "31", description: "V10",                   updatedBy: "admin" },
  { referenceType: "Department", code: "32", description: "CORE",                  updatedBy: "admin" },
  { referenceType: "Department", code: "33", description: "RC",                    updatedBy: "admin" },

  // Item Category
  { referenceType: "Item Category", code: "001", description: "CONTROLED",     updatedBy: "admin" },
  { referenceType: "Item Category", code: "002", description: "NON CONTROLED", updatedBy: "admin" },
  { referenceType: "Item Category", code: "003", description: "MARKETING",     updatedBy: "admin" },

  // Item Expiry
  { referenceType: "Item Expiry", code: "001", description: "CONTROLED",     updatedBy: "admin" },
  { referenceType: "Item Expiry", code: "002", description: "NON CONTROLED", updatedBy: "admin" },
  { referenceType: "Item Expiry", code: "003", description: "MARKETING",     updatedBy: "admin" },

  // Item Lock
  { referenceType: "Item Lock", code: "001", description: "RM",        updatedBy: "a" },
  { referenceType: "Item Lock", code: "002", description: "Component", updatedBy: "a" },

  // Item Type  (codes 008, 009 intentionally absent per source data)
  { referenceType: "Item Type", code: "001", description: "FG",                         updatedBy: "admin" },
  { referenceType: "Item Type", code: "002", description: "Assembly FG",                updatedBy: "admin" },
  { referenceType: "Item Type", code: "003", description: "Main Assembly FG",           updatedBy: "admin" },
  { referenceType: "Item Type", code: "004", description: "Sub Assembly FG",            updatedBy: "admin" },
  { referenceType: "Item Type", code: "005", description: "RM Plant & Machinery",       updatedBy: "admin" },
  { referenceType: "Item Type", code: "006", description: "Raw Material - Import",      updatedBy: "admin" },
  { referenceType: "Item Type", code: "007", description: "Raw Material - Domestic",    updatedBy: "admin" },
  { referenceType: "Item Type", code: "010", description: "Printing & Stationary",      updatedBy: "admin" },
  { referenceType: "Item Type", code: "011", description: "Staff Welfare",              updatedBy: "admin" },
  { referenceType: "Item Type", code: "012", description: "Office Maintainance",        updatedBy: "admin" },
  { referenceType: "Item Type", code: "013", description: "Asset",                      updatedBy: "admin" },
  { referenceType: "Item Type", code: "014", description: "RM Electricals",             updatedBy: "admin" },
  { referenceType: "Item Type", code: "015", description: "Product",                    updatedBy: "admin" },
  { referenceType: "Item Type", code: "016", description: "Venting Pin",                updatedBy: "admin" },
  { referenceType: "Item Type", code: "017", description: "Fixing Screw",               updatedBy: "admin" },
  { referenceType: "Item Type", code: "018", description: "Child Part",                 updatedBy: "admin" },
  { referenceType: "Item Type", code: "019", description: "Fastner",                    updatedBy: "admin" },

  // JOB_Email
  { referenceType: "JOB_Email", code: "001", description: "purchase.velson@gmail.com", updatedBy: "admin" },
  { referenceType: "JOB_Email", code: "002", description: "design.velson@gmail.com",   updatedBy: "admin" },
  { referenceType: "JOB_Email", code: "003", description: "finance.velson@gmail.com",  updatedBy: "admin" },
  { referenceType: "JOB_Email", code: "004", description: "sales.velson@gmail.com",    updatedBy: "admin" },

  // Ledger Type
  { referenceType: "Ledger Type", code: "001", description: "purchase.velson@gmail.com", updatedBy: "admin" },
  { referenceType: "Ledger Type", code: "002", description: "design.velson@gmail.com",   updatedBy: "admin" },

  // Line
  { referenceType: "Line", code: "001", description: "Line1", updatedBy: "infac" },
  { referenceType: "Line", code: "002", description: "Line2", updatedBy: "infac" },
  { referenceType: "Line", code: "003", description: "Line3", updatedBy: "infac" },

  // Machine Category  (code 001 absent; codes 021-023 absent per source data)
  { referenceType: "Machine Category", code: "002", description: "VMC",               updatedBy: "admin" },
  { referenceType: "Machine Category", code: "003", description: "LATHE",             updatedBy: "admin" },
  { referenceType: "Machine Category", code: "004", description: "HMC",               updatedBy: "admin" },
  { referenceType: "Machine Category", code: "005", description: "CNC-TURNING",       updatedBy: "admin" },
  { referenceType: "Machine Category", code: "006", description: "MILLING",           updatedBy: "admin" },
  { referenceType: "Machine Category", code: "007", description: "SLOTTING",          updatedBy: "admin" },
  { referenceType: "Machine Category", code: "008", description: "TAPPING",           updatedBy: "admin" },
  { referenceType: "Machine Category", code: "009", description: "DRILLING",          updatedBy: "admin" },
  { referenceType: "Machine Category", code: "010", description: "CUTTING",           updatedBy: "admin" },
  { referenceType: "Machine Category", code: "011", description: "HYDRAULIC SHERING", updatedBy: "admin" },
  { referenceType: "Machine Category", code: "012", description: "MANUAL CHECKING",   updatedBy: "ADMIN" },
  { referenceType: "Machine Category", code: "013", description: "SETTING",           updatedBy: "ADMIN" },
  { referenceType: "Machine Category", code: "014", description: "OUTSOURCE",         updatedBy: "ADMIN" },
  { referenceType: "Machine Category", code: "015", description: "TOOL GRINDING",     updatedBy: "ADMIN" },
  { referenceType: "Machine Category", code: "016", description: "BANDSAW CUTTING",   updatedBy: "ADMIN" },
  { referenceType: "Machine Category", code: "017", description: "SHEARING",          updatedBy: "ADMIN" },
  { referenceType: "Machine Category", code: "018", description: "DRO",               updatedBy: "ADMIN" },
  { referenceType: "Machine Category", code: "019", description: "GAS CUTTING",       updatedBy: "ADMIN" },
  { referenceType: "Machine Category", code: "020", description: "SHEET CUTTING",     updatedBy: "ADMIN" },
  { referenceType: "Machine Category", code: "024", description: "PRESSING MACHINE",  updatedBy: "ADMIN" },
  { referenceType: "Machine Category", code: "025", description: "LASER CUTTING",     updatedBy: "ADMIN" },

  // Material_Req_For  (code 001 absent per source data)
  { referenceType: "Material_Req_For", code: "002", description: "PRODUCTION", updatedBy: "ADMIN" },
  { referenceType: "Material_Req_For", code: "003", description: "EN8",        updatedBy: "admin" },
  { referenceType: "Material_Req_For", code: "004", description: "EN19",       updatedBy: "admin" },
  { referenceType: "Material_Req_For", code: "005", description: "NYLON",      updatedBy: "admin" },
  { referenceType: "Material_Req_For", code: "006", description: "BRASS",      updatedBy: "admin" },

  // Material_Type  (code 003 absent per source data)
  { referenceType: "Material_Type", code: "001", description: "SHAFT",              updatedBy: "admin" },
  { referenceType: "Material_Type", code: "002", description: "BAR",               updatedBy: "admin" },
  { referenceType: "Material_Type", code: "004", description: "PLATE",             updatedBy: "admin" },
  { referenceType: "Material_Type", code: "005", description: "SHEET",             updatedBy: "admin" },
  { referenceType: "Material_Type", code: "006", description: "BUSH PIPE",         updatedBy: "admin" },
  { referenceType: "Material_Type", code: "007", description: "PATTA",             updatedBy: "admin" },
  { referenceType: "Material_Type", code: "008", description: "SQUARE PIPE",       updatedBy: "admin" },
  { referenceType: "Material_Type", code: "009", description: "RECTANGULAR PIPE",  updatedBy: "admin" },
  { referenceType: "Material_Type", code: "010", description: "ERW PIPE",          updatedBy: "admin" },
  { referenceType: "Material_Type", code: "011", description: "SEAMLESS PIPE",     updatedBy: "admin" },
  { referenceType: "Material_Type", code: "012", description: "C CLASS PIPE",      updatedBy: "admin" },
  { referenceType: "Material_Type", code: "013", description: "L ANGLE",           updatedBy: "admin" },
  { referenceType: "Material_Type", code: "014", description: "C CHANNEL",         updatedBy: "admin" },
  { referenceType: "Material_Type", code: "015", description: "HEXANAL",           updatedBy: "admin" },
  { referenceType: "Material_Type", code: "016", description: "ROUGH BAR",         updatedBy: "ADMIN" },
  { referenceType: "Material_Type", code: "017", description: "ROUGH SHAFT",       updatedBy: "ADMIN" },
  { referenceType: "Material_Type", code: "018", description: "POLISH BAR",        updatedBy: "ADMIN" },
  { referenceType: "Material_Type", code: "019", description: "I-BEAM",            updatedBy: "ADMIN" },
  { referenceType: "Material_Type", code: "020", description: "PIPE",              updatedBy: "ADMIN" },
  { referenceType: "Material_Type", code: "021", description: "ROUGH PIPE",        updatedBy: "ADMIN" },
  { referenceType: "Material_Type", code: "022", description: "UM BAR",            updatedBy: "ADMIN" },

  // OUTSOURCE_STATUS_TYPE
  { referenceType: "OUTSOURCE_STATUS_TYPE", code: "001", description: "Approval",   updatedBy: "admin" },
  { referenceType: "OUTSOURCE_STATUS_TYPE", code: "002", description: "Rejection",  updatedBy: "admin" },
  { referenceType: "OUTSOURCE_STATUS_TYPE", code: "003", description: "Cancel",     updatedBy: "admin" },

  // OUTSOURCE_TYPE
  { referenceType: "OUTSOURCE_TYPE", code: "001", description: "Approval",  updatedBy: "admin" },
  { referenceType: "OUTSOURCE_TYPE", code: "002", description: "Rejection", updatedBy: "admin" },
  { referenceType: "OUTSOURCE_TYPE", code: "003", description: "Cancel",    updatedBy: "admin" },

  // PAYMODE
  { referenceType: "PAYMODE", code: "001", description: "CASH",   updatedBy: "admin" },
  { referenceType: "PAYMODE", code: "002", description: "CREDIT", updatedBy: "admin" },

  // PO Status
  { referenceType: "PO Status", code: "001", description: "Yes",      updatedBy: "admin" },
  { referenceType: "PO Status", code: "002", description: "Approval", updatedBy: "admin" },

  // PO Type
  { referenceType: "PO Type", code: "001", description: "Service Order",  updatedBy: "Admin" },
  { referenceType: "PO Type", code: "002", description: "Purchase Order", updatedBy: "Admin" },
  { referenceType: "PO Type", code: "003", description: "Auto PO",        updatedBy: "admin" },

  // Print_Copy
  { referenceType: "Print_Copy", code: "001", description: "ORIGINAL COPY",   updatedBy: "ADMIN" },
  { referenceType: "Print_Copy", code: "002", description: "DUPLICATE COPY",  updatedBy: "ADMIN" },
  { referenceType: "Print_Copy", code: "003", description: "TRIPLICATE COPY", updatedBy: "ADMIN" },
  { referenceType: "Print_Copy", code: "004", description: "TRANSPORT COPY",  updatedBy: "ADMIN" },

  // Priority
  { referenceType: "Priority", code: "001", description: "P5", updatedBy: "ADMIN" },
  { referenceType: "Priority", code: "002", description: "P0", updatedBy: "ADMIN" },
  { referenceType: "Priority", code: "003", description: "P1", updatedBy: "ADMIN" },
  { referenceType: "Priority", code: "004", description: "P2", updatedBy: "ADMIN" },
  { referenceType: "Priority", code: "005", description: "P3", updatedBy: "ADMIN" },
  { referenceType: "Priority", code: "006", description: "P4", updatedBy: "ADMIN" },

  // Process_Type
  { referenceType: "Process_Type", code: "001", description: "GAS CUTTING",      updatedBy: "ADMIN" },
  { referenceType: "Process_Type", code: "002", description: "SIDE GAS CUTTING", updatedBy: "ADMIN" },
  { referenceType: "Process_Type", code: "003", description: "WELDING",          updatedBy: "ADMIN" },
  { referenceType: "Process_Type", code: "004", description: "VMC-CNC",          updatedBy: "ADMIN" },
  { referenceType: "Process_Type", code: "005", description: "MILLING",          updatedBy: "ADMIN" },
  { referenceType: "Process_Type", code: "006", description: "STORE",            updatedBy: "ADMIN" },
  { referenceType: "Process_Type", code: "007", description: "DRILLING",         updatedBy: "ADMIN" },
  { referenceType: "Process_Type", code: "008", description: "BANDSAW CUTTING",  updatedBy: "ADMIN" },
  { referenceType: "Process_Type", code: "009", description: "SHEARING",         updatedBy: "ADMIN" },
  { referenceType: "Process_Type", code: "010", description: "GRINDING",         updatedBy: "ADMIN" },
  { referenceType: "Process_Type", code: "011", description: "BEND CHECK",       updatedBy: "ADMIN" },
  { referenceType: "Process_Type", code: "012", description: "LATHE",            updatedBy: "ADMIN" },
  { referenceType: "Process_Type", code: "013", description: "DRO",              updatedBy: "admin" },
  { referenceType: "Process_Type", code: "014", description: "SLOTING",          updatedBy: "ADMIN" },
  { referenceType: "Process_Type", code: "015", description: "TURNING-CNC",      updatedBy: "ADMIN" },

  // QC_STATUS
  { referenceType: "QC_STATUS", code: "001", description: "QC REJECT", updatedBy: "ADMIN" },
  { referenceType: "QC_STATUS", code: "002", description: "QC REWORK", updatedBy: "ADMIN" },
  { referenceType: "QC_STATUS", code: "003", description: "QC OK",     updatedBy: "ADMIN" },
  { referenceType: "QC_STATUS", code: "004", description: "SCRAB",     updatedBy: "ADMIN" },

  // GRN_Inward_Type
  { referenceType: "GRN_Inward_Type", code: "001", description: "EXPORT", updatedBy: "admin" },
  { referenceType: "GRN_Inward_Type", code: "002", description: "IMPORT", updatedBy: "admin" },

  // Discount Type
  { referenceType: "Discount Type", code: "001", description: "Bag",  updatedBy: "admin" },
  { referenceType: "Discount Type", code: "002", description: "Qty",  updatedBy: "admin" },
  { referenceType: "Discount Type", code: "003", description: "Rate", updatedBy: "admin" },

  // Form
  { referenceType: "Form", code: "001", description: "Mat_Req",   updatedBy: "admin" },
  { referenceType: "Form", code: "002", description: "Pur_Req",   updatedBy: "admin" },
  { referenceType: "Form", code: "003", description: "Ser_Req",   updatedBy: "admin" },
  { referenceType: "Form", code: "004", description: "Pur_Order", updatedBy: "admin" },
  { referenceType: "Form", code: "005", description: "Quotation", updatedBy: "admin" },

  // QC_Type
  { referenceType: "QC_Type", code: "001", description: "QUALITY", updatedBy: "admin" },
  { referenceType: "QC_Type", code: "002", description: "STORE",   updatedBy: "admin" },

  // Quotation_confirmed_Status
  { referenceType: "Quotation_confirmed_Status", code: "001", description: "CONFIRMED", updatedBy: "admin" },
  { referenceType: "Quotation_confirmed_Status", code: "002", description: "CANCEL",    updatedBy: "admin" },

  // Spare_Issue_Type
  { referenceType: "Spare_Issue_Type", code: "001", description: "Production",         updatedBy: "admin" },
  { referenceType: "Spare_Issue_Type", code: "002", description: "Service",            updatedBy: "admin" },
  { referenceType: "Spare_Issue_Type", code: "003", description: "Site",               updatedBy: "ADMIN" },
  { referenceType: "Spare_Issue_Type", code: "004", description: "Assemble",           updatedBy: "ADMIN" },
  { referenceType: "Spare_Issue_Type", code: "005", description: "Sales",              updatedBy: "ADMIN" },
  { referenceType: "Spare_Issue_Type", code: "006", description: "Velson Maintenance", updatedBy: "ADMIN" },
  { referenceType: "Spare_Issue_Type", code: "007", description: "Warranty",           updatedBy: "ADMIN" },
  { referenceType: "Spare_Issue_Type", code: "008", description: "Job work",           updatedBy: "ADMIN" },
  { referenceType: "Spare_Issue_Type", code: "009", description: "Drawing",            updatedBy: "ADMIN" },
  { referenceType: "Spare_Issue_Type", code: "010", description: "CNC",               updatedBy: "ADMIN" },
  { referenceType: "Spare_Issue_Type", code: "011", description: "Electrical",         updatedBy: "ADMIN" },

  // State
  { referenceType: "State", code: "001", description: "Production",         updatedBy: "admin" },
  { referenceType: "State", code: "002", description: "Service",            updatedBy: "ADMIN" },
  { referenceType: "State", code: "003", description: "Site",               updatedBy: "ADMIN" },
  { referenceType: "State", code: "004", description: "Assemble",           updatedBy: "ADMIN" },
  { referenceType: "State", code: "005", description: "Sales",              updatedBy: "ADMIN" },
  { referenceType: "State", code: "006", description: "Velson Maintenance", updatedBy: "ADMIN" },
  { referenceType: "State", code: "007", description: "Warranty",           updatedBy: "ADMIN" },
  { referenceType: "State", code: "008", description: "Job work",           updatedBy: "ADMIN" },
  { referenceType: "State", code: "009", description: "Drawing",            updatedBy: "ADMIN" },

  // Status  (alpha codes)
  { referenceType: "Status", code: "A", description: "Active",   updatedBy: "admin" },
  { referenceType: "Status", code: "D", description: "Inactive", updatedBy: "admin" },

  // Store
  { referenceType: "Store", code: "001", description: "STORE 1- MAINSTORE",       updatedBy: "admin" },
  { referenceType: "Store", code: "002", description: "STORE 2-GAS CUTTING",      updatedBy: "ADMIN" },
  { referenceType: "Store", code: "003", description: "STORE 3- SHEET METAL",     updatedBy: "ADMIN" },
  { referenceType: "Store", code: "004", description: "STORE 4-BANDSAW CUTTING",  updatedBy: "ADMIN" },

  // Sub Group  (code 004 absent per source data)
  { referenceType: "Sub Group", code: "001", description: "Import",     updatedBy: "a"     },
  { referenceType: "Sub Group", code: "002", description: "Purchase",   updatedBy: "a"     },
  { referenceType: "Sub Group", code: "003", description: "Production", updatedBy: "ADMIN" },
  { referenceType: "Sub Group", code: "005", description: "QUOTATION",  updatedBy: "Sales" },
  { referenceType: "Sub Group", code: "006", description: "Outsource",  updatedBy: "admin" },

  // Tax Type
  { referenceType: "Tax Type", code: "001", description: "LOCAL", updatedBy: "admin" },
  { referenceType: "Tax Type", code: "002", description: "INTER", updatedBy: "admin" },

  // Team  (codes 007-024 and 040 absent per source data)
  { referenceType: "Team", code: "001", description: "Raw",                updatedBy: "admin" },
  { referenceType: "Team", code: "002", description: "QC",                 updatedBy: "admin" },
  { referenceType: "Team", code: "003", description: "Conventional",       updatedBy: "admin" },
  { referenceType: "Team", code: "004", description: "CNC",                updatedBy: "admin" },
  { referenceType: "Team", code: "005", description: "Sheet Metal",        updatedBy: "ADMIN" },
  { referenceType: "Team", code: "006", description: "Fabrication",        updatedBy: "ADMIN" },
  { referenceType: "Team", code: "025", description: "Store",              updatedBy: "admin" },
  { referenceType: "Team", code: "026", description: "Welding",            updatedBy: "admin" },
  { referenceType: "Team", code: "027", description: "Assembly",           updatedBy: "admin" },
  { referenceType: "Team", code: "028", description: "Purchase",           updatedBy: "admin" },
  { referenceType: "Team", code: "029", description: "Gas Cutting",        updatedBy: "ADMIN" },
  { referenceType: "Team", code: "030", description: "Outsource",          updatedBy: "ADMIN" },
  { referenceType: "Team", code: "031", description: "Drawing",            updatedBy: "ADMIN" },
  { referenceType: "Team", code: "032", description: "Accounts",           updatedBy: "ADMIN" },
  { referenceType: "Team", code: "033", description: "Iron work",          updatedBy: "ADMIN" },
  { referenceType: "Team", code: "034", description: "Setting",            updatedBy: "ADMIN" },
  { referenceType: "Team", code: "035", description: "Master Fabrication", updatedBy: "ADMIN" },
  { referenceType: "Team", code: "036", description: "OWNER",              updatedBy: "admin" },
  { referenceType: "Team", code: "037", description: "PRODUCTION",         updatedBy: "admin" },
  { referenceType: "Team", code: "038", description: "SERVICE",            updatedBy: "admin" },
  { referenceType: "Team", code: "039", description: "SPARES",             updatedBy: "admin" },
  { referenceType: "Team", code: "041", description: "LASER CUTTING",      updatedBy: "ADMIN" },
  { referenceType: "Team", code: "042", description: "ELECTRICAL",         updatedBy: "admin" },
  { referenceType: "Team", code: "043", description: "WATER CUTTING",      updatedBy: "ADMIN" },

  // UOM
  { referenceType: "UOM", code: "001", description: "feet",   updatedBy: "admin"    },
  { referenceType: "UOM", code: "002", description: "Set",    updatedBy: "admin"    },
  { referenceType: "UOM", code: "003", description: "No",     updatedBy: "ADMIN"    },
  { referenceType: "UOM", code: "004", description: "EA",     updatedBy: "admin"    },
  { referenceType: "UOM", code: "005", description: "Kg",     updatedBy: "admin"    },
  { referenceType: "UOM", code: "006", description: "mm",     updatedBy: "admin"    },
  { referenceType: "UOM", code: "007", description: "Lit",    updatedBy: "quotation"},
  { referenceType: "UOM", code: "008", description: "Unit",   updatedBy: "quotation"},
  { referenceType: "UOM", code: "009", description: "TON",    updatedBy: "admin"    },
  { referenceType: "UOM", code: "010", description: "No's",   updatedBy: "ACCOUNTS" },
  { referenceType: "UOM", code: "011", description: "Meter",  updatedBy: "ADMIN"    },
  { referenceType: "UOM", code: "012", description: "BARRAL", updatedBy: "ADMIN"    },
  { referenceType: "UOM", code: "013", description: "length", updatedBy: "admin"    },
  { referenceType: "UOM", code: "014", description: "Coil",   updatedBy: "ADMIN"    },
  { referenceType: "UOM", code: "015", description: "inch",   updatedBy: "admin"    },
  { referenceType: "UOM", code: "016", description: "BOX",    updatedBy: "admin"    },
  { referenceType: "UOM", code: "017", description: "gram",   updatedBy: "ADMIN"    },

  // User Role  (codes 012, 013 absent per source data)
  { referenceType: "User Role", code: "001", description: "ADMIN",                      updatedBy: "ADMIN" },
  { referenceType: "User Role", code: "002", description: "OPERATOR",                   updatedBy: "ADMIN" },
  { referenceType: "User Role", code: "003", description: "MANAGER",                    updatedBy: "ADMIN" },
  { referenceType: "User Role", code: "004", description: "TECHNICAL",                  updatedBy: "admin" },
  { referenceType: "User Role", code: "005", description: "PRODUCTION - SERVICE HEAD",  updatedBy: "admin" },
  { referenceType: "User Role", code: "006", description: "QUALITY",                    updatedBy: "ADMIN" },
  { referenceType: "User Role", code: "007", description: "MAINTENANCE",                updatedBy: "ADMIN" },
  { referenceType: "User Role", code: "008", description: "STORE",                      updatedBy: "ADMIN" },
  { referenceType: "User Role", code: "009", description: "TECHNICAL HEAD",             updatedBy: "ADMIN" },
  { referenceType: "User Role", code: "010", description: "STORE HEAD",                 updatedBy: "ADMIN" },
  { referenceType: "User Role", code: "011", description: "PRODUCTION",                 updatedBy: "admin" },
  { referenceType: "User Role", code: "014", description: "ERP",                        updatedBy: "admin" },
  { referenceType: "User Role", code: "015", description: "DEPT HEAD",                  updatedBy: "admin" },
  { referenceType: "User Role", code: "016", description: "SUPERVISOR",                 updatedBy: "admin" },
  { referenceType: "User Role", code: "017", description: "Quotation Department",       updatedBy: "admin" },
  { referenceType: "User Role", code: "018", description: "PURCHASE",                   updatedBy: "ADMIN" },
  { referenceType: "User Role", code: "019", description: "STORE MATERIAL ISSUE",       updatedBy: "ADMIN" },
  { referenceType: "User Role", code: "020", description: "ACCOUNTS",                   updatedBy: "ADMIN" },
  { referenceType: "User Role", code: "021", description: "SPARES",                     updatedBy: "admin" },

  // Vehicle_Sub_Type  (codes 013, 015, 016 absent per source data)
  { referenceType: "Vehicle_Sub_Type", code: "001", description: "9 MTR",               updatedBy: "ADMIN"    },
  { referenceType: "Vehicle_Sub_Type", code: "002", description: "6 MTR",               updatedBy: "ADMIN"    },
  { referenceType: "Vehicle_Sub_Type", code: "003", description: "10 MTR",              updatedBy: "quotation"},
  { referenceType: "Vehicle_Sub_Type", code: "004", description: "5 FT ROD HANDLING",  updatedBy: "quotation"},
  { referenceType: "Vehicle_Sub_Type", code: "005", description: "5.5 FT ROD HANDLING",updatedBy: "quotation"},
  { referenceType: "Vehicle_Sub_Type", code: "006", description: "VELSON TYPE",         updatedBy: "quotation"},
  { referenceType: "Vehicle_Sub_Type", code: "007", description: "GEAR BOX TYPE",       updatedBy: "quotation"},
  { referenceType: "Vehicle_Sub_Type", code: "008", description: "SOLAR TILTING TYPE",  updatedBy: "quotation"},
  { referenceType: "Vehicle_Sub_Type", code: "009", description: "6 MTR TILTING",       updatedBy: "quotation"},
  { referenceType: "Vehicle_Sub_Type", code: "010", description: "EDC 200",             updatedBy: "quotation"},
  { referenceType: "Vehicle_Sub_Type", code: "011", description: "RAMP SUPPORT",        updatedBy: "quotation"},
  { referenceType: "Vehicle_Sub_Type", code: "012", description: "1850MM WIDTH",        updatedBy: "SALES"    },
  { referenceType: "Vehicle_Sub_Type", code: "014", description: "CORE DRILL SUPPORT",  updatedBy: "sales"    },
  { referenceType: "Vehicle_Sub_Type", code: "017", description: "SIDE MASTER",         updatedBy: "Sales"    },
  { referenceType: "Vehicle_Sub_Type", code: "018", description: "MINI CORE",           updatedBy: "Sales"    },
  { referenceType: "Vehicle_Sub_Type", code: "019", description: "MICRO BLAST DRILL",   updatedBy: "Sales"    },
  { referenceType: "Vehicle_Sub_Type", code: "020", description: "Direct coupled pump", updatedBy: "Sales"    },
  { referenceType: "Vehicle_Sub_Type", code: "021", description: "VELSON SAMP",         updatedBy: "Sales"    },
  { referenceType: "Vehicle_Sub_Type", code: "022", description: "GH600",               updatedBy: "Sales"    },
  { referenceType: "Vehicle_Sub_Type", code: "023", description: "GH600LC",             updatedBy: "Sales"    },
  { referenceType: "Vehicle_Sub_Type", code: "024", description: "GH600LC+",            updatedBy: "Sales"    },
  { referenceType: "Vehicle_Sub_Type", code: "025", description: "GH900LC",             updatedBy: "Sales"    },
  { referenceType: "Vehicle_Sub_Type", code: "026", description: "GH900LC+",            updatedBy: "Sales"    },
  { referenceType: "Vehicle_Sub_Type", code: "027", description: "GH300LCPD",           updatedBy: "Sales"    },
  { referenceType: "Vehicle_Sub_Type", code: "028", description: "GH300LCHD",           updatedBy: "Sales"    },
  { referenceType: "Vehicle_Sub_Type", code: "029", description: "GH600V",              updatedBy: "Sales"    },
  { referenceType: "Vehicle_Sub_Type", code: "030", description: "GH600LCAD",           updatedBy: "Sales"    },
  { referenceType: "Vehicle_Sub_Type", code: "031", description: "GH600LCAD+",          updatedBy: "Sales"    },
  { referenceType: "Vehicle_Sub_Type", code: "032", description: "D150E",               updatedBy: "Sales"    },
  { referenceType: "Vehicle_Sub_Type", code: "033", description: "GH1020LC+",           updatedBy: "Sales"    },
  { referenceType: "Vehicle_Sub_Type", code: "034", description: "XL",                  updatedBy: "Sales"    },
  { referenceType: "Vehicle_Sub_Type", code: "035", description: "RC 300 CR",           updatedBy: "Sales"    },

  // Warranty_Type
  { referenceType: "Warranty_Type", code: "001", description: "V2I", updatedBy: "admin" },
  { referenceType: "Warranty_Type", code: "002", description: "V4",  updatedBy: "admin" },
];

async function seed() {
  console.log("Seeding ReferenceMaster...");
  let created = 0;
  let skipped = 0;
  try {
    for (const data of seedData) {
      const existing = await db.referenceMaster.findFirst({
        where: { referenceType: data.referenceType, code: data.code }
      });
      if (!existing) {
        await db.referenceMaster.create({ data });
        console.log(`  Created : [${data.referenceType}] ${data.code} - ${data.description}`);
        created++;
      } else {
        console.log(`  Skipped : [${data.referenceType}] ${data.code} - already exists`);
        skipped++;
      }
    }
    console.log(`\nSeeding complete. Created: ${created}, Skipped: ${skipped}`);
  } catch (err) {
    console.error("Error seeding:", err);
    process.exit(1);
  } finally {
    await db.$disconnect();
  }
}

seed();
