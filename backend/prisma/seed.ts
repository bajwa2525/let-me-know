import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Creates only the admin login. The real catalog (brands, products, galleries,
// market prices) is ported from the frontend's own data files by
// scripts/seed-from-frontend.ts, run over the HTTP API after this.
async function main() {
  const adminEmail = "admin@letmeknow.dev";
  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      name: "Admin",
      role: "ADMIN",
      passwordHash: await bcrypt.hash("Admin@12345", 10),
    },
  });

  console.log("Seeded admin user:", admin.email, "(password: Admin@12345)");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
