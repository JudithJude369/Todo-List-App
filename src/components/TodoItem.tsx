import type { DragEvent, KeyboardEvent } from "react";
import type { Todo } from "@/lib/types";

interface TodoItemProps {
  todo: Todo;
  index: number;
  isFirst: boolean;
  isLast: boolean;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onReorder: (fromId: string, toId: string) => void;
  onMove: (id: string, direction: -1 | 1) => void;
}

export function TodoItem({
  todo,
  index,
  isFirst,
  isLast,
  onToggle,
  onDelete,
  onReorder,
  onMove,
}: TodoItemProps) {
  const handleDragStart = (e: DragEvent<HTMLLIElement>) => {
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", todo.id);
  };

  const handleDragOver = (e: DragEvent<HTMLLIElement>) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (e: DragEvent<HTMLLIElement>) => {
    e.preventDefault();
    const draggedId = e.dataTransfer.getData("text/plain");
    if (draggedId && draggedId !== todo.id) {
      onReorder(draggedId, todo.id);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLLIElement>) => {
    if (!e.altKey) return;
    if (e.key === "ArrowUp" && !isFirst) {
      e.preventDefault();
      onMove(todo.id, -1);
    } else if (e.key === "ArrowDown" && !isLast) {
      e.preventDefault();
      onMove(todo.id, 1);
    }
  };

  return (
    <li
      draggable
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      aria-label={`Reorder "${todo.title}", item ${index + 1}. Use Alt plus arrow keys to move.`}
      className="group flex items-center gap-3 rounded-lg border border-[var(--border)] bg-[var(--bg)] p-3 shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]"
    >
      <span
        aria-hidden="true"
        title="Drag to reorder"
        className="cursor-grab text-[var(--muted)] active:cursor-grabbing"
      >
        <svg
          className="h-4 w-4"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M7 4a1 1 0 1 1-2 0 1 1 0 0 1 2 0Zm0 6a1 1 0 1 1-2 0 1 1 0 0 1 2 0Zm-1 7a1 1 0 1 0 0-2 1 1 0 0 0 0 2Zm8-13a1 1 0 1 1-2 0 1 1 0 0 1 2 0Zm-1 7a1 1 0 1 0 0-2 1 1 0 0 0 0 2Zm1 5a1 1 0 1 1-2 0 1 1 0 0 1 2 0Z" />
        </svg>
      </span>

      <label className="relative flex cursor-pointer items-center">
        <input
          type="checkbox"
          checked={todo.completed}
          onChange={() => onToggle(todo.id)}
          className="peer sr-only"
          aria-label={`Mark "${todo.title}" as ${todo.completed ? "incomplete" : "complete"}`}
        />
        <div className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-[var(--border)] peer-checked:border-[var(--accent)] peer-checked:bg-[var(--accent)]">
          {todo.completed && (
            <svg
              className="h-3.5 w-3.5 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={3}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5 13l4 4L19 7"
              />
            </svg>
          )}
        </div>
      </label>

      <span
        className={`flex-1 break-words text-[var(--text)] ${
          todo.completed ? "line-through opacity-60" : ""
        }`}
      >
        {todo.title}
      </span>

      <button
        type="button"
        onClick={() => onMove(todo.id, -1)}
        disabled={isFirst}
        aria-label={`Move "${todo.title}" up`}
        className="rounded-md p-1 text-[var(--muted)] hover:bg-[var(--border)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--accent)] disabled:cursor-not-allowed disabled:opacity-40"
      >
        <svg
          className="h-4 w-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
        </svg>
      </button>

      <button
        type="button"
        onClick={() => onMove(todo.id, 1)}
        disabled={isLast}
        aria-label={`Move "${todo.title}" down`}
        className="rounded-md p-1 text-[var(--muted)] hover:bg-[var(--border)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--accent)] disabled:cursor-not-allowed disabled:opacity-40"
      >
        <svg
          className="h-4 w-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      <button
        type="button"
        onClick={() => onDelete(todo.id)}
        aria-label={`Delete "${todo.title}"`}
        className="rounded-md p-1 text-[var(--muted)] hover:bg-red-500/10 hover:text-red-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-red-500"
      >
        <svg
          className="h-4 w-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M10 7V4a1 1 0 011-1h2a1 1 0 011 1v3"
          />
        </svg>
      </button>
    </li>
  );
}
