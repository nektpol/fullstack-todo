"use client";

import { useState } from "react";

type Todo = {
  id: string;
  title: string;
  description?: string;
  frequency: string;
  is_done: boolean;
};

export default function TodoCard({
  todo,
  onDelete,
  onUpdate,
  onToggleComplete,
}: {
  todo: Todo;
  onDelete: (id: string) => void;
  onUpdate: (
    id: string,
    data: { title: string; description?: string; frequency: string }
  ) => Promise<void>;
  onToggleComplete: (id: string, isDone: boolean) => void;
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(todo.title);
  const [description, setDescription] = useState(todo.description ?? "");
  const [frequency, setFrequency] = useState(todo.frequency);

  const handleSave = async () => {
    if (!title.trim()) return;

    await onUpdate(todo.id, {
      title: title.trim(),
      description: description.trim(),
      frequency,
    });

    setIsEditing(false);
  };

  return (
    <div
      className={`rounded-xl border bg-white px-3 py-2 shadow-sm ${
        todo.is_done ? "border-emerald-200" : "border-slate-200"
      }`}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2">
          <button
            type="button"
            className="inline-flex h-7 w-7 items-center justify-center rounded-md text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
            onClick={() => setIsExpanded((prev) => !prev)}
            aria-label={isExpanded ? "Collapse todo" : "Expand todo"}
            title={isExpanded ? "Collapse" : "Expand"}
          >
            <svg className={`h-4 w-4 transition ${isExpanded ? "rotate-90" : ""}`} viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path
                fillRule="evenodd"
                d="M7.22 4.97a.75.75 0 0 1 1.06 0l4.25 4.25a.75.75 0 0 1 0 1.06l-4.25 4.25a.75.75 0 1 1-1.06-1.06L10.94 10 7.22 6.28a.75.75 0 0 1 0-1.06Z"
                clipRule="evenodd"
              />
            </svg>
          </button>

          <h3
            className={`truncate font-medium ${
              todo.is_done ? "text-emerald-700 line-through" : "text-slate-900"
            }`}
            title={todo.title}
          >
            {todo.title}
          </h3>

          <span className="rounded bg-slate-100 px-2 py-0.5 text-xs text-slate-600">
            {todo.frequency}
          </span>

          {todo.is_done && (
            <span className="rounded bg-emerald-100 px-2 py-0.5 text-xs text-emerald-700">
              Done
            </span>
          )}
        </div>

        <div className="flex shrink-0 items-center gap-1">
          <button
            type="button"
            className="inline-flex h-7 w-7 items-center justify-center rounded-md text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
            onClick={() => {
              setIsExpanded(true);
              setIsEditing((prev) => !prev);
            }}
            aria-label="Edit todo"
            title="Edit"
          >
            <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path d="m13.59 3.41 3 3a2 2 0 0 1 0 2.83l-8.5 8.5a1 1 0 0 1-.45.26l-4 1a1 1 0 0 1-1.22-1.22l1-4a1 1 0 0 1 .26-.45l8.5-8.5a2 2 0 0 1 2.83 0Zm1.59 4.41-3-3-8.2 8.2-.62 2.48 2.48-.62 8.34-8.2Z" />
            </svg>
          </button>

          <button
            type="button"
            className="inline-flex h-7 w-7 items-center justify-center rounded-md text-red-500 transition hover:bg-red-50 hover:text-red-600"
            onClick={() => onDelete(todo.id)}
            aria-label="Delete todo"
            title="Delete"
          >
            <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path
                fillRule="evenodd"
                d="M8.5 2.5a1.5 1.5 0 0 0-1.415 1H4.75a.75.75 0 0 0 0 1.5h.5v10a2 2 0 0 0 2 2h5.5a2 2 0 0 0 2-2V5h.5a.75.75 0 0 0 0-1.5h-2.335A1.5 1.5 0 0 0 11.5 2.5h-3Zm-.75 2.25a.75.75 0 0 1 .75-.75h3a.75.75 0 0 1 .75.75v.75h-4.5v-.75Zm2 3a.75.75 0 0 0-1.5 0v6a.75.75 0 0 0 1.5 0v-6Zm2.75-.75a.75.75 0 0 1 .75.75v6a.75.75 0 0 1-1.5 0v-6a.75.75 0 0 1 .75-.75Z"
                clipRule="evenodd"
              />
            </svg>
          </button>

          <button
            type="button"
            className={`inline-flex h-7 w-7 items-center justify-center rounded-md transition ${
              todo.is_done
                ? "text-emerald-700 hover:bg-emerald-100"
                : "text-emerald-600 hover:bg-emerald-50"
            }`}
            onClick={() => onToggleComplete(todo.id, todo.is_done)}
            aria-label={todo.is_done ? "Unmark as done" : "Mark as done"}
            title={todo.is_done ? "Uncheck" : "Check"}
          >
            <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path
                fillRule="evenodd"
                d="M16.704 5.29a1 1 0 0 1 .006 1.414l-8 8.07a1 1 0 0 1-1.42.004L3.29 10.745a1 1 0 1 1 1.42-1.408l3.29 3.318 7.29-7.359a1 1 0 0 1 1.414-.006Z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="mt-3 border-t border-slate-100 pt-3">
          {isEditing ? (
            <div className="grid gap-2">
              <input
                className="rounded border border-slate-300 px-3 py-2 text-sm"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Title"
              />
              <textarea
                className="min-h-20 rounded border border-slate-300 px-3 py-2 text-sm"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Description"
              />
              <select
                className="rounded border border-slate-300 px-3 py-2 text-sm"
                value={frequency}
                onChange={(e) => setFrequency(e.target.value)}
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  className="rounded-md bg-slate-900 px-3 py-1.5 text-sm text-white transition hover:bg-slate-800 disabled:opacity-60"
                  onClick={handleSave}
                  disabled={!title.trim()}
                >
                  Save
                </button>
                <button
                  type="button"
                  className="rounded-md px-3 py-1.5 text-sm text-slate-600 transition hover:bg-slate-100"
                  onClick={() => {
                    setIsEditing(false);
                    setTitle(todo.title);
                    setDescription(todo.description ?? "");
                    setFrequency(todo.frequency);
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <p className="text-sm text-slate-600">
              {todo.description?.trim() ? todo.description : "No description"}
            </p>
          )}
        </div>
      )}
    </div>
  );
}