"use client";

import { useEffect, useState } from "react";
import {
  getTodos,
  createTodo,
  deleteTodo,
  updateTodo,
} from "@/lib/api";

type Todo = {
  id: string;
  title: string;
  description?: string;
  frequency: string;
};

export default function Dashboard() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [frequency, setFrequency] = useState("daily");

  const load = async () => {
    const data = await getTodos();
    setTodos(data);
  };

  useEffect(() => {
    load();
  }, []);

  const handleCreate = async () => {
    await createTodo({ title, description, frequency });
    setTitle("");
    setDescription("");
    load();
  };

  const handleDelete = async (id: string) => {
    await deleteTodo(id);
    load();
  };

  const handleUpdate = async (todo: Todo) => {
    const newTitle = prompt("New title", todo.title);
    if (!newTitle) return;

    await updateTodo(todo.id, {
      title: newTitle,
      description: todo.description,
      frequency: todo.frequency,
    });

    load();
  };

  return (
    <div style={{ padding: 40 }}>
      <h1>Todo Dashboard</h1>

      {/* CREATE */}
      <div style={{ marginBottom: 20 }}>
        <input
          placeholder="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <input
          placeholder="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        <select
          value={frequency}
          onChange={(e) => setFrequency(e.target.value)}
        >
          <option value="daily">daily</option>
          <option value="weekly">weekly</option>
          <option value="monthly">monthly</option>
        </select>

        <button onClick={handleCreate}>Add</button>
      </div>

      {/* LIST */}
      {todos.map((todo) => (
        <div key={todo.id} style={{ marginBottom: 10 }}>
          <h3>{todo.title}</h3>
          <p>{todo.description}</p>
          <small>{todo.frequency}</small>

          <div>
            <button onClick={() => handleUpdate(todo)}>Edit</button>
            <button onClick={() => handleDelete(todo.id)}>Delete</button>
          </div>
        </div>
      ))}
    </div>
  );
}