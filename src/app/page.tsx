"use client";

import { useEffect, useMemo, useState } from "react";
import { ThemeProvider, useTheme } from "@/components/ThemeProvider";
import { AddTodo } from "@/components/AddTodo";
import { TodoItem } from "@/components/TodoItem";
import { FilterBar } from "@/components/FilterBar";
import {
  getInitialTodos,
  saveTodos,
  createTodo,
} from "@/lib/storage";
import type { Filter, Todo } from "@/lib/types";

function TodoApp() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [filter, setFilter] = useState<Filter>("all");
  const { theme, setTheme, mounted } = useTheme();
  const [hydrated, setHydrated] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    setTodos(getInitialTodos());
    setHydrated(true);
  }, []);

  // Persist only after the stored todos have been loaded, so the initial
  // empty state can never overwrite existing data
  useEffect(() => {
    if (!hydrated) return;
    saveTodos(todos);
  }, [todos, hydrated]);

  const addTodo = (title: string) => {
    setTodos((prev) => [...prev, createTodo(title)]);
  };

  const toggleTodo = (id: string) => {
    setTodos((prev) =>
      prev.map((t) =>
        t.id === id ? { ...t, completed: !t.completed, updatedAt: new Date().toISOString() } : t
      )
    );
  };

  const deleteTodo = (id: string) => {
    setTodos((prev) => prev.filter((t) => t.id !== id));
  };

  const clearCompleted = () => {
    setTodos((prev) => prev.filter((t) => !t.completed));
  };

  const reorder = (fromId: string, toId: string) => {
    setTodos((prev) => {
      const from = prev.findIndex((t) => t.id === fromId);
      const to = prev.findIndex((t) => t.id === toId);
      if (from === -1 || to === -1 || from === to) return prev;
      const next = [...prev];
      const [moved] = next.splice(from, 1);
      next.splice(to, 0, moved);
      return next.map((t, i) => ({ ...t, position: i }));
    });
  };

  const move = (id: string, direction: -1 | 1) => {
    setTodos((prev) => {
      const from = prev.findIndex((t) => t.id === id);
      const to = from + direction;
      if (from === -1 || to < 0 || to >= prev.length) return prev;
      const next = [...prev];
      [next[from], next[to]] = [next[to], next[from]];
      return next.map((t, i) => ({ ...t, position: i }));
    });
  };

  const filteredTodos = useMemo(() => {
    switch (filter) {
      case "active":
        return todos.filter((t) => !t.completed);
      case "completed":
        return todos.filter((t) => t.completed);
      default:
        return todos;
    }
  }, [todos, filter]);

  const remaining = todos.filter((t) => !t.completed).length;
  const hasCompleted = todos.some((t) => t.completed);

  return (
    <main className="min-h-screen bg-[var(--bg)] text-[var(--text)]">
      <div className="mx-auto w-full max-w-2xl px-4 py-8 sm:py-12">
        <header className="mb-8 flex items-center justify-between">
          <h1 className="text-2xl font-bold sm:text-3xl">Todo</h1>
          <button
            type="button"
            onClick={() => setTheme(theme === "light" ? "dark" : "light")}
            aria-label="Toggle theme"
            title="Toggle theme"
            className="flex h-10 w-10 items-center justify-center rounded-lg border border-[var(--border)] bg-[var(--bg)] text-[var(--text)] hover:bg-[var(--border)]"
          >
            {mounted && theme === "light" ? (
              <svg
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"
                />
              </svg>
            ) : (
              <svg
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 3v2m0 14v2m9-9h-2M5 12H3m15.36 6.36l-1.42-1.42M7.05 7.05L5.64 5.64m12.72 0l-1.42 1.42M7.05 16.95l-1.41 1.42M12 8a4 4 0 100 8 4 4 0 000-8z"
                />
              </svg>
            )}
          </button>
        </header>

        <div className="rounded-xl border border-[var(--border)] bg-[var(--bg)] p-4 shadow-sm sm:p-6">
          <AddTodo onAdd={addTodo} />

          <ul className="mt-4 space-y-2">
            {filteredTodos.length === 0 ? (
              <li className="py-8 text-center text-[var(--muted)]">
                {todos.length === 0
                  ? "No todos yet. Add one above!"
                  : filter === "active"
                    ? "No active todos. Great job!"
                    : "No completed todos yet."}
              </li>
            ) : (
              filteredTodos.map((todo, i) => (
                <TodoItem
                  key={todo.id}
                  todo={todo}
                  index={i}
                  isFirst={i === 0}
                  isLast={i === filteredTodos.length - 1}
                  onToggle={toggleTodo}
                  onDelete={deleteTodo}
                  onReorder={reorder}
                  onMove={move}
                />
              ))
            )}
          </ul>

          <FilterBar
            filter={filter}
            onFilterChange={setFilter}
            remaining={remaining}
            hasCompleted={hasCompleted}
            onClearCompleted={clearCompleted}
          />
        </div>

        <footer className="mt-6 text-center text-xs text-[var(--muted)]">
          Press Enter to add · Tab to navigate · Click to toggle
        </footer>
      </div>
    </main>
  );
}

export default function Home() {
  return (
    <ThemeProvider>
      <TodoApp />
    </ThemeProvider>
  );
}