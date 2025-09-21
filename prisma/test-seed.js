// prisma/test-seed.js
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  const setting = await prisma.setting.findFirst();
  console.log("Current setting in DB:", setting);
}

main().finally(() => prisma.$disconnect());
