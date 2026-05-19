const BASE_URL = "http://localhost:3000";

export function getToken() {
  return localStorage.getItem("token");
}

export async function getTodos() {
  const res = await fetch(`${BASE_URL}/todos`, {
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
  });

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

  return res.json();
}

export async function deleteTodo(id: string) {
  const res = await fetch(`${BASE_URL}/todos/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
  });

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

  return res.json();
}