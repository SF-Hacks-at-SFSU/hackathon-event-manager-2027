export type OperationalMode = 'test' | 'live';

const parseMode = (value: string | undefined): OperationalMode =>
  value?.toLowerCase() === 'live' ? 'live' : 'test';

export const operationalMode = {
  applicationStatus: parseMode(process.env.APPLICATION_STATUS_MODE),
  applicationStatusTestRecipient: process.env.APPLICATION_STATUS_TEST_EMAIL?.trim() || null,
  checkIn: parseMode(process.env.CHECKIN_MODE)
} as const;

export const isApplicationStatusTestMode = operationalMode.applicationStatus === 'test';
export const isCheckInTestMode = operationalMode.checkIn === 'test';
