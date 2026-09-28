import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { TodoItem } from "@/components/TodoItem";
import type { Todo } from "@/lib/types";

const todo: Todo = {
  id: "1",
  title: "buy milk",
  completed: false,
  createdAt: "x",
  updatedAt: "x",
};

const baseProps = {
  todo,
  index: 0,
  isFirst: true,
  isLast: false,
  onToggle: vi.fn(),
  onDelete: vi.fn(),
  onReorder: vi.fn(),
  onMove: vi.fn(),
};

function mockDataTransfer(initial: Record<string, string> = {}) {
  const store: Record<string, string> = { ...initial };
  return {
    effectAllowed: "",
    dropEffect: "",
    setData: (k: string, v: string) => {
      store[k] = v;
    },
    getData: (k: string) => store[k] ?? "",
  };
}

describe("TodoItem", () => {
  it("renders the title", () => {
    render(<TodoItem {...baseProps} />);
    expect(screen.getByText("buy milk")).toBeInTheDocument();
  });

  it("calls onToggle when checkbox changed", () => {
    const onToggle = vi.fn();
    render(<TodoItem {...baseProps} onToggle={onToggle} />);
    const checkbox = screen.getByRole("checkbox", { name: /mark "buy milk" as complete/i });
    fireEvent.click(checkbox);
    expect(onToggle).toHaveBeenCalledWith("1");
  });

  it("calls onDelete when delete button clicked", () => {
    const onDelete = vi.fn();
    render(<TodoItem {...baseProps} onDelete={onDelete} />);
    fireEvent.click(screen.getByRole("button", { name: /delete "buy milk"/i }));
    expect(onDelete).toHaveBeenCalledWith("1");
  });

  it("shows completed state with line-through", () => {
    const completed = { ...todo, completed: true };
    render(<TodoItem {...baseProps} todo={completed} />);
    expect(screen.getByText("buy milk").className).toContain("line-through");
  });

  it("is draggable", () => {
    render(<TodoItem {...baseProps} />);
    const item = screen.getByText("buy milk").closest("li");
    expect(item).toHaveAttribute("draggable", "true");
  });

  it("calls onReorder when a different item is dropped on it", () => {
    const onReorder = vi.fn();
    render(<TodoItem {...baseProps} todo={todo} onReorder={onReorder} />);
    const item = screen.getByText("buy milk").closest("li")!;
    // a real drag carries the dragged item's id in the transfer
    const dataTransfer = mockDataTransfer({ "text/plain": "2" });

    fireEvent.drop(item, { dataTransfer });
    expect(onReorder).toHaveBeenCalledWith("2", "1");
  });

  it("ignores a drop with no dragged id", () => {
    const onReorder = vi.fn();
    render(<TodoItem {...baseProps} todo={todo} onReorder={onReorder} />);
    const item = screen.getByText("buy milk").closest("li")!;
    fireEvent.drop(item, { dataTransfer: mockDataTransfer() });
    expect(onReorder).not.toHaveBeenCalled();
  });

  it("ignores a drop onto itself", () => {
    const onReorder = vi.fn();
    render(<TodoItem {...baseProps} todo={todo} onReorder={onReorder} />);
    const item = screen.getByText("buy milk").closest("li")!;
    const dataTransfer = mockDataTransfer();

    fireEvent.dragStart(item, { dataTransfer });
    fireEvent.drop(item, { dataTransfer });
    expect(onReorder).not.toHaveBeenCalled();
  });

  it("puts its own id on the drag transfer", () => {
    render(<TodoItem {...baseProps} />);
    const item = screen.getByText("buy milk").closest("li")!;
    const dataTransfer = mockDataTransfer();
    fireEvent.dragStart(item, { dataTransfer });
    expect(dataTransfer.getData("text/plain")).toBe("1");
    expect(dataTransfer.effectAllowed).toBe("move");
  });

  it("calls onMove with -1 from the move up button", () => {
    const onMove = vi.fn();
    render(<TodoItem {...baseProps} isFirst={false} onMove={onMove} />);
    fireEvent.click(screen.getByRole("button", { name: /move "buy milk" up/i }));
    expect(onMove).toHaveBeenCalledWith("1", -1);
  });

  it("calls onMove with 1 from the move down button", () => {
    const onMove = vi.fn();
    render(<TodoItem {...baseProps} onMove={onMove} />);
    fireEvent.click(screen.getByRole("button", { name: /move "buy milk" down/i }));
    expect(onMove).toHaveBeenCalledWith("1", 1);
  });

  it("disables the move up button on the first item", () => {
    render(<TodoItem {...baseProps} isFirst={true} />);
    expect(screen.getByRole("button", { name: /move "buy milk" up/i })).toBeDisabled();
  });

  it("disables the move down button on the last item", () => {
    render(<TodoItem {...baseProps} isLast={true} />);
    expect(screen.getByRole("button", { name: /move "buy milk" down/i })).toBeDisabled();
  });

  it("reorders with Alt plus arrow keys", () => {
    const onMove = vi.fn();
    render(<TodoItem {...baseProps} isFirst={false} isLast={false} onMove={onMove} />);
    const item = screen.getByText("buy milk").closest("li")!;

    fireEvent.keyDown(item, { key: "ArrowUp", altKey: true });
    fireEvent.keyDown(item, { key: "ArrowDown", altKey: true });
    expect(onMove).toHaveBeenNthCalledWith(1, "1", -1);
    expect(onMove).toHaveBeenNthCalledWith(2, "1", 1);
  });

  it("ignores arrow keys without Alt", () => {
    const onMove = vi.fn();
    render(<TodoItem {...baseProps} isFirst={false} isLast={false} onMove={onMove} />);
    const item = screen.getByText("buy milk").closest("li")!;
    fireEvent.keyDown(item, { key: "ArrowUp" });
    expect(onMove).not.toHaveBeenCalled();
  });
});
