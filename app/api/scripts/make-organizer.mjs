import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const profileId = process.argv[2];
const eventId = process.argv[3];

if (!profileId || !eventId) {
  console.error('Usage: node scripts/make-organizer.mjs <profileId> <eventId>');
  process.exit(1);
}

const eventProfile = await prisma.eventProfile.upsert({
  where: { profileId_eventId: { profileId, eventId } },
  update: { role: 'organizer' },
  create: { profileId, eventId, role: 'organizer' }
});

console.log('Updated event profile:', eventProfile);
await prisma.$disconnect();
