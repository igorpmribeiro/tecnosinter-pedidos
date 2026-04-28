import "dotenv/config";
import { randomBytes, scrypt as scryptCb } from "node:crypto";
import { promisify } from "node:util";
import { PrismaClient } from "../lib/generated/prisma";

const db = new PrismaClient();
const scrypt = promisify(scryptCb) as (
  password: string | Buffer,
  salt: string | Buffer,
  keylen: number,
) => Promise<Buffer>;

async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString("hex");
  const derived = await scrypt(password.normalize("NFKC"), salt, 64);
  return `scrypt:${salt}:${derived.toString("hex")}`;
}

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

  const adminEmail = process.env.SEED_ADMIN_EMAIL ?? "admin@tecnosinter.com";
  const adminName = process.env.SEED_ADMIN_NAME ?? "Administrador";
  const adminPassword = process.env.SEED_ADMIN_PASSWORD ?? "admin12345";

  const existingAdmin = await db.user.findUnique({ where: { email: adminEmail } });
  if (!existingAdmin) {
    await db.user.create({
      data: {
        email: adminEmail,
        name: adminName,
        passwordHash: await hashPassword(adminPassword),
        role: "ADMIN",
      },
    });
    console.log(`Admin criado: ${adminEmail} (senha: ${adminPassword})`);
  } else {
    console.log(`Admin já existe: ${adminEmail}`);
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
