import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const event = await prisma.event.create({
  data: {
    name: 'SF Hacks 2027',
    description: 'SF Hacks 2027 — San Francisco State University',
    isEventLive: true,
    isTeamManagementOpen: true
  }
});

console.log('Created event:', event.id);
await prisma.$disconnect();
