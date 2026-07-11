'use client';

import { useSignOut } from '@/hooks/auth';
import { RequireAuth } from '@/components/RequireAuth';
import Link from 'next/link';

const NAV = [
  { href: '/dashboard/applications', label: 'Applications' },
  { href: '/dashboard/judging', label: 'Judging' },
  { href: '/dashboard/announcements', label: 'Announcements' }
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const signOut = useSignOut();

  return (
    <RequireAuth>
      <div className="flex min-h-screen">
        <aside className="w-56 shrink-0 border-r p-4">
          <p className="mb-6 text-sm font-semibold">SF Hacks Admin</p>
          <nav className="flex flex-col gap-1">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded px-2 py-1.5 text-sm hover:bg-gray-100"
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <button
            onClick={() => signOut.mutate()}
            className="mt-8 text-sm text-gray-500 hover:text-gray-800"
          >
            Sign out
          </button>
        </aside>
        <main className="flex-1 p-6">{children}</main>
      </div>
    </RequireAuth>
  );
}
