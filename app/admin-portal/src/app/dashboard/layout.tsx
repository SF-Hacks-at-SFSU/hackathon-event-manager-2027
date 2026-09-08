"use client";

import { RequireAuth } from "@/components/RequireAuth";
import { useSignOut, useUser } from "@/hooks/auth";
import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV = [
  { href: "/dashboard/applications", label: "Applications", marker: "A" },
  { href: "/dashboard/check-in", label: "Check-in", marker: "C" },
  { href: "/dashboard/judging", label: "Judging", marker: "J" },
  { href: "/dashboard/announcements", label: "Announcements", marker: "N" },
];

function Navigation() {
  const pathname = usePathname();

  return (
    <nav className="flex gap-1 overflow-x-auto lg:flex-col" aria-label="Admin navigation">
      {NAV.map((item) => {
        const active = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={`group flex shrink-0 items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
              active
                ? "bg-white text-gray-950 shadow-[0_1px_4px_rgba(0,0,0,0.08)]"
                : "text-gray-500 hover:bg-white/60 hover:text-gray-950"
            }`}
          >
            <span
              className={`grid size-7 place-items-center rounded-lg text-[11px] font-bold transition ${
                active
                  ? "bg-[#1d1d1f] text-white"
                  : "bg-black/[0.045] text-gray-500 group-hover:bg-black/[0.07]"
              }`}
              aria-hidden="true"
            >
              {item.marker}
            </span>
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const signOut = useSignOut();
  const { user } = useUser();
  const initial = user?.email?.charAt(0).toUpperCase() ?? "S";

  return (
    <RequireAuth>
      <div className="min-h-screen lg:grid lg:grid-cols-[260px_minmax(0,1fr)]">
        <aside className="border-b border-black/[0.07] bg-white/65 px-4 py-4 backdrop-blur-2xl lg:sticky lg:top-0 lg:flex lg:h-screen lg:flex-col lg:border-b-0 lg:border-r lg:px-4 lg:py-5">
          <div className="mb-4 flex items-center justify-between px-2 lg:mb-8">
            <div className="flex items-center gap-3">
              <div className="grid size-9 place-items-center rounded-xl bg-gradient-to-br from-[#f02da7] to-[#95105f] text-xs font-bold text-white shadow-[0_6px_18px_rgba(214,20,134,0.24)]">
                SF
              </div>
              <div>
                <p className="text-sm font-semibold tracking-[-0.02em]">SF Hacks</p>
                <p className="text-[11px] text-gray-500">Organizer console</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => signOut.mutate()}
              disabled={signOut.isPending}
              aria-label="Sign out"
              title="Sign out"
              className="grid size-8 place-items-center rounded-full bg-black/[0.06] text-xs font-semibold text-gray-700 transition hover:bg-black/[0.1] disabled:opacity-50 lg:hidden"
            >
              {initial}
            </button>
          </div>

          <Navigation />

          <div className="mt-auto hidden border-t border-black/[0.07] pt-4 lg:block">
            <div className="mb-3 flex items-center gap-3 px-2">
              <div className="grid size-9 shrink-0 place-items-center rounded-full bg-[#1d1d1f] text-xs font-semibold text-white">
                {initial}
              </div>
              <div className="min-w-0">
                <p className="truncate text-xs font-medium text-gray-900">Administrator</p>
                <p className="truncate text-[11px] text-gray-500">{user?.email}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => signOut.mutate()}
              disabled={signOut.isPending}
              className="w-full rounded-xl px-3 py-2 text-left text-sm font-medium text-gray-500 transition hover:bg-white/70 hover:text-gray-950 disabled:opacity-50"
            >
              {signOut.isPending ? "Signing out…" : "Sign out"}
            </button>
          </div>
        </aside>

        <main className="min-w-0 px-4 py-7 sm:px-7 lg:px-10 lg:py-10 xl:px-14">
          <div className="mx-auto w-full max-w-[1440px]">{children}</div>
        </main>
      </div>
    </RequireAuth>
  );
}
