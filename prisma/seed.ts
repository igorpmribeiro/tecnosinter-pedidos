import "dotenv/config";
import { PrismaClient } from "../lib/generated/prisma";

const db = new PrismaClient();

async function main() {
  const departments = [
    "Manut Mec e Elétrica",
    "Manut Mec",
    "Produção",
    "Qualidade",
    "Administrativo",
    "Logística",
  ];

  for (const name of departments) {
    await db.department.upsert({
      where: { name },
      update: {},
      create: { name },
    });
  }

  const suppliers = ["Bripeças", "Genérico"];
  for (const name of suppliers) {
    await db.supplier.upsert({
      where: { name },
      update: {},
      create: { name },
    });
  }

  console.log("Seed complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
