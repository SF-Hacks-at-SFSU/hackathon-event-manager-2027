import type { Metadata } from "next";
import "./globals.css";
import Providers from "@/providers";
import { cookies } from "next/headers";
import {
  ADMIN_EVENT_COOKIE_NAME,
  resolveAdminEventSelection,
} from "@/lib/event-selection";

export const metadata: Metadata = {
  title: "SF Hacks Admin",
  description: "Organizer dashboard for SF Hacks",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const event = resolveAdminEventSelection(
    cookieStore.get(ADMIN_EVENT_COOKIE_NAME)?.value,
    process.env.NEXT_PUBLIC_EVENT_ID,
  );

  return (
    <html lang="en">
      <body>
        <Providers event={event}>{children}</Providers>
      </body>
    </html>
  );
}
