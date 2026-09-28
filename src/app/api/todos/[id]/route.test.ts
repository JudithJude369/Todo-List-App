import { describe, it, expect, beforeEach } from "vitest";
import { PATCH, DELETE } from "@/app/api/todos/[id]/route";
import { GET } from "@/app/api/todos/route";
import { addTodo, listTodos, resetStore, updateTodo } from "@/lib/todoStore";

const base = "http://localhost:3000/api/todos";

function patch(id: string, body: unknown) {
  return PATCH(
    new Request(`${base}/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: typeof body === "string" ? body : JSON.stringify(body),
    }),
    { params: Promise.resolve({ id }) }
  );
}

function del(id: string) {
  return DELETE(new Request(`${base}/${id}`, { method: "DELETE" }), {
    params: Promise.resolve({ id }),
  });
}

describe("PATCH /api/todos/:id", () => {
  beforeEach(() => {
    resetStore();
  });

  it("marks a todo complete", async () => {
    const todo = addTodo("task");
    const res = await patch(todo.id, { completed: true });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.todo.completed).toBe(true);
  });

  it("marks a todo incomplete", async () => {
    const todo = addTodo("task");
    updateTodo(todo.id, { completed: true });
    const res = await patch(todo.id, { completed: false });
    expect((await res.json()).todo.completed).toBe(false);
  });

  it("reorders a todo", async () => {
    const a = addTodo("a");
    addTodo("b");
    const c = addTodo("c");
    const res = await patch(c.id, { position: 0 });
    expect(res.status).toBe(200);
    expect(listTodos().map((t) => t.title)).toEqual(["c", "a", "b"]);
  });

  it("returns 404 for an unknown id", async () => {
    const res = await patch("missing", { completed: true });
    expect(res.status).toBe(404);
    expect((await res.json()).error).toMatch(/not found/i);
  });

  it("returns 400 for a non-boolean completed", async () => {
    const todo = addTodo("task");
    const res = await patch(todo.id, { completed: "yes" });
    expect(res.status).toBe(400);
    expect((await res.json()).error).toMatch(/boolean/i);
  });

  it("returns 400 for an out-of-range position", async () => {
    const todo = addTodo("task");
    const res = await patch(todo.id, { position: 99 });
    expect(res.status).toBe(400);
  });

  it("returns 400 for an empty body", async () => {
    const todo = addTodo("task");
    const res = await patch(todo.id, {});
    expect(res.status).toBe(400);
    expect((await res.json()).error).toMatch(/completed or position/i);
  });

  it("returns 400 for invalid JSON", async () => {
    const todo = addTodo("task");
    const res = await patch(todo.id, "not-json");
    expect(res.status).toBe(400);
    expect((await res.json()).error).toMatch(/invalid JSON/i);
  });
});

describe("DELETE /api/todos/:id", () => {
  beforeEach(() => {
    resetStore();
  });

  it("deletes an existing todo", async () => {
    const todo = addTodo("task");
    const res = await del(todo.id);
    expect(res.status).toBe(200);
    expect((await res.json()).deleted).toBe(true);

    const list = await GET(new Request(base));
    expect((await list.json()).todos).toHaveLength(0);
  });

  it("returns 404 for an unknown id", async () => {
    const res = await del("missing");
    expect(res.status).toBe(404);
    expect((await res.json()).error).toMatch(/not found/i);
  });

  it("leaves other todos untouched", async () => {
    addTodo("keep");
    const target = addTodo("remove");
    await del(target.id);
    const list = await GET(new Request(base));
    const body = await list.json();
    expect(body.todos.map((t: { title: string }) => t.title)).toEqual(["keep"]);
  });
});
