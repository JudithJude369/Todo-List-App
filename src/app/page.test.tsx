import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import Home from "@/app/page";

const SAMPLE = [
  {
    id: "stored-1",
    title: "survives a reload",
    completed: false,
    createdAt: "x",
    updatedAt: "x",
  },
];

/** Records every localStorage write so we can assert on ordering. */
function trackWrites() {
  const writes: { key: string; value: string }[] = [];
  const original = Storage.prototype.setItem;
  Storage.prototype.setItem = function (key: string, value: string) {
    writes.push({ key, value });
    return original.call(this, key, value);
  };
  return {
    writes,
    restore: () => {
      Storage.prototype.setItem = original;
    },
  };
}

function addTodo(title: string) {
  const input = screen.getByRole("textbox", { name: /new todo/i });
  fireEvent.change(input, { target: { value: title } });
  fireEvent.keyDown(input, { key: "Enter" });
}

describe("TodoApp", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("adds a todo and shows it in the list", () => {
    render(<Home />);
    addTodo("buy milk");
    expect(screen.getByText("buy milk")).toBeInTheDocument();
  });

  it("shows the friendly empty state before anything is added", () => {
    render(<Home />);
    expect(screen.getByText(/no todos yet/i)).toBeInTheDocument();
  });

  it("toggles a todo complete and updates the remaining count", () => {
    render(<Home />);
    addTodo("walk dog");
    expect(screen.getByText(/1 item left/i)).toBeInTheDocument();

    fireEvent.click(
      screen.getByRole("checkbox", { name: /mark "walk dog" as complete/i })
    );
    expect(screen.getByText(/0 items left/i)).toBeInTheDocument();
  });

  it("deletes a todo", () => {
    render(<Home />);
    addTodo("task one");
    fireEvent.click(screen.getByRole("button", { name: /delete "task one"/i }));
    expect(screen.queryByText("task one")).not.toBeInTheDocument();
  });

  it("filters between all, active and completed", () => {
    render(<Home />);
    addTodo("keep me");
    addTodo("finish me");
    fireEvent.click(
      screen.getByRole("checkbox", { name: /mark "finish me" as complete/i })
    );

    fireEvent.click(screen.getByRole("tab", { name: "Active" }));
    expect(screen.getByText("keep me")).toBeInTheDocument();
    expect(screen.queryByText("finish me")).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("tab", { name: "Completed" }));
    expect(screen.queryByText("keep me")).not.toBeInTheDocument();
    expect(screen.getByText("finish me")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("tab", { name: "All" }));
    expect(screen.getByText("keep me")).toBeInTheDocument();
    expect(screen.getByText("finish me")).toBeInTheDocument();
  });

  it("shows an empty state per filter when nothing matches", () => {
    render(<Home />);
    addTodo("only active");
    fireEvent.click(screen.getByRole("tab", { name: "Completed" }));
    expect(screen.getByText(/no completed todos yet/i)).toBeInTheDocument();
  });

  it("clears all completed todos", () => {
    render(<Home />);
    addTodo("done one");
    addTodo("still going");
    fireEvent.click(
      screen.getByRole("checkbox", { name: /mark "done one" as complete/i })
    );

    fireEvent.click(
      screen.getByRole("button", { name: /clear completed todos/i })
    );
    expect(screen.queryByText("done one")).not.toBeInTheDocument();
    expect(screen.getByText("still going")).toBeInTheDocument();
  });

  it("restores todos from localStorage", () => {
    window.localStorage.setItem(
      "todo-todos",
      JSON.stringify([
        {
          id: "abc",
          title: "persisted",
          completed: false,
          createdAt: "x",
          updatedAt: "x",
        },
      ])
    );
    render(<Home />);
    expect(screen.getByText("persisted")).toBeInTheDocument();
  });

  it("ignores whitespace-only todos", () => {
    render(<Home />);
    addTodo("    ");
    expect(screen.getByText(/no todos yet/i)).toBeInTheDocument();
  });
});

