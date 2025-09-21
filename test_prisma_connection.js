const { PrismaClient } = require("@prisma/client");

async function testConnection() {
  const prisma = new PrismaClient();

  try {
    console.log("Testing Prisma connection...");

    // Test basic connection
    await prisma.$connect();
    console.log("✅ Database connection successful");

    // Test relations
    const admins = await prisma.admin.findMany();
    console.log(`✅ Found ${admins.length} admins`);

    const profs = await prisma.prof.findMany();
    console.log(`✅ Found ${profs.length} profs`);

    const classes = await prisma.class.findMany();
    console.log(`✅ Found ${classes.length} classes`);

    const chapters = await prisma.chapter.findMany();
    console.log(`✅ Found ${chapters.length} chapters`);

    const documents = await prisma.document.findMany();
    console.log(`✅ Found ${documents.length} documents`);

    // Test relations
    if (classes.length > 0) {
      const classWithProf = await prisma.class.findFirst({
        include: { prof: true },
      });
      console.log(`✅ Class-Prof relation works: ${classWithProf?.prof?.name}`);
    }

    if (chapters.length > 0) {
      const chapterWithClass = await prisma.chapter.findFirst({
        include: { class: true },
      });
      console.log(
        `✅ Chapter-Class relation works: ${chapterWithClass?.class?.name}`
      );
    }

    if (documents.length > 0) {
      const documentWithChapter = await prisma.document.findFirst({
        include: { chapter: true },
      });
      console.log(
        `✅ Document-Chapter relation works: ${documentWithChapter?.chapter?.title}`
      );
    }

    console.log("🎉 All Prisma tests passed!");
  } catch (error) {
    console.error("❌ Prisma test failed:", error);
  } finally {
    await prisma.$disconnect();
  }
}

testConnection();
