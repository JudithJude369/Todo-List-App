import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { AddTodo } from "@/components/AddTodo";

describe("AddTodo", () => {
  it("calls onAdd with trimmed title on Enter", () => {
    const onAdd = vi.fn();
    render(<AddTodo onAdd={onAdd} />);
    const input = screen.getByRole("textbox", { name: /new todo/i });
    fireEvent.change(input, { target: { value: "  buy milk  " } });
    fireEvent.keyDown(input, { key: "Enter" });
    expect(onAdd).toHaveBeenCalledWith("buy milk");
  });

  it("calls onAdd when button clicked", () => {
    const onAdd = vi.fn();
    render(<AddTodo onAdd={onAdd} />);
    const input = screen.getByRole("textbox", { name: /new todo/i });
    fireEvent.change(input, { target: { value: "walk dog" } });
    fireEvent.click(screen.getByRole("button", { name: /add todo/i }));
    expect(onAdd).toHaveBeenCalledWith("walk dog");
  });

  it("does not add empty or whitespace-only todos", () => {
    const onAdd = vi.fn();
    render(<AddTodo onAdd={onAdd} />);
    const input = screen.getByRole("textbox", { name: /new todo/i });
    fireEvent.change(input, { target: { value: "   " } });
    fireEvent.keyDown(input, { key: "Enter" });
    expect(onAdd).not.toHaveBeenCalled();
  });

  it("clears input after adding", () => {
    const onAdd = vi.fn();
    render(<AddTodo onAdd={onAdd} />);
    const input = screen.getByRole("textbox", { name: /new todo/i });
    fireEvent.change(input, { target: { value: "task" } });
    fireEvent.keyDown(input, { key: "Enter" });
    expect((input as HTMLInputElement).value).toBe("");
  });
});