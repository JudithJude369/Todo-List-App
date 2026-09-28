import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { FilterBar } from "@/components/FilterBar";

describe("FilterBar", () => {
  const props = {
    filter: "all" as const,
    onFilterChange: vi.fn(),
    remaining: 3,
    hasCompleted: true,
    onClearCompleted: vi.fn(),
  };

  it("renders item count", () => {
    render(<FilterBar {...props} />);
    expect(screen.getByText(/3 items left/)).toBeInTheDocument();
  });

  it("renders singular item count", () => {
    render(<FilterBar {...props} remaining={1} />);
    expect(screen.getByText(/1 item left/)).toBeInTheDocument();
  });

  it("calls onFilterChange when a filter is clicked", () => {
    render(<FilterBar {...props} />);
    fireEvent.click(screen.getByRole("tab", { name: "Active" }));
    expect(props.onFilterChange).toHaveBeenCalledWith("active");
  });

  it("calls onClearCompleted when clear button clicked", () => {
    render(<FilterBar {...props} />);
    fireEvent.click(screen.getByRole("button", { name: /clear completed/i }));
    expect(props.onClearCompleted).toHaveBeenCalled();
  });

  it("disables clear button when no completed items", () => {
    render(<FilterBar {...props} hasCompleted={false} />);
    expect(screen.getByRole("button", { name: /clear completed/i })).toBeDisabled();
  });
});