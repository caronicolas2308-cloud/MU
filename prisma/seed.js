// prisma/seed.js
const { PrismaClient } = require("@prisma/client");
const crypto = require("crypto");
const prisma = new PrismaClient();
const hash = (s) => crypto.createHash("sha256").update(String(s)).digest("hex");

async function main() {
  console.log(
    "[SEED] DATABASE_URL host =",
    (process.env.DATABASE_URL || "").split("@")[1] || "(absent)"
  );

  // (A) Réparer d'éventuelles lignes anciennes avec updatedAt NULL
  try {
    await prisma.$executeRawUnsafe(
      `UPDATE "Setting" SET "updatedAt" = NOW() WHERE "updatedAt" IS NULL`
    );
    await prisma.$executeRawUnsafe(
      `UPDATE "Admin" SET "updatedAt" = NOW() WHERE "updatedAt" IS NULL`
    );
    await prisma.$executeRawUnsafe(
      `UPDATE "Prof" SET "updatedAt" = NOW() WHERE "updatedAt" IS NULL`
    );
    await prisma.$executeRawUnsafe(
      `UPDATE "Class" SET "updatedAt" = NOW() WHERE "updatedAt" IS NULL`
    );
    await prisma.$executeRawUnsafe(
      `UPDATE "Chapter" SET "updatedAt" = NOW() WHERE "updatedAt" IS NULL`
    );
    await prisma.$executeRawUnsafe(
      `UPDATE "Document" SET "updatedAt" = NOW() WHERE "updatedAt" IS NULL`
    );
    await prisma.$executeRawUnsafe(
      `UPDATE "Session" SET "createdAt" = NOW() WHERE "createdAt" IS NULL`
    );
  } catch (e) {
    console.log("[SEED] Some tables may not exist yet, continuing...");
  }

  // (B) Créer le Setting si absent
  const existing = await prisma.setting.findFirst();
  if (!existing) {
    await prisma.setting.create({
      data: {
        signupSesameHash: hash("alibaba"),
        maxProfs: 10,
        maxClassesPerProf: 10,
      },
    });
    console.log("[SEED] Setting created");
  } else {
    console.log("[SEED] Setting exists (id=%d)", existing.id);
  }

  // (C) Admin par défaut (connexion par NOM: Admin / admin123)
  await prisma.admin.upsert({
    where: { name: "Admin" }, // clé stable par nom
    update: {
      passwordHash: hash("admin123"),
      updatedAt: new Date(),
    },
    create: {
      name: "Admin",
      passwordHash: hash("admin123"),
    },
  });

  // (D) Créer un professeur de test pour les démos
  const testProf = await prisma.prof.upsert({
    where: { name: "TestProf" },
    update: {
      passwordHash: hash("test123"),
      updatedAt: new Date(),
    },
    create: {
      name: "TestProf",
      passwordHash: hash("test123"),
    },
  });

  // (E) Créer une classe de test avec chapitres
  // D'abord vérifier si la classe existe déjà
  let testClass = await prisma.class.findFirst({
    where: {
      profId: testProf.id,
      name: "Terminale A",
    },
  });

  if (!testClass) {
    testClass = await prisma.class.create({
      data: {
        name: "Terminale A",
        profId: testProf.id,
      },
    });
    console.log("[SEED] Classe 'Terminale A' créée");
  } else {
    console.log("[SEED] Classe 'Terminale A' existe déjà");
  }

  // Créer les chapitres 1 et 2 (obligatoires)
  const chapter1 = await prisma.chapter.findFirst({
    where: {
      classId: testClass.id,
      number: 1,
    },
  });

  if (!chapter1) {
    await prisma.chapter.create({
      data: {
        classId: testClass.id,
        number: 1,
        title: "Chapitre 1 - Introduction",
      },
    });
    console.log("[SEED] Chapitre 1 créé");
  }

  const chapter2 = await prisma.chapter.findFirst({
    where: {
      classId: testClass.id,
      number: 2,
    },
  });

  if (!chapter2) {
    await prisma.chapter.create({
      data: {
        classId: testClass.id,
        number: 2,
        title: "Chapitre 2 - Fonctions",
      },
    });
    console.log("[SEED] Chapitre 2 créé");
  }

  console.log(
    "[SEED] OK  -> Admin/Admin123, TestProf/test123, sesame='alibaba'"
  );
  console.log("[SEED] Test data: classe 'Terminale A' avec 2 chapitres créés");
}

main()
  .catch((e) => {
    console.error("[SEED] ERROR", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
