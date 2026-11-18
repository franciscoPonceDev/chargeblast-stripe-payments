import type { ReactElement, ReactNode } from "react";
import * as RT from "@radix-ui/react-tooltip";

export interface TooltipProps {
  content: ReactNode;
  children: ReactElement;
  side?: "top" | "bottom";
}

export function Tooltip({ content, children, side = "top" }: TooltipProps) {
  return (
    <RT.Provider delayDuration={300}>
      <RT.Root>
        <RT.Trigger asChild>{children}</RT.Trigger>
        <RT.Portal>
          <RT.Content
            side={side}
            sideOffset={4}
            className="z-50 rounded-md border border-border bg-surface px-2 py-1.5 text-caption text-text-primary shadow-popover"
          >
            {content}
          </RT.Content>
        </RT.Portal>
      </RT.Root>
    </RT.Provider>
  );
}
