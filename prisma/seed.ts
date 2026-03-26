import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // 1. Create a dummy user (Clerk IDs are typically 'user_...')
  const user = await prisma.user.upsert({
    where: { id: "user_2qA1B2C3D4E5F6G7H8I9J0K1L2M" },
    update: {},
    create: {
      id: "user_2qA1B2C3D4E5F6G7H8I9J0K1L2M",
      email: "demo@campuspulse.ai",
      name: "Demo User",
    },
  });

  // 2. Create a Project
  const project = await prisma.project.create({
    data: {
      userId: user.id,
      organizationName: "Student Council",
      eventName: "Annual Spring Gala 2026",
      description: "A formal evening event with dinner, dancing, and networking.",
      goal: "Measure overall guest satisfaction and food quality.",
    },
  });

  // 3. Create a Form
  const form = await prisma.form.create({
    data: {
      projectId: project.id,
      shareId: "spring-gala-2026",
      questions: {
        create: [
          {
            text: "How would you rate the overall event experience?",
            type: "RATING",
            order: 1,
          },
          {
            text: "What was your favorite part of the evening?",
            type: "OPEN_ENDED",
            order: 2,
          },
          {
            text: "Which food option did you choose?",
            type: "MULTIPLE_CHOICE",
            options: ["Chicken", "Beef", "Vegetarian", "Vegan"],
            order: 3,
          },
        ],
      },
    },
  });

  console.log("Seeding completed successfully!");
  console.log({ user: user.id, project: project.id, form: form.shareId });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