describe("TodoApp persistence", () => {
  let tracker: ReturnType<typeof trackWrites>;

  beforeEach(() => {
    window.localStorage.clear();
  });

  afterEach(() => {
    tracker?.restore();
  });

  it("never writes an empty array over stored todos on mount", () => {
    window.localStorage.setItem("todo-todos", JSON.stringify(SAMPLE));

    tracker = trackWrites();
    render(<Home />);

    const todoWrites = tracker.writes.filter((w) => w.key === "todo-todos");
    expect(todoWrites.length).toBeGreaterThan(0);
    for (const write of todoWrites) {
      expect(JSON.parse(write.value)).toHaveLength(1);
    }
  });

  it("leaves stored todos untouched when nothing changes", () => {
    window.localStorage.setItem("todo-todos", JSON.stringify(SAMPLE));

    tracker = trackWrites();
    render(<Home />);

    expect(window.localStorage.getItem("todo-todos")).toBe(JSON.stringify(SAMPLE));
  });

  it("restores todos after a simulated reload", () => {
    window.localStorage.setItem("todo-todos", JSON.stringify(SAMPLE));
    const first = render(<Home />);
    expect(screen.getByText("survives a reload")).toBeInTheDocument();
    first.unmount();

    tracker = trackWrites();
    render(<Home />);
    expect(screen.getByText("survives a reload")).toBeInTheDocument();
    expect(JSON.parse(window.localStorage.getItem("todo-todos")!)).toHaveLength(1);
  });

  it("keeps todos added in a previous session", () => {
    const { unmount } = render(<Home />);
    addTodo("added earlier");
    unmount();

    tracker = trackWrites();
    render(<Home />);
    expect(screen.getByText("added earlier")).toBeInTheDocument();
  });

  it("persists a deletion of every todo", () => {
    const { unmount } = render(<Home />);
    addTodo("only one");
    unmount();

    tracker = trackWrites();
    const { unmount: unmount2 } = render(<Home />);
    fireEvent.click(screen.getByRole("button", { name: /delete "only one"/i }));
    expect(window.localStorage.getItem("todo-todos")).toBe("[]");

    unmount2();
    tracker.restore();

    // a reload of the now-empty list must not resurrect the deleted todo
    render(<Home />);
    expect(screen.queryByText("only one")).not.toBeInTheDocument();
  });

  it("persists toggled and reordered state", () => {
    const { unmount } = render(<Home />);
    addTodo("a");
    addTodo("b");
    fireEvent.click(screen.getByRole("checkbox", { name: /mark "a" as complete/i }));
    fireEvent.click(screen.getByRole("button", { name: /move "a" down/i }));
    unmount();

    tracker = trackWrites();
    render(<Home />);
    expect(screen.getByRole("checkbox", { name: /mark "a" as incomplete/i })).toBeChecked();
  });

  it("only ever writes the loaded state when storage is empty", () => {
    tracker = trackWrites();
    render(<Home />);

    for (const write of tracker.writes.filter((w) => w.key === "todo-todos")) {
      expect(JSON.parse(write.value)).toHaveLength(0);
    }
  });

  it("restores the theme without writing the default over it", () => {
    window.localStorage.setItem("todo-theme", "dark");

    tracker = trackWrites();
    render(<Home />);

    const themeWrites = tracker.writes.filter((w) => w.key === "todo-theme");
    expect(themeWrites.length).toBeGreaterThan(0);
    for (const write of themeWrites) {
      expect(write.value).toBe("dark");
    }
    expect(window.localStorage.getItem("todo-theme")).toBe("dark");
  });
});

describe("TodoApp reordering", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  function titles() {
    return screen
      .getAllByRole("listitem")
      .map((li) => li.querySelector("span.break-words")?.textContent);
  }

  function mockDataTransfer() {
    const store: Record<string, string> = {};
    return {
      effectAllowed: "",
      dropEffect: "",
      setData: (k: string, v: string) => {
        store[k] = v;
      },
      getData: (k: string) => store[k] ?? "",
    };
  }

  it("moves a todo down with the move button", () => {
    render(<Home />);
    addTodo("first");
    addTodo("second");

    fireEvent.click(screen.getByRole("button", { name: /move "first" down/i }));
    expect(titles()).toEqual(["second", "first"]);
  });

  it("moves a todo up with the move button", () => {
    render(<Home />);
    addTodo("first");
    addTodo("second");

    fireEvent.click(screen.getByRole("button", { name: /move "second" up/i }));
    expect(titles()).toEqual(["second", "first"]);
  });

  it("does not move the first item up or the last item down", () => {
    render(<Home />);
    addTodo("first");
    addTodo("second");

    expect(screen.getByRole("button", { name: /move "first" up/i })).toBeDisabled();
    expect(screen.getByRole("button", { name: /move "second" down/i })).toBeDisabled();
    expect(titles()).toEqual(["first", "second"]);
  });

  it("reorders by dragging one item onto another", () => {
    render(<Home />);
    addTodo("first");
    addTodo("second");

    const stored = JSON.parse(window.localStorage.getItem("todo-todos")!);
    const dataTransfer = mockDataTransfer();
    dataTransfer.setData("text/plain", stored[0].id);

    const items = screen.getAllByRole("listitem");
    fireEvent.drop(items[1], { dataTransfer });
    expect(titles()).toEqual(["second", "first"]);
  });

  it("reorders with Alt plus arrow keys", () => {
    render(<Home />);
    addTodo("first");
    addTodo("second");

    fireEvent.keyDown(screen.getByText("first").closest("li")!, {
      key: "ArrowDown",
      altKey: true,
    });
    expect(titles()).toEqual(["second", "first"]);
  });

  it("persists the new order to localStorage", () => {
    render(<Home />);
    addTodo("first");
    addTodo("second");
    fireEvent.click(screen.getByRole("button", { name: /move "first" down/i }));

    const stored = JSON.parse(window.localStorage.getItem("todo-todos")!);
    expect(stored.map((t: { title: string }) => t.title)).toEqual(["second", "first"]);
  });
});

