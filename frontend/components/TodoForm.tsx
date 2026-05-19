"use client";

import { useState } from "react";

export default function TodoForm({
  onCreate,
}: {
  onCreate: (data: {
    title: string;
    description: string;
    frequency: string;
  }) => void;
}) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [frequency, setFrequency] = useState("daily");

  return (
    <div className="bg-white shadow rounded-xl p-4 flex flex-col gap-3">
      <input
        className="border p-2 rounded"
        placeholder="Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />

      <input
        className="border p-2 rounded"
        placeholder="Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />

      <select
        className="border p-2 rounded"
        value={frequency}
        onChange={(e) => setFrequency(e.target.value)}
      >
        <option value="daily">Daily</option>
        <option value="weekly">Weekly</option>
        <option value="monthly">Monthly</option>
      </select>

      <button
        className="bg-black text-white rounded p-2 hover:opacity-80"
        onClick={() => {
          onCreate({ title, description, frequency });
          setTitle("");
          setDescription("");
        }}
      >
        Create Todo
      </button>
    </div>
  );
}