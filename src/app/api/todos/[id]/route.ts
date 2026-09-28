import { NextResponse } from "next/server";
import { deleteTodo, updateTodo } from "@/lib/todoStore";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Params) {
  const { id } = await params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid JSON body" }, { status: 400 });
  }

  const { completed, position } = (body ?? {}) as {
    completed?: unknown;
    position?: unknown;
  };

  if (completed === undefined && position === undefined) {
    return NextResponse.json(
      { error: "provide completed or position" },
      { status: 400 }
    );
  }

  const result = updateTodo(id, { completed, position });
  if (!result.ok) {
    const status = result.error?.match(/not found/i) ? 404 : 400;
    return NextResponse.json({ error: result.error }, { status });
  }

  return NextResponse.json({ todo: result.todo }, { status: 200 });
}

export async function DELETE(_request: Request, { params }: Params) {
  const { id } = await params;
  if (!deleteTodo(id)) {
    return NextResponse.json({ error: "todo not found" }, { status: 404 });
  }
  return NextResponse.json({ deleted: true }, { status: 200 });
}
