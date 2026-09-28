import { describe, it, expect, beforeEach } from "vitest";
import { GET, POST, DELETE } from "@/app/api/todos/route";
import { resetStore, addTodo, updateTodo } from "@/lib/todoStore";

const url = "http://localhost:3000/api/todos";

function post(body: unknown) {
  return POST(
    new Request(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: typeof body === "string" ? body : JSON.stringify(body),
    })
  );
}

describe("GET /api/todos", () => {
  beforeEach(() => {
    resetStore();
  });

  it("returns an empty list", async () => {
    const res = await GET(new Request(url));
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ todos: [] });
  });

  it("returns all todos", async () => {
    addTodo("one");
    addTodo("two");
    const res = await GET(new Request(url));
    const body = await res.json();
    expect(res.status).toBe(200);
    expect(body.todos).toHaveLength(2);
  });

  it("filters to active todos", async () => {
    const a = addTodo("active");
    const b = addTodo("done");
    updateTodo(b.id, { completed: true });
    const res = await GET(new Request(`${url}?filter=active`));
    const body = await res.json();
    expect(body.todos.map((t: { title: string }) => t.title)).toEqual(["active"]);
    expect(a.title).toBe("active");
  });

  it("filters to completed todos", async () => {
    const a = addTodo("active");
    const b = addTodo("done");
    updateTodo(b.id, { completed: true });
    const res = await GET(new Request(`${url}?filter=completed`));
    const body = await res.json();
    expect(body.todos.map((t: { title: string }) => t.title)).toEqual(["done"]);
    expect(a.title).toBe("active");
  });

  it("rejects an unknown filter", async () => {
    const res = await GET(new Request(`${url}?filter=bogus`));
    expect(res.status).toBe(400);
    expect((await res.json()).error).toMatch(/filter/i);
  });
});

describe("POST /api/todos", () => {
  beforeEach(() => {
    resetStore();
  });

  it("creates a todo and returns 201", async () => {
    const res = await post({ title: "buy milk" });
    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body.todo.title).toBe("buy milk");
    expect(body.todo.completed).toBe(false);
    expect(body.todo.id).toBeTruthy();
  });

  it("trims the title", async () => {
    const res = await post({ title: "  spaced  " });
    expect((await res.json()).todo.title).toBe("spaced");
  });

  it("rejects an empty title with 400", async () => {
    const res = await post({ title: "" });
    expect(res.status).toBe(400);
    expect((await res.json()).error).toMatch(/empty/i);
  });

  it("rejects a whitespace-only title with 400", async () => {
    const res = await post({ title: "   " });
    expect(res.status).toBe(400);
  });

  it("rejects a missing title with 400", async () => {
    const res = await post({});
    expect(res.status).toBe(400);
  });

  it("rejects a non-string title with 400", async () => {
    const res = await post({ title: 5 });
    expect(res.status).toBe(400);
  });

  it("rejects a title over 200 characters with 400", async () => {
    const res = await post({ title: "a".repeat(201) });
    expect(res.status).toBe(400);
  });

  it("rejects invalid JSON with 400", async () => {
    const res = await post("not-json");
    expect(res.status).toBe(400);
    expect((await res.json()).error).toMatch(/invalid JSON/i);
  });

  it("does not store a todo when validation fails", async () => {
    await post({ title: "" });
    const res = await GET(new Request(url));
    expect((await res.json()).todos).toHaveLength(0);
  });
});

describe("DELETE /api/todos?completed=true", () => {
  beforeEach(() => {
    resetStore();
  });

  it("removes completed todos and reports the count", async () => {
    const keep = addTodo("keep");
    const drop = addTodo("drop");
    updateTodo(drop.id, { completed: true });
    expect(keep.title).toBe("keep");

    const res = await DELETE(new Request(`${url}?completed=true`));
    expect(res.status).toBe(200);
    expect((await res.json()).deleted).toBe(1);

    const list = await GET(new Request(url));
    const body = await list.json();
    expect(body.todos.map((t: { title: string }) => t.title)).toEqual(["keep"]);
  });

  it("returns 0 when nothing is completed", async () => {
    addTodo("keep");
    const res = await DELETE(new Request(`${url}?completed=true`));
    expect((await res.json()).deleted).toBe(0);
  });

  it("requires the completed=true query param", async () => {
    addTodo("keep");
    const res = await DELETE(new Request(url));
    expect(res.status).toBe(400);
    expect((await res.json()).error).toMatch(/completed=true/);
  });
});
