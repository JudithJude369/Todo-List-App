import { NextResponse } from "next/server";
import {
  addTodo,
  clearCompleted,
  listTodos,
  validateTitle,
} from "@/lib/todoStore";
import type { Filter } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const filter = new URL(request.url).searchParams.get("filter");
  if (filter !== null && filter !== "all" && filter !== "active" && filter !== "completed") {
    return NextResponse.json(
      { error: "filter must be all, active or completed" },
      { status: 400 }
    );
  }
  const todos = listTodos(filter as Exclude<Filter, "all"> | undefined);
  return NextResponse.json({ todos }, { status: 200 });
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid JSON body" }, { status: 400 });
  }

  const result = validateTitle((body as { title?: unknown })?.title);
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  const todo = addTodo(result.title!);
  return NextResponse.json({ todo }, { status: 201 });
}

export async function DELETE(request: Request) {
  const completed = new URL(request.url).searchParams.get("completed");
  if (completed !== "true") {
    return NextResponse.json(
      { error: "use ?completed=true to clear completed todos" },
      { status: 400 }
    );
  }
  const deleted = clearCompleted();
  return NextResponse.json({ deleted }, { status: 200 });
}
