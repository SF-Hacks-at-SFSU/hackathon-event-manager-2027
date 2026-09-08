'use client';

import {
  ADMIN_EVENT_SELECTIONS,
  type AdminEventSlug
} from '@/lib/event-selection';
import { useEventSelection } from '@/providers/EventSelectionProvider';
import { useState } from 'react';

export function EventSwitcher() {
  const event = useEventSelection();
  const [isSwitching, setIsSwitching] = useState(false);

  function switchEvent(slug: AdminEventSlug) {
    if (slug === event.slug) return;
    setIsSwitching(true);
    window.location.assign(`/events/${slug}`);
  }

  return (
    <div className="rounded-2xl border border-black/[0.07] bg-white/75 p-2.5 shadow-[0_1px_4px_rgba(0,0,0,0.035)]">
      <label
        htmlFor="admin-event-selector"
        className="mb-1.5 block px-1 text-[10px] font-bold uppercase tracking-[0.13em] text-gray-400"
      >
        Viewing event
      </label>
      <div className="relative">
        <select
          id="admin-event-selector"
          value={event.slug}
          disabled={isSwitching}
          onChange={(event) => switchEvent(event.target.value as AdminEventSlug)}
          className="w-full appearance-none rounded-xl border border-black/[0.08] bg-[#f5f5f7] py-2.5 pl-3 pr-9 text-sm font-semibold text-gray-900 outline-none transition focus:border-[#d41486]/40 focus:ring-4 focus:ring-[#d41486]/10 disabled:cursor-wait disabled:opacity-60"
        >
          {Object.values(ADMIN_EVENT_SELECTIONS).map((option) => (
            <option key={option.slug} value={option.slug}>
              {option.shortName}
            </option>
          ))}
        </select>
        <svg
          viewBox="0 0 20 20"
          fill="none"
          aria-hidden="true"
          className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-gray-500"
        >
          <path
            d="m6 8 4 4 4-4"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
      {isSwitching && (
        <p className="mt-1.5 px-1 text-[11px] text-gray-500">Loading event data…</p>
      )}
    </div>
  );
}
