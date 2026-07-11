'use client';

import { trpc } from '@/utils/trpc';
import { useState } from 'react';

export default function AnnouncementsPage() {
  const utils = trpc.useUtils();
  const announcements = trpc.announcements.list.useQuery();
  const create = trpc.announcements.create.useMutation({
    onSuccess: () => utils.announcements.list.invalidate()
  });
  const remove = trpc.announcements.delete.useMutation({
    onSuccess: () => utils.announcements.list.invalidate()
  });

  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [isPinned, setIsPinned] = useState(false);

  return (
    <div>
      <h1 className="mb-4 text-lg font-semibold">Announcements</h1>
      <form
        className="mb-6 flex flex-col gap-3 rounded border p-4"
        onSubmit={(e) => {
          e.preventDefault();
          create.mutate({ title, body, isPinned });
          setTitle('');
          setBody('');
          setIsPinned(false);
        }}
      >
        <input
          required
          placeholder="Title"
          className="rounded border px-3 py-2 text-sm"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <textarea
          required
          placeholder="Message"
          className="rounded border px-3 py-2 text-sm"
          rows={3}
          value={body}
          onChange={(e) => setBody(e.target.value)}
        />
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={isPinned} onChange={(e) => setIsPinned(e.target.checked)} />
          Pin to top
        </label>
        <button
          type="submit"
          disabled={create.isPending}
          className="self-start rounded bg-black px-3 py-2 text-sm text-white disabled:opacity-50"
        >
          {create.isPending ? 'Posting…' : 'Post announcement'}
        </button>
      </form>

      <ul className="flex flex-col gap-2">
        {announcements.data?.map((a) => (
          <li key={a.id} className="rounded border p-3 text-sm">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="font-medium">
                  {a.isPinned && '📌 '}
                  {a.title}
                </p>
                <p className="text-gray-600">{a.body}</p>
              </div>
              <button
                onClick={() => remove.mutate({ id: a.id })}
                className="shrink-0 text-xs text-gray-400 hover:text-red-600"
              >
                Delete
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
