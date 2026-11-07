import pkg from '@prisma/client';
const { PrismaClient } = pkg;
const prisma = new PrismaClient();
async function main() {
  const boms = await prisma.bomCreation.findMany({
    select: { serviceJobNo: true, bomNo: true, assemblyPartNo: true, groupName: true }
  });
  console.log(JSON.stringify(boms, null, 2));
}
main()
  .then(async () => { await prisma.$disconnect(); })
  .catch(async (e) => { console.error(e); await prisma.$disconnect(); process.exit(1); });
