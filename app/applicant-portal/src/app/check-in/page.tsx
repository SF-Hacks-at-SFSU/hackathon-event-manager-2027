import { SelfCheckIn } from './self-check-in';

export default async function CheckInPage({
  searchParams
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token = '' } = await searchParams;
  return <SelfCheckIn token={token} />;
}
