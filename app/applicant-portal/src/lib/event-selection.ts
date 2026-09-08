export const EVENT_COOKIE_NAME = 'sfhacks-event';

export const EVENT_SELECTIONS = {
  gdg: {
    slug: 'gdg',
    id: '5b5bd3d4-84a8-4e32-8c13-ede6bdfb294a',
    name: 'SF Hacks × GDG AI Hackathon',
    website: 'https://gdg.sfhacks.io'
  },
  'sfhacks-2027': {
    slug: 'sfhacks-2027',
    id: '8143acec-6c74-4bba-99b6-821a941e6be7',
    name: 'SF Hacks 2027',
    website: 'https://sfhacks.io'
  }
} as const;

export type EventSlug = keyof typeof EVENT_SELECTIONS;
export type EventSelection = (typeof EVENT_SELECTIONS)[EventSlug];

export function isEventSlug(value?: string | null): value is EventSlug {
  return Boolean(value && value in EVENT_SELECTIONS);
}

export function resolveEventSelection(
  cookieSlug?: string | null,
  fallbackEventId?: string | null
): EventSelection {
  if (isEventSlug(cookieSlug)) return EVENT_SELECTIONS[cookieSlug];

  const configuredEvent = Object.values(EVENT_SELECTIONS).find(
    (event) => event.id === fallbackEventId
  );

  return configuredEvent ?? EVENT_SELECTIONS['sfhacks-2027'];
}
