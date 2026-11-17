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
    expect(document.querySelector("svg")).toBeInTheDocument();
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

describe("Tooltip", () => {
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

describe("Icon", () => {
  it("renders svg at given size", () => {
    const { container } = render(<Icon name="x" size={16} />);
    expect(container.querySelector("svg")).toHaveAttribute("width", "16");
  });
});
