export const ADMIN_EVENT_COOKIE_NAME = 'sfhacks-admin-event';

export const ADMIN_EVENT_SELECTIONS = {
  gdg: {
    slug: 'gdg',
    id: '5b5bd3d4-84a8-4e32-8c13-ede6bdfb294a',
    name: 'SF Hacks × GDG AI Hackathon',
    shortName: 'GDG AI Hackathon'
  },
  'sfhacks-2027': {
    slug: 'sfhacks-2027',
    id: '8143acec-6c74-4bba-99b6-821a941e6be7',
    name: 'SF Hacks 2027',
    shortName: 'SF Hacks 2027'
  }
} as const;

export type AdminEventSlug = keyof typeof ADMIN_EVENT_SELECTIONS;
export type AdminEventSelection = (typeof ADMIN_EVENT_SELECTIONS)[AdminEventSlug];

export function isAdminEventSlug(value?: string | null): value is AdminEventSlug {
  return Boolean(value && value in ADMIN_EVENT_SELECTIONS);
}

export function resolveAdminEventSelection(
  cookieSlug?: string | null,
  fallbackEventId?: string | null
): AdminEventSelection {
  if (isAdminEventSlug(cookieSlug)) return ADMIN_EVENT_SELECTIONS[cookieSlug];

  const configuredEvent = Object.values(ADMIN_EVENT_SELECTIONS).find(
    (event) => event.id === fallbackEventId
  );

  return configuredEvent ?? ADMIN_EVENT_SELECTIONS['sfhacks-2027'];
}
