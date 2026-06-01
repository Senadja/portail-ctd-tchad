import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const result = await prisma.settings.updateMany({
    where: { heroCta1Label: "Consulter les appels d'offres" },
    data:  { heroCta1Label: "Découvrir la Commission" },
  });
  console.log(`✅ ${result.count} enregistrement(s) mis à jour.`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
