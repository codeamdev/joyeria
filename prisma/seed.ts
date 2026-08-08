import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function seedAdminUser() {
  const email = process.env.SEED_ADMIN_EMAIL;
  const password = process.env.SEED_ADMIN_PASSWORD;
  const name = process.env.SEED_ADMIN_NAME ?? "Administrador";

  if (!email || !password) {
    console.warn(
      "SEED_ADMIN_EMAIL / SEED_ADMIN_PASSWORD no definidos: se omite la creación del usuario admin inicial.",
    );
    return;
  }

  const existing = await prisma.adminUser.findUnique({ where: { email } });
  if (existing) {
    console.log(`AdminUser ya existe para ${email}, no se modifica.`);
    return;
  }

  const passwordHash = await bcrypt.hash(password, 12);
  await prisma.adminUser.create({
    data: { email, passwordHash, name, role: "ADMIN" },
  });
  console.log(`AdminUser creado: ${email}`);
}

async function seedCategories() {
  const count = await prisma.category.count();
  if (count > 0) {
    console.log("Ya existen categorías, se omite el seed de catálogo.");
    return;
  }

  const rings = await prisma.category.create({
    data: { name: "Anillos", slug: "anillos", order: 1 },
  });
  await prisma.category.create({
    data: {
      name: "Anillos de compromiso",
      slug: "anillos-de-compromiso",
      order: 1,
      parentId: rings.id,
    },
  });
  await prisma.category.create({ data: { name: "Aretes", slug: "aretes", order: 2 } });
  await prisma.category.create({ data: { name: "Collares", slug: "collares", order: 3 } });
  await prisma.category.create({ data: { name: "Pulseras", slug: "pulseras", order: 4 } });
  console.log("Categorías base creadas.");
}

async function main() {
  await seedAdminUser();
  await seedCategories();
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
