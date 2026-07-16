import { PrismaClient } from './src/generated/prisma/index.js';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const dbEnv = process.env.DB_ENV || 'docker';
const connString =
  dbEnv === 'neon'
    ? process.env.NEON_DATABASE_URL
    : process.env.DOCKER_DATABASE_URL;

const prisma = new PrismaClient({
  adapter: new PrismaPg(new pg.Pool({ connectionString: connString })),
});

async function main() {
  console.log(`[seed] Connecting to ${dbEnv} database...`);
  
  // Find a customer
  const customer = await prisma.customerMaster.findFirst({
    where: { cCode: 'CUS97' }
  });
  
  // Find a supplier
  const supplier = await prisma.supplierMaster.findFirst({
    where: { sCode: 'SUP100' }
  });
  
  if (!customer) {
    console.error('Customer with cCode "CUS97" not found. Please run seedCustomerMaster.js first.');
    return;
  }
  
  if (!supplier) {
    console.error('Supplier with sCode "SUP100" not found. Please run seedSupplierMaster.js first.');
    return;
  }

  console.log('Seeding Delivery Challans...');

  // Delete existing seeded DCs if any
  await prisma.deliveryChallan.deleteMany({
    where: {
      dcNo: {
        in: ['26-27/DC0001', '26-27/DC0002']
      }
    }
  });

  // Create DC 1 (Customer)
  const dc1 = await prisma.deliveryChallan.create({
    data: {
      dcNo: '26-27/DC0001',
      financialYear: '26/27',
      partyType: 'Customer',
      customerId: customer.id,
      partyName: customer.customerName,
      address: 'Tiruchengode, Tamil Nadu, India',
      contPerson: 'Senthil',
      contactNo: '9842154321',
      gstNo: '33AABCS1234E1Z1',
      dcType: 'Sales',
      vehicleNo: 'TN-28-AB-1234',
      driverName: 'Kumar',
      desThrough: 'Self',
      termsOfDelivery: 'FOB',
      totalQty: 10,
      totalAmount: 1500,
      createdBy: 'Admin',
      details: {
        create: [
          {
            slNo: 1,
            partNo: 'P-001',
            partName: 'Hydraulic Hose',
            qty: 5,
            rate: 100,
            amount: 500,
            uom: 'PCS',
            workType: 'General',
            barcode: 'B-001'
          },
          {
            slNo: 2,
            partNo: 'P-002',
            partName: 'Control Valve',
            qty: 5,
            rate: 200,
            amount: 1000,
            uom: 'PCS',
            workType: 'General',
            barcode: 'B-002'
          }
        ]
      }
    }
  });

  // Create DC 2 (Supplier)
  const dc2 = await prisma.deliveryChallan.create({
    data: {
      dcNo: '26-27/DC0002',
      financialYear: '26/27',
      partyType: 'Supplier',
      supplierId: supplier.id,
      partyName: supplier.supplierName,
      address: 'Tiruchengode, Tamil Nadu, India',
      contPerson: 'Ramasamy',
      contactNo: '9443189164',
      gstNo: '33AABCI1234F1Z1',
      dcType: 'Returnable',
      vehicleNo: 'TN-28-CD-5678',
      driverName: 'Mani',
      desThrough: 'Lorry',
      termsOfDelivery: 'To Pay',
      totalQty: 2,
      totalAmount: 4000,
      createdBy: 'Admin',
      details: {
        create: [
          {
            slNo: 1,
            partNo: 'P-003',
            partName: 'Hydraulic Pump',
            qty: 2,
            rate: 2000,
            amount: 4000,
            uom: 'PCS',
            workType: 'Rework',
            barcode: 'B-003'
          }
        ]
      }
    }
  });

  console.log('Seeded Delivery Challans successfully:', dc1.dcNo, dc2.dcNo);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
