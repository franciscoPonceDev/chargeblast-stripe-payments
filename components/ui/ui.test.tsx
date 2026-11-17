import { describe, it, expect, vi } from "vitest";
import { useState } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Button, Checkbox, Tooltip, Popover, Icon } from "./index";

describe("Button", () => {
  it("renders children and defaults to type=button", () => {
    render(<Button>Export</Button>);
    const b = screen.getByRole("button", { name: "Export" });
    expect(b).toHaveAttribute("type", "button");
  });
  it("renders an icon", () => {
    render(<Button icon="plus">Add</Button>);
    const svg = screen.getByRole("button", { name: "Add" }).querySelector("svg");
    expect(svg).toBeInTheDocument();
    expect(svg).toHaveAttribute("aria-hidden", "true");
  });
  it("fires onClick, but not when disabled", async () => {
    const onClick = vi.fn();
    const { rerender } = render(<Button onClick={onClick}>Go</Button>);
    await userEvent.click(screen.getByRole("button", { name: "Go" }));
    expect(onClick).toHaveBeenCalledTimes(1);
    rerender(<Button onClick={onClick} disabled>Go</Button>);
    await userEvent.click(screen.getByRole("button", { name: "Go" }));
    expect(onClick).toHaveBeenCalledTimes(1);
  });
});

describe("Checkbox", () => {
  it("is labelled and toggles on click", async () => {
    const onChange = vi.fn();
    function C() {
      const [v, setV] = useState(false);
      return (
        <Checkbox
          checked={v}
          onCheckedChange={(x) => {
            onChange(x);
            setV(x);
          }}
          aria-label="Select row"
        />
      );
    }
    render(<C />);
    const cb = screen.getByRole("checkbox", { name: "Select row" });
    await userEvent.click(cb);
    expect(onChange).toHaveBeenCalledWith(true);
    expect(cb).toHaveAttribute("aria-checked", "true");
  });
});

describe("Checkbox keyboard", () => {
  it("toggles with Space", async () => {
    const onChange = vi.fn();
    render(<Checkbox checked={false} onCheckedChange={onChange} aria-label="Pick" />);
    screen.getByRole("checkbox", { name: "Pick" }).focus();
    await userEvent.keyboard(" ");
    expect(onChange).toHaveBeenCalledWith(true);
  });
});

describe("Tooltip", () => {
  it("is absent before hover", () => {
    render(
      <Tooltip content="Helpful">
        <button>Hover me</button>
      </Tooltip>,
    );
    expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();
  });
  it("shows content on hover", async () => {
    render(
      <Tooltip content="Helpful">
        <button>Hover me</button>
      </Tooltip>,
    );
    await userEvent.hover(screen.getByText("Hover me"));
    expect(await screen.findByRole("tooltip")).toHaveTextContent("Helpful");
  });
});

describe("Popover", () => {
  it("opens content from trigger", async () => {
    render(
      <Popover trigger={<button>Open</button>}>
        <div>Panel body</div>
      </Popover>,
    );
    await userEvent.click(screen.getByText("Open"));
    expect(await screen.findByText("Panel body")).toBeInTheDocument();
  });
});

describe("Popover close", () => {
  it("closes on Escape", async () => {
    render(
      <Popover trigger={<button>Open</button>} aria-label="Panel">
        <div>Panel body</div>
      </Popover>,
    );
    await userEvent.click(screen.getByText("Open"));
    expect(await screen.findByText("Panel body")).toBeInTheDocument();
    await userEvent.keyboard("{Escape}");
    expect(screen.queryByText("Panel body")).not.toBeInTheDocument();
  });
});

describe("Icon", () => {
  it("renders svg at given size", () => {
    const { container } = render(<Icon name="x" size={16} />);
    expect(container.querySelector("svg")).toHaveAttribute("width", "16");
  });
});
