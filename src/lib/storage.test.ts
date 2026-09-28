import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import {
  getInitialTheme,
  setTheme,
  getInitialTodos,
  saveTodos,
  createTodo,
} from "@/lib/storage";
import type { Todo } from "@/lib/types";

describe("storage utilities", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  describe("theme", () => {
    it("returns light when nothing stored and prefers-color-scheme is light", () => {
      expect(getInitialTheme()).toBe("light");
    });

    it("returns stored theme", () => {
      setTheme("dark");
      expect(getInitialTheme()).toBe("dark");
    });

    it("persists theme to localStorage", () => {
      setTheme("dark");
      expect(window.localStorage.getItem("todo-theme")).toBe("dark");
    });
  });

  describe("todos", () => {
    it("returns empty array when nothing stored", () => {
      expect(getInitialTodos()).toEqual([]);
    });

    it("returns stored todos", () => {
      const todos: Todo[] = [
        { id: "1", title: "a", completed: false, createdAt: "x", updatedAt: "x" },
      ];
      saveTodos(todos);
      expect(getInitialTodos()).toEqual(todos);
    });

    it("returns empty array on invalid JSON", () => {
      window.localStorage.setItem("todo-todos", "not-json");
      expect(getInitialTodos()).toEqual([]);
    });

    it("returns empty array when stored value is not an array", () => {
      window.localStorage.setItem("todo-todos", JSON.stringify({}));
      expect(getInitialTodos()).toEqual([]);
    });
  });

  describe("createTodo", () => {
    it("trims the title", () => {
      const t = createTodo("  hello  ");
      expect(t.title).toBe("hello");
    });

    it("generates a unique id", () => {
      const a = createTodo("a");
      const b = createTodo("b");
      expect(a.id).not.toBe(b.id);
    });

    it("sets completed to false and timestamps", () => {
      const t = createTodo("x");
      expect(t.completed).toBe(false);
      expect(typeof t.createdAt).toBe("string");
      expect(typeof t.updatedAt).toBe("string");
    });
  });
});