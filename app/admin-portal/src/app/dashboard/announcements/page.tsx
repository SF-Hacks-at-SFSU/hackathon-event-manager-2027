"use client";

import { trpc } from "@/utils/trpc";
import { useState } from "react";

export default function AnnouncementsPage() {
  const utils = trpc.useUtils();
  const announcements = trpc.announcements.list.useQuery();
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [isPinned, setIsPinned] = useState(false);

  const create = trpc.announcements.create.useMutation({
    onSuccess: () => {
      void utils.announcements.list.invalidate();
      setTitle("");
      setBody("");
      setIsPinned(false);
    },
  });
  const remove = trpc.announcements.delete.useMutation({
    onSuccess: () => void utils.announcements.list.invalidate(),
  });

  return (
    <div>
      <header className="mb-8">
        <p className="admin-kicker">Communication</p>
        <h1 className="admin-title">Announcements</h1>
        <p className="admin-subtitle">
          Share timely updates with everyone participating in this event.
        </p>
      </header>

      <div className="grid items-start gap-6 xl:grid-cols-[minmax(320px,0.72fr)_minmax(0,1.28fr)]">
        <form
          className="admin-card p-5 sm:p-6 xl:sticky xl:top-10"
          onSubmit={(event) => {
            event.preventDefault();
            create.mutate({ title, body, isPinned });
          }}
        >
          <p className="text-[15px] font-semibold tracking-[-0.02em]">New announcement</p>
          <p className="mt-1 text-[13px] leading-relaxed text-gray-500">
            Keep the message concise and action-oriented.
          </p>

          <label className="mt-6 block text-xs font-semibold text-gray-600">
            Title
            <input
              required
              placeholder="What participants should know"
              className="admin-input mt-2 text-sm font-normal"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
            />
          </label>

          <label className="mt-4 block text-xs font-semibold text-gray-600">
            Message
            <textarea
              required
              placeholder="Write your update…"
              className="admin-input mt-2 min-h-36 resize-y text-sm font-normal leading-relaxed"
              rows={5}
              value={body}
              onChange={(event) => setBody(event.target.value)}
            />
          </label>

          <label className="mt-4 flex cursor-pointer items-center gap-3 rounded-xl bg-black/[0.025] px-3 py-3 text-sm text-gray-700">
            <input
              type="checkbox"
              checked={isPinned}
              onChange={(event) => setIsPinned(event.target.checked)}
              className="size-4 accent-[#d41486]"
            />
            Pin this announcement to the top
          </label>

          {create.isError && (
            <p className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-700" role="alert">
              {create.error.message}
            </p>
          )}

          <button type="submit" disabled={create.isPending} className="admin-button mt-5 w-full">
            {create.isPending ? "Publishing…" : "Publish announcement"}
          </button>
        </form>

        <section>
          <div className="mb-3 flex items-center justify-between px-1">
            <h2 className="text-sm font-semibold text-gray-900">Published</h2>
            <span className="text-xs text-gray-500">{announcements.data?.length ?? 0} total</span>
          </div>

          {announcements.isLoading ? (
            <div className="admin-card h-44 animate-pulse bg-white/50" />
          ) : announcements.isError ? (
            <div className="admin-card p-5 text-sm text-red-700">{announcements.error.message}</div>
          ) : announcements.data?.length === 0 ? (
            <div className="admin-card px-6 py-16 text-center">
              <div className="mx-auto grid size-11 place-items-center rounded-2xl bg-black/[0.04] text-lg">N</div>
              <p className="mt-4 font-medium">No announcements yet</p>
              <p className="mt-1 text-sm text-gray-500">Your published updates will appear here.</p>
            </div>
          ) : (
            <ul className="space-y-3">
              {announcements.data?.map((announcement) => (
                <li key={announcement.id} className="admin-card p-5 sm:p-6">
                  <div className="flex items-start justify-between gap-5">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-semibold tracking-[-0.02em] text-gray-950">
                          {announcement.title}
                        </p>
                        {announcement.isPinned && (
                          <span className="rounded-full bg-pink-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-[#a20e68]">
                            Pinned
                          </span>
                        )}
                      </div>
                      <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-gray-600">
                        {announcement.body}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => remove.mutate({ id: announcement.id })}
                      disabled={remove.isPending}
                      className="shrink-0 rounded-full px-3 py-1.5 text-xs font-medium text-gray-400 transition hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                    >
                      Delete
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
