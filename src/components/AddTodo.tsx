import { useState } from "react";

interface AddTodoProps {
  onAdd: (title: string) => void;
}

export function AddTodo({ onAdd }: AddTodoProps) {
  const [value, setValue] = useState("");
  const [error, setError] = useState("");

  const submit = () => {
    const trimmed = value.trim();
    if (!trimmed) {
      setError("Please enter a todo");
      return;
    }
    if (trimmed.length > 200) {
      setError("Todo must be 200 characters or fewer");
      return;
    }
    onAdd(trimmed);
    setValue("");
    setError("");
  };

  return (
    <div className="flex gap-2">
      <input
        type="text"
        value={value}
        onChange={(e) => {
          setValue(e.target.value);
          if (error) setError("");
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter") submit();
        }}
        placeholder="What needs to be done?"
        aria-label="New todo"
        aria-invalid={!!error}
        aria-describedby={error ? "add-todo-error" : undefined}
        className="flex-1 rounded-lg border border-[var(--border)] bg-[var(--bg)] px-4 py-3 text-[var(--text)] placeholder:text-[var(--muted)] focus:border-[var(--accent)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/30"
      />
      <button
        type="button"
        onClick={submit}
        aria-label="Add todo"
        className="rounded-lg bg-[var(--accent)] px-5 py-3 font-medium text-white hover:bg-[var(--accent-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]/40"
      >
        Add
      </button>
      {error && (
        <p id="add-todo-error" className="sr-only" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}