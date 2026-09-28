import type { Todo } from "./types";

export const MAX_TITLE_LENGTH = 200;

const globalStore = globalThis as unknown as {
  __todoStore?: Todo[];
};

function store(): Todo[] {
  if (!globalStore.__todoStore) globalStore.__todoStore = [];
  return globalStore.__todoStore;
}

export function resetStore(): void {
  globalStore.__todoStore = [];
}

export function listTodos(filter?: "active" | "completed"): Todo[] {
  const all = [...store()];
  if (filter === "active") return all.filter((t) => !t.completed);
  if (filter === "completed") return all.filter((t) => t.completed);
  return all;
}

export interface ValidationResult {
  ok: boolean;
  title?: string;
  error?: string;
}

export function validateTitle(raw: unknown): ValidationResult {
  if (typeof raw !== "string") {
    return { ok: false, error: "title must be a string" };
  }
  const title = raw.trim();
  if (title.length === 0) {
    return { ok: false, error: "title must not be empty" };
  }
  if (title.length > MAX_TITLE_LENGTH) {
    return {
      ok: false,
      error: `title must be ${MAX_TITLE_LENGTH} characters or fewer`,
    };
  }
  return { ok: true, title };
}

export function addTodo(title: string): Todo {
  const now = new Date().toISOString();
  const position = store().length;
  const todo: Todo = {
    id: crypto.randomUUID(),
    title,
    completed: false,
    createdAt: now,
    updatedAt: now,
    position,
  };
  store().push(todo);
  return todo;
}

export function findTodo(id: string): Todo | undefined {
  return store().find((t) => t.id === id);
}

export interface PatchResult {
  ok: boolean;
  todo?: Todo;
  error?: string;
}

export function updateTodo(
  id: string,
  patch: { completed?: unknown; position?: unknown }
): PatchResult {
  const todo = findTodo(id);
  if (!todo) return { ok: false, error: "todo not found" };

  if (patch.completed !== undefined) {
    if (typeof patch.completed !== "boolean") {
      return { ok: false, error: "completed must be a boolean" };
    }
    todo.completed = patch.completed;
  }

  if (patch.position !== undefined) {
    const position = Number(patch.position);
    if (!Number.isInteger(position) || position < 0 || position >= store().length) {
      return { ok: false, error: "position must be a valid index" };
    }
    const all = store();
    const from = all.findIndex((t) => t.id === id);
    const [moved] = all.splice(from, 1);
    all.splice(position, 0, moved);
    all.forEach((t, i) => {
      t.position = i;
    });
  }

  todo.updatedAt = new Date().toISOString();
  return { ok: true, todo };
}

export function deleteTodo(id: string): boolean {
  const all = store();
  const index = all.findIndex((t) => t.id === id);
  if (index === -1) return false;
  all.splice(index, 1);
  all.forEach((t, i) => {
    t.position = i;
  });
  return true;
}

export function clearCompleted(): number {
  const all = store();
  const before = all.length;
  const remaining = all.filter((t) => !t.completed);
  globalStore.__todoStore = remaining;
  remaining.forEach((t, i) => {
    t.position = i;
  });
  return before - remaining.length;
}
