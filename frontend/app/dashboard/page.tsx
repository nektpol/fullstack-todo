"use client";

import { useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

import { getTodos, createTodo, deleteTodo, updateTodo } from "@/lib/api";
import { isAuthenticated } from "@/lib/auth";

import TodoForm from "@/components/TodoForm";
import TodoCard from "@/components/TodoCard";
import AppShell from "@/components/AppShell";

import toast from "react-hot-toast";

type Todo = {
  id: string;
  title: string;
  description?: string;
  frequency: string;
};

export default function Dashboard() {
  const router = useRouter();
  const queryClient = useQueryClient();

  // ---------------------------
  // AUTH GUARD
  // ---------------------------
  useEffect(() => {
    if (!isAuthenticated()) {
      router.push("/login");
    }
  }, [router]);

  // ---------------------------
  // FETCH TODOS
  // ---------------------------
  const { data: todos, isLoading } = useQuery<Todo[]>({
    queryKey: ["todos"],
    queryFn: getTodos,
  });

  // ---------------------------
  // CREATE
  // ---------------------------
  const createMutation = useMutation({
    mutationFn: createTodo,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["todos"] });
      toast.success("Todo created");
    },
    onError: () => toast.error("Failed to create todo"),
  });

  // ---------------------------
  // DELETE
  // ---------------------------
  const deleteMutation = useMutation({
    mutationFn: deleteTodo,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["todos"] });
      toast.success("Todo deleted");
    },
    onError: () => toast.error("Failed to delete todo"),
  });

  // ---------------------------
  // UPDATE
  // ---------------------------
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: any) => updateTodo(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["todos"] });
      toast.success("Todo updated");
    },
    onError: () => toast.error("Failed to update todo"),
  });

  // ---------------------------
  // UI
  // ---------------------------
  return (
    <AppShell>
      <div className="flex flex-col gap-6">

        {/* HEADER */}
        <div>
          <h1 className="text-3xl font-bold">My Todo Dashboard</h1>
          <p className="text-gray-500">
            Manage your daily, weekly and monthly tasks
          </p>
        </div>

        {/* FORM */}
        <TodoForm
          onCreate={(data) => createMutation.mutate(data)}
        />

        {/* STATES */}
        {isLoading && (
          <p className="text-gray-500">Loading todos...</p>
        )}

        {!isLoading && todos?.length === 0 && (
          <p className="text-gray-500">No todos yet</p>
        )}

        {/* LIST */}
        <div className="flex flex-col gap-3">
          {todos?.map((todo) => (
            <TodoCard
              key={todo.id}
              todo={todo}
              onDelete={(id) => deleteMutation.mutate(id)}
              onUpdate={(t) => {
                const newTitle = prompt("New title", t.title);
                if (!newTitle) return;

                updateMutation.mutate({
                  id: t.id,
                  data: {
                    title: newTitle,
                    description: t.description,
                    frequency: t.frequency,
                  },
                });
              }}
            />
          ))}
        </div>

      </div>
    </AppShell>
  );
}