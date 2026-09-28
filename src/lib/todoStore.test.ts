import { describe, it, expect, beforeEach } from "vitest";
import {
  addTodo,
  clearCompleted,
  deleteTodo,
  findTodo,
  listTodos,
  resetStore,
  updateTodo,
  validateTitle,
} from "@/lib/todoStore";

describe("todoStore", () => {
  beforeEach(() => {
    resetStore();
  });

  describe("listTodos", () => {
    it("returns an empty list initially", () => {
      expect(listTodos()).toEqual([]);
    });

    it("returns every todo when no filter is given", () => {
      addTodo("one");
      addTodo("two");
      expect(listTodos()).toHaveLength(2);
    });

    it("filters to active todos", () => {
      const a = addTodo("active one");
      const b = addTodo("completed one");
      updateTodo(b.id, { completed: true });
      expect(listTodos("active").map((t) => t.title)).toEqual(["active one"]);
      expect(a.completed).toBe(false);
    });

    it("filters to completed todos", () => {
      const a = addTodo("done");
      addTodo("pending");
      updateTodo(a.id, { completed: true });
      expect(listTodos("completed").map((t) => t.title)).toEqual(["done"]);
      expect(listTodos("active").map((t) => t.title)).toEqual(["pending"]);
    });
  });

  describe("validateTitle", () => {
    it("accepts a normal title", () => {
      expect(validateTitle("buy milk")).toEqual({ ok: true, title: "buy milk" });
    });

    it("trims whitespace", () => {
      expect(validateTitle("  spaced  ")).toEqual({ ok: true, title: "spaced" });
    });

    it("rejects an empty title", () => {
      const result = validateTitle("");
      expect(result.ok).toBe(false);
      expect(result.error).toMatch(/empty/i);
    });

    it("rejects a whitespace-only title", () => {
      expect(validateTitle("    ").ok).toBe(false);
    });

    it("rejects a non-string title", () => {
      expect(validateTitle(42).ok).toBe(false);
      expect(validateTitle(null).ok).toBe(false);
      expect(validateTitle(undefined).ok).toBe(false);
      expect(validateTitle({}).ok).toBe(false);
    });

    it("rejects a title over 200 characters", () => {
      expect(validateTitle("a".repeat(201)).ok).toBe(false);
    });

    it("accepts a title of exactly 200 characters", () => {
      expect(validateTitle("a".repeat(200)).ok).toBe(true);
    });
  });

  describe("addTodo", () => {
    it("creates an incomplete todo with a generated id", () => {
      const todo = addTodo("new task");
      expect(todo.title).toBe("new task");
      expect(todo.completed).toBe(false);
      expect(todo.id).toBeTruthy();
    });

    it("gives each todo a unique id", () => {
      expect(addTodo("a").id).not.toBe(addTodo("b").id);
    });

    it("assigns increasing positions", () => {
      expect(addTodo("a").position).toBe(0);
      expect(addTodo("b").position).toBe(1);
    });
  });

  describe("updateTodo", () => {
    it("marks a todo complete", () => {
      const todo = addTodo("task");
      const result = updateTodo(todo.id, { completed: true });
      expect(result.ok).toBe(true);
      expect(result.todo?.completed).toBe(true);
    });

    it("rejects a non-boolean completed", () => {
      const todo = addTodo("task");
      const result = updateTodo(todo.id, { completed: "yes" });
      expect(result.ok).toBe(false);
      expect(result.error).toMatch(/boolean/i);
    });

    it("returns not found for an unknown id", () => {
      const result = updateTodo("nope", { completed: true });
      expect(result.ok).toBe(false);
      expect(result.error).toMatch(/not found/i);
    });

    it("moves a todo to a new position", () => {
      const a = addTodo("a");
      const b = addTodo("b");
      const c = addTodo("c");
      updateTodo(c.id, { position: 0 });
      expect(listTodos().map((t) => t.title)).toEqual(["c", "a", "b"]);
      expect(listTodos().map((t) => t.position)).toEqual([0, 1, 2]);
      expect(b.position).toBe(2);
    });

    it("rejects an out-of-range position", () => {
      const todo = addTodo("a");
      expect(updateTodo(todo.id, { position: 5 }).ok).toBe(false);
      expect(updateTodo(todo.id, { position: -1 }).ok).toBe(false);
      expect(updateTodo(todo.id, { position: 1.5 }).ok).toBe(false);
      expect(updateTodo(todo.id, { position: "x" }).ok).toBe(false);
    });
  });

  describe("deleteTodo", () => {
    it("removes an existing todo", () => {
      const todo = addTodo("task");
      expect(deleteTodo(todo.id)).toBe(true);
      expect(listTodos()).toEqual([]);
    });

    it("returns false for an unknown id", () => {
      expect(deleteTodo("nope")).toBe(false);
    });

    it("resets positions of the remaining todos", () => {
      addTodo("a");
      const b = addTodo("b");
      addTodo("c");
      deleteTodo(b.id);
      expect(listTodos().map((t) => t.position)).toEqual([0, 1]);
    });
  });

  describe("findTodo", () => {
    it("returns the todo when it exists", () => {
      const todo = addTodo("findable");
      expect(findTodo(todo.id)?.title).toBe("findable");
    });

    it("returns undefined for an unknown id", () => {
      expect(findTodo("missing")).toBeUndefined();
    });
  });

  describe("clearCompleted", () => {
    it("removes only completed todos and reports the count", () => {
      const a = addTodo("keep");
      addTodo("drop");
      updateTodo(a.id, { completed: false });
      const b = listTodos()[1];
      updateTodo(b.id, { completed: true });

      expect(clearCompleted()).toBe(1);
      expect(listTodos().map((t) => t.title)).toEqual(["keep"]);
    });

    it("returns 0 when nothing is completed", () => {
      addTodo("keep");
      expect(clearCompleted()).toBe(0);
    });
  });
});
