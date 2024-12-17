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
}
//   // Seed Customers (poznate srpske istorijske ličnosti)
//   const customers = await prisma.customer.createMany({
//     data: [
//       {
//         id: "customer-1",
//         name: "Nikola Tesla",
//         email: "tesla@istorija.rs",
//         address: "Smiljan, Austrian Empire (modern-day Croatia)",
//         phone: "+381641234567",
//         company: "Tesla Labs",
//         userId: "user-1"
//       },
//       {
//         id: "customer-2",
//         name: "Vuk Stefanović Karadžić",
//         email: "vuk.karadzic@istorija.rs",
//         address: "Tršić, Serbia",
//         phone: "+381641234568",
//         company: "Reformation of Serbian Language",
//         userId: "user-2"
//       },
//       {
//         id: "customer-3",
//         name: "Mihajlo Pupin",
//         email: "mihajlo.pupin@istorija.rs",
//         address: "Idvor, Serbia",
//         phone: "+381641234569",
//         company: "Pupin Science Institute",
//         userId: "user-3"
//       },
//       {
//         id: "customer-4",
//         name: "Dositej Obradović",
//         email: "dositej.obradovic@istorija.rs",
//         address: "Čakovo, Austrian Empire (modern-day Romania)",
//         phone: "+381641234570",
//         company: "Enlightenment Movement",
//         userId: "user-4"
//       },
//       {
//         id: "customer-5",
//         name: "Karađorđe Petrović",
//         email: "karadjordje@istorija.rs",
//         address: "Viševac, Serbia",
//         phone: "+381641234571",
//         company: "Serbian Revolution",
//         userId: "user-5"
//       }
//     ]
//   });

//   // Seed Services
//   const services = await prisma.service.createMany({
//     data: [
//       {
//         name: "Web Development",
//         description: "Development of modern and responsive websites.",
//         defaultPrice: 1000.0,
//         priceType: "FIXED",
//       },
//       {
//         name: "Consulting",
//         description: "Business and technology consulting services.",
//         defaultPrice: 200.0,
//         priceType: "HOURLY",
//       },
//       {
//         name: "Graphic Design",
//         description: "Creation of logos, branding, and marketing materials.",
//         defaultPrice: 500.0,
//         priceType: "FIXED",
//       },
//       {
//         name: "Digital Marketing",
//         description: "SEO, social media management, and online advertising.",
//         defaultPrice: 150.0,
//         priceType: "HOURLY",
//       },
//       {
//         name: "Cybersecurity Audit",
//         description: "Comprehensive security assessment and recommendations.",
//         defaultPrice: 3000.0,
//         priceType: "FIXED",
//       }
//     ]
//   });

//   // Seed Offers and OfferServices
//   const offer1 = await prisma.offer.create({
//     data: {
//       number: "OFF001",
//       customerId: "customer-1",
//       date: new Date(),
//       status: "PENDING",
//       subtotalAmount: 1000.0,
//       taxPercentage: 19,
//       taxAmount: 190.0,
//       totalAmount: 1190.0,
//       offerServices: {
//         create: [
//           {
//             service: { connect: { name: "Web Development" } },
//             quantity: 1,
//             unitPrice: 1000.0,
//             totalPrice: 1000.0,
//           },
//         ],
//       },
//     },
//   });

//   const offer2 = await prisma.offer.create({
//     data: {
//       number: "OFF002",
//       customerId: "customer-2",
//       date: new Date(),
//       status: "APPROVED",
//       subtotalAmount: 300.0,
//       taxPercentage: 19,
//       taxAmount: 57.0,
//       discountPercentage: 10,
//       discountAmount: 30.0,
//       totalAmount: 327.0,
//       offerServices: {
//         create: [
//           {
//             service: { connect: { name: "Consulting" } },
//             quantity: 3,
//             unitPrice: 100.0,
//             totalPrice: 300.0,
//           },
//         ],
//       },
//     },
//   });

//   const offer3 = await prisma.offer.create({
//     data: {
//       number: "OFF003",
//       customerId: "customer-3",
//       date: new Date(),
//       status: "REJECTED",
//       subtotalAmount: 3000.0,
//       taxPercentage: 19,
//       taxAmount: 570.0,
//       totalAmount: 3570.0,
//       offerServices: {
//         create: [
//           {
//             service: { connect: { name: "Cybersecurity Audit" } },
//             quantity: 1,
//             unitPrice: 3000.0,
//             totalPrice: 3000.0,
//           },
//         ],
//       },
//     },
//   });

//   console.log("Seeding completed.");
// }

// main()
//   .catch((e) => {
//     console.error(e);
//     process.exit(1);
//   })
//   .finally(async () => {
//     await prisma.$disconnect();
//   });
