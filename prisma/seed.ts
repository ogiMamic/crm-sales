import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  console.log("Seeding data...");

  // Delete existing data
  await prisma.offerService.deleteMany();
  await prisma.offer.deleteMany();
  await prisma.invoice.deleteMany();
  await prisma.service.deleteMany();
  await prisma.customer.deleteMany();

  // Seed Customers (poznate srpske istorijske ličnosti)
  const customers = [
    {
      name: "Nikola Tesla",
      email: "tesla@istorija.rs",
      address: "Smiljan, Austrian Empire (modern-day Croatia)",
      phone: "+381641234567",
      company: "Tesla Labs",
      userId: "user-1"
    },
    {
      name: "Vuk Stefanović Karadžić",
      email: "vuk.karadzic@istorija.rs",
      address: "Tršić, Serbia",
      phone: "+381641234568",
      company: "Reformation of Serbian Language",
      userId: "user-2"
    },
    {
      name: "Mihajlo Pupin",
      email: "mihajlo.pupin@istorija.rs",
      address: "Idvor, Serbia",
      phone: "+381641234569",
      company: "Pupin Science Institute",
      userId: "user-3"
    },
    {
      name: "Dositej Obradović",
      email: "dositej.obradovic@istorija.rs",
      address: "Čakovo, Austrian Empire (modern-day Romania)",
      phone: "+381641234570",
      company: "Enlightenment Movement",
      userId: "user-4"
    },
    {
      name: "Karađorđe Petrović",
      email: "karadjordje@istorija.rs",
      address: "Viševac, Serbia",
      phone: "+381641234571",
      company: "Serbian Revolution",
      userId: "user-5"
    }
  ];

  for (const customer of customers) {
    await prisma.customer.create({ data: customer });
  }

  // Seed Services
  const services = [
    {
      name: "Web Development",
      description: "Development of modern and responsive websites.",
      defaultPrice: 1000.0,
      priceType: "FIXED",
    },
    {
      name: "Consulting",
      description: "Business and technology consulting services.",
      defaultPrice: 200.0,
      priceType: "HOURLY",
    },
    {
      name: "Graphic Design",
      description: "Creation of logos, branding, and marketing materials.",
      defaultPrice: 500.0,
      priceType: "FIXED",
    },
    {
      name: "Digital Marketing",
      description: "SEO, social media management, and online advertising.",
      defaultPrice: 150.0,
      priceType: "HOURLY",
    },
    {
      name: "Cybersecurity Audit",
      description: "Comprehensive security assessment and recommendations.",
      defaultPrice: 3000.0,
      priceType: "FIXED",
    }
  ];

  for (const service of services) {
    await prisma.service.create({ data: service });
  }

  console.log("Seeding completed.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
