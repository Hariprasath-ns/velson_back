import { neonPrisma, dockerPrisma } from "./src/config/db.js";
import dotenv from "dotenv";

dotenv.config();

const db = process.env.DB_ENV === "neon" ? neonPrisma : dockerPrisma;

const seedData = [
  // STORE 1 - MAINSTORE
  { groupName: "HYDRAULIC PUMP",              store: "STORE 1- MAINSTORE", prefix: "VHP"      },
  { groupName: "HYDRAULIC MOTOR",             store: "STORE 1- MAINSTORE", prefix: "VHM"      },
  { groupName: "HYDRAULIC VALVE",             store: "STORE 1- MAINSTORE", prefix: "VHC"      },
  { groupName: "ELECTRICAL-CNC",              store: "STORE 1- MAINSTORE", prefix: "VE"       },
  { groupName: "ELECTRICAL-SENSOR CLAMP",     store: "STORE 1- MAINSTORE", prefix: "VE"       },
  { groupName: "ELECTRICAL-SENSING CLAMP",    store: "STORE 1- MAINSTORE", prefix: "VE"       },
  { groupName: "ELECTRICAL-V10 CNC",          store: "STORE 1- MAINSTORE", prefix: "VE"       },
  { groupName: "ELECTRICAL-RPM METER SET",    store: "STORE 1- MAINSTORE", prefix: "VE"       },
  { groupName: "ELECTRICAL MOTOR",            store: "STORE 1- MAINSTORE", prefix: "VM"       },
  { groupName: "BEARING-BALL",                store: "STORE 1- MAINSTORE", prefix: "VH"       },
  { groupName: "BEARING-ROLLER",              store: "STORE 1- MAINSTORE", prefix: "VH"       },
  { groupName: "BEARING-NEEDLE",              store: "STORE 1- MAINSTORE", prefix: "VH"       },
  { groupName: "FASTENER-BOLT",               store: "STORE 1- MAINSTORE", prefix: "VF"       },
  { groupName: "FASTENER-NUT",                store: "STORE 1- MAINSTORE", prefix: "VF"       },
  { groupName: "FASTENER-WASHER",             store: "STORE 1- MAINSTORE", prefix: "VF"       },
  { groupName: "FASTENER-SCREW",              store: "STORE 1- MAINSTORE", prefix: "VF"       },
  { groupName: "SEAL KIT-PUMP",               store: "STORE 1- MAINSTORE", prefix: "VCS"      },
  { groupName: "SEAL KIT-MOTOR",              store: "STORE 1- MAINSTORE", prefix: "VCS"      },
  { groupName: "SEAL KIT-CYLINDER",           store: "STORE 1- MAINSTORE", prefix: "VCS"      },
  { groupName: "SEAL KIT-VALVE",              store: "STORE 1- MAINSTORE", prefix: "VCS"      },
  { groupName: "TOOLS-HAND",                  store: "STORE 1- MAINSTORE", prefix: "VT"       },
  { groupName: "TOOLS-POWER",                 store: "STORE 1- MAINSTORE", prefix: "VT"       },
  { groupName: "TOOLS-CUTTING",               store: "STORE 1- MAINSTORE", prefix: "VT"       },
  { groupName: "TOOLS-MEASURING",             store: "STORE 1- MAINSTORE", prefix: "VT"       },
  { groupName: "CONSUMABLES-OIL",             store: "STORE 1- MAINSTORE", prefix: "VC"       },
  { groupName: "CONSUMABLES-GREASE",          store: "STORE 1- MAINSTORE", prefix: "VC"       },
  { groupName: "CONSUMABLES-COOLANT",         store: "STORE 1- MAINSTORE", prefix: "VC"       },
  { groupName: "CONSUMABLES-ABRASIVE",        store: "STORE 1- MAINSTORE", prefix: "VC"       },
  { groupName: "PACKING MATERIAL-BOX",        store: "STORE 1- MAINSTORE", prefix: "VMM"      },
  { groupName: "PACKING MATERIAL-FOAM",       store: "STORE 1- MAINSTORE", prefix: "VMM"      },
  { groupName: "PACKING MATERIAL-WRAP",       store: "STORE 1- MAINSTORE", prefix: "VMM"      },
  { groupName: "PIPE-MS",                     store: "STORE 1- MAINSTORE", prefix: "VF"       },
  { groupName: "PIPE-SS",                     store: "STORE 1- MAINSTORE", prefix: "VF"       },
  { groupName: "PIPE-HOSE",                   store: "STORE 1- MAINSTORE", prefix: "VF"       },
  { groupName: "FITTING-ELBOW",               store: "STORE 1- MAINSTORE", prefix: "VF"       },
  { groupName: "FITTING-TEE",                 store: "STORE 1- MAINSTORE", prefix: "VF"       },
  { groupName: "FITTING-UNION",               store: "STORE 1- MAINSTORE", prefix: "VF"       },
  { groupName: "SAFETY-GLOVES",               store: "STORE 1- MAINSTORE", prefix: "VOS"      },
  { groupName: "SAFETY-HELMET",               store: "STORE 1- MAINSTORE", prefix: "VOS"      },
  { groupName: "SAFETY-SHOES",                store: "STORE 1- MAINSTORE", prefix: "VOS"      },
  { groupName: "WELDING-ELECTRODE",           store: "STORE 1- MAINSTORE", prefix: "VOM"      },
  { groupName: "WELDING-WIRE",                store: "STORE 1- MAINSTORE", prefix: "VOM"      },
  { groupName: "WELDING-GAS",                 store: "STORE 1- MAINSTORE", prefix: "VOM"      },
  { groupName: "ASSEMBLY-WHEEL",              store: "STORE 1- MAINSTORE", prefix: "VA%"      },
  { groupName: "ASSEMBLY-SHAFT",              store: "STORE 1- MAINSTORE", prefix: "VA%"      },
  { groupName: "ASSEMBLY-COUPLING",           store: "STORE 1- MAINSTORE", prefix: "VA%"      },
  { groupName: "GEAR BOX-HELICAL",            store: "STORE 1- MAINSTORE", prefix: "VG"       },
  { groupName: "GEAR BOX-WORM",               store: "STORE 1- MAINSTORE", prefix: "VG"       },
  { groupName: "GEAR BOX-BEVEL",              store: "STORE 1- MAINSTORE", prefix: "VG"       },
  { groupName: "HAND TOOL-SPANNER",           store: "STORE 1- MAINSTORE", prefix: "VH"       },
  { groupName: "HAND TOOL-PLIER",             store: "STORE 1- MAINSTORE", prefix: "VH"       },

  // STORE 3 - SHEET METAL (Production)
  { groupName: "RAW MATERIAL-MS PLATE",       store: "STORE 3- SHEET METAL", prefix: "VRC"    },
  { groupName: "RAW MATERIAL-SS PLATE",       store: "STORE 3- SHEET METAL", prefix: "VRC"    },
  { groupName: "RAW MATERIAL-ALUMINIUM",      store: "STORE 3- SHEET METAL", prefix: "VRC"    },
  { groupName: "RAW MATERIAL-COPPER",         store: "STORE 3- SHEET METAL", prefix: "VRC"    },
  { groupName: "FINISHED GOODS-PUMP",         store: "STORE 3- SHEET METAL", prefix: "VGH"    },
  { groupName: "FINISHED GOODS-MOTOR",        store: "STORE 3- SHEET METAL", prefix: "VGH"    },
  { groupName: "FINISHED GOODS-CYLINDER",     store: "STORE 3- SHEET METAL", prefix: "VGH"    },
  { groupName: "SEMI FINISHED-BODY",          store: "STORE 3- SHEET METAL", prefix: "VMM"    },
  { groupName: "SEMI FINISHED-SHAFT",         store: "STORE 3- SHEET METAL", prefix: "VMM"    },
  { groupName: "SEMI FINISHED-COVER",         store: "STORE 3- SHEET METAL", prefix: "VMM"    },
  { groupName: "SUB ASSEMBLY-VALVE",          store: "STORE 3- SHEET METAL", prefix: "VCV"    },
  { groupName: "SUB ASSEMBLY-PUMP",           store: "STORE 3- SHEET METAL", prefix: "VCV"    },
  { groupName: "MAIN ASSEMBLY-UNIT",          store: "STORE 3- SHEET METAL", prefix: "VCV"    },
  { groupName: "BOUGHT OUT-SEALS",            store: "STORE 3- SHEET METAL", prefix: "VOM"    },
  { groupName: "BOUGHT OUT-BEARINGS",         store: "STORE 3- SHEET METAL", prefix: "VOM"    },
  { groupName: "WIP-MACHINING",               store: "STORE 3- SHEET METAL", prefix: "VLC"    },
  { groupName: "SCRAP-MS",                    store: "STORE 3- SHEET METAL", prefix: "VRC"    },

  // STORE 4 - BANDSAW CUTTING (Service)
  { groupName: "SERVICE PARTS-PUMP",          store: "STORE 4-BANDSAW CUTTING", prefix: "VOS" },
  { groupName: "SERVICE PARTS-MOTOR",         store: "STORE 4-BANDSAW CUTTING", prefix: "VOS" },
  { groupName: "SERVICE PARTS-VALVE",         store: "STORE 4-BANDSAW CUTTING", prefix: "VOS" },
  { groupName: "SPARE PARTS-SEAL",            store: "STORE 4-BANDSAW CUTTING", prefix: "VRM" },
  { groupName: "SPARE PARTS-BEARING",         store: "STORE 4-BANDSAW CUTTING", prefix: "VRM" },
  { groupName: "MAINTENANCE-TOOLS",           store: "STORE 4-BANDSAW CUTTING", prefix: "VMM" },
  { groupName: "AMC-ITEMS",                   store: "STORE 4-BANDSAW CUTTING", prefix: "VAC" },

  // STORE 2 - GAS CUTTING (Project)
  { groupName: "PROJECT ITEMS-STRUCTURE",     store: "STORE 2-GAS CUTTING", prefix: "VCR"    },
  { groupName: "PROJECT ITEMS-PIPING",        store: "STORE 2-GAS CUTTING", prefix: "VCR"    },
  { groupName: "CAPITAL GOODS-MACHINE",       store: "STORE 2-GAS CUTTING", prefix: "VCD"    },
];

async function seed() {
  console.log("Clearing existing ItemGroupMaster data...");
  try {
    await db.itemGroupMaster.deleteMany({});
    console.log("  Cleared all existing item groups.");

    console.log("Seeding ItemGroupMaster...");
    let created = 0;
    for (const data of seedData) {
      await db.itemGroupMaster.create({ data });
      console.log(`  Created : [${data.store}] ${data.groupName} (${data.prefix})`);
      created++;
    }
    console.log(`\nSeeding complete. Created: ${created}`);
  } catch (err) {
    console.error("Error seeding:", err);
    process.exit(1);
  } finally {
    await db.$disconnect();
  }
}

seed();
