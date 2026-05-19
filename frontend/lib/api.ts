const BASE_URL = "http://localhost:3000";

function getToken() {
  return typeof window !== "undefined"
    ? localStorage.getItem("token")
    : null;
}

export async function getTodos() {
  const res = await fetch(`${BASE_URL}/todos`, {
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
  });

  if (!res.ok) throw new Error("Failed to fetch todos");
  return res.json();
}

export async function createTodo(todo: {
  title: string;
  description?: string;
  frequency: string;
}) {
  const res = await fetch(`${BASE_URL}/todos`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getToken()}`,
    },
    body: JSON.stringify(todo),
  });

  if (!res.ok) throw new Error("Failed to create todo");
  return res.json();
}

export async function deleteTodo(id: string) {
  const res = await fetch(`${BASE_URL}/todos/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
  });

  if (!res.ok) throw new Error("Failed to delete todo");
  return res.json();
}

export async function updateTodo(
  id: string,
  todo: {
    title: string;
    description?: string;
    frequency: string;
  }
) {
  const res = await fetch(`${BASE_URL}/todos/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getToken()}`,
    },
    body: JSON.stringify(todo),
  });

  if (!res.ok) throw new Error("Failed to update todo");
  return res.json();
}

export async function markTodoDone(id: string) {
  const res = await fetch(`${BASE_URL}/todos/${id}/complete`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(errorText || `Failed to mark todo as done (${res.status})`);
  }
  return res.json();
}

