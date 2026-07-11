import prisma from '../../config/prismaClient';
import type { CreateAnnouncementInput } from './announcements.schemas';

export function createAnnouncement(eventId: string, input: CreateAnnouncementInput) {
  return prisma.announcement.create({ data: { eventId, ...input } });
}

export function listAnnouncements(eventId: string) {
  return prisma.announcement.findMany({
    where: { eventId },
    orderBy: [{ isPinned: 'desc' }, { createdAt: 'desc' }]
  });
}

export function deleteAnnouncement(eventId: string, id: string) {
  return prisma.announcement.deleteMany({ where: { id, eventId } });
}