describe("TodoApp theme", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("toggles between light and dark and persists the choice", () => {
    render(<Home />);
    const toggle = screen.getByRole("button", { name: /toggle theme/i });

    fireEvent.click(toggle);
    expect(document.documentElement.getAttribute("data-theme")).toBe("dark");
    expect(window.localStorage.getItem("todo-theme")).toBe("dark");

    fireEvent.click(toggle);
    expect(document.documentElement.getAttribute("data-theme")).toBe("light");
    expect(window.localStorage.getItem("todo-theme")).toBe("light");
  });

  it("restores the stored theme on load", () => {
    window.localStorage.setItem("todo-theme", "dark");
    render(<Home />);
    expect(document.documentElement.getAttribute("data-theme")).toBe("dark");
  });
});

describe("TodoApp mobile layout", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("renders inside a mobile-first container at phone width", () => {
    window.innerWidth = 375;
    window.dispatchEvent(new Event("resize"));
    render(<Home />);

    const main = screen.getByRole("main");
    expect(main.className).toContain("min-h-screen");
    // the inner wrapper must be width-constrained and padded for small screens
    const wrapper = main.firstElementChild as HTMLElement;
    expect(wrapper.className).toContain("w-full");
    expect(wrapper.className).toContain("px-4");
  });

  it("keeps every interactive control reachable by keyboard", () => {
    render(<Home />);
    addTodo("keyboard task");
    fireEvent.click(
      screen.getByRole("checkbox", { name: /mark "keyboard task" as complete/i })
    );

    const tabbable = [
      screen.getByRole("textbox", { name: /new todo/i }),
      screen.getByRole("button", { name: /add todo/i }),
      screen.getByRole("checkbox", { name: /mark "keyboard task" as incomplete/i }),
      screen.getByRole("button", { name: /delete "keyboard task"/i }),
      screen.getByRole("tab", { name: "All" }),
      screen.getByRole("tab", { name: "Active" }),
      screen.getByRole("tab", { name: "Completed" }),
      screen.getByRole("button", { name: /clear completed todos/i }),
      screen.getByRole("button", { name: /toggle theme/i }),
    ];

    for (const el of tabbable) {
      expect(el).not.toBeDisabled();
      el.focus();
      expect(el).toHaveFocus();
    }
  });

  it("removes clear completed from the tab order when it is disabled", () => {
    render(<Home />);
    const clear = screen.getByRole("button", { name: /clear completed todos/i });
    expect(clear).toBeDisabled();
    clear.focus();
    expect(clear).not.toHaveFocus();
  });
});

describe("TodoApp console output", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("does not log errors or warnings during a full flow", () => {
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

    render(<Home />);
    addTodo("console check");
    fireEvent.click(screen.getByRole("checkbox", { name: /mark "console check" as complete/i }));
    fireEvent.click(screen.getByRole("tab", { name: "Completed" }));
    fireEvent.click(screen.getByRole("button", { name: /clear completed todos/i }));

    expect(errorSpy).not.toHaveBeenCalled();
    expect(warnSpy).not.toHaveBeenCalled();

    errorSpy.mockRestore();
    warnSpy.mockRestore();
  });
});
