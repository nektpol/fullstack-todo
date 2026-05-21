"use client";

import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

import {
  getTodos,
  createTodo,
  deleteTodo,
  updateTodo,
  markTodoDone,
  unmarkTodoDone,
} from "@/lib/api";
import { isAuthenticated } from "@/lib/auth";

import TodoForm from "@/components/TodoForm";
import TodoCard from "@/components/TodoCard";
import AppShell from "../../components/AppShell";

import toast from "react-hot-toast";

type Todo = {
  id: string;
  title: string;
  description?: string;
  frequency: string;
  is_done: boolean;
  completed_at?: string;
};

export default function Dashboard() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [showCreateForm, setShowCreateForm] = useState(false);

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

  const sortedTodos = todos
    ? [...todos].sort((a, b) => Number(a.is_done) - Number(b.is_done))
    : [];

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

  const completeMutation = useMutation({
    mutationFn: markTodoDone,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["todos"] });
      toast.success("Todo marked as done");
    },
    onError: (err: unknown) => {
      const message = err instanceof Error ? err.message : "Failed to mark todo as done";
      toast.error(message);
    },
  });

  const uncompleteMutation = useMutation({
    mutationFn: unmarkTodoDone,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["todos"] });
      toast.success("Todo unchecked");
    },
    onError: (err: unknown) => {
      const message = err instanceof Error ? err.message : "Failed to uncheck todo";
      toast.error(message);
    },
  });

  // ---------------------------
  // UI
  // ---------------------------
  return (
    <AppShell onCreateTodo={() => setShowCreateForm(true)}>
      <div className="flex flex-col gap-6">

        {/* HEADER */}
        <div className="rounded-2xl border border-slate-200 bg-white px-6 py-5 shadow-sm">
          <h1 className="text-3xl font-bold">My Todo Dashboard</h1>
          <p className="text-slate-500">
            Manage your daily, weekly and monthly tasks
          </p>
        </div>

        {/* CREATE TODO CTA */}
        {!showCreateForm && (
          <button
            onClick={() => setShowCreateForm(true)}
            className="inline-flex w-fit items-center rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800"
          >
            + Create New Todo
          </button>
        )}

        {/* FORM */}
        {showCreateForm && (
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-800">Create a new todo</h2>
              <button
                onClick={() => setShowCreateForm(false)}
                className="rounded-lg px-3 py-1.5 text-sm text-slate-600 transition hover:bg-slate-100"
              >
                Close
              </button>
            </div>

            <TodoForm
              onCreate={(data) => {
                createMutation.mutate(data);
                setShowCreateForm(false);
              }}
            />
          </div>
        )}

        {/* STATES */}
        {isLoading && (
          <p className="text-slate-500">Loading todos...</p>
        )}

        {!isLoading && todos?.length === 0 && (
          <p className="text-slate-500">No todos yet</p>
        )}

        {/* LIST */}
        <div className="flex flex-col gap-3">
          {sortedTodos.map((todo) => (
            <TodoCard
              key={todo.id}
              todo={todo}
              onDelete={(id) => deleteMutation.mutate(id)}
              onToggleComplete={(id, isDone) => {
                if (isDone) {
                  uncompleteMutation.mutate(id);
                  return;
                }
                completeMutation.mutate(id);
              }}
              onUpdate={async (id, data) => {
                setShowCreateForm(false);
                await updateMutation.mutateAsync({ id, data });
              }}
            />
          ))}
        </div>

      </div>
    </AppShell>
  );
}