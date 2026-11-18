import type { ReactElement, ReactNode } from "react";
import * as RP from "@radix-ui/react-popover";
import clsx from "clsx";

export interface PopoverProps {
  trigger: ReactElement;
  children: ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  align?: "start" | "center" | "end";
  className?: string;
  "aria-label"?: string;
  "aria-labelledby"?: string;
}

export function Popover({ trigger, children, open, onOpenChange, align = "start", className, "aria-label": ariaLabel, "aria-labelledby": labelledBy }: PopoverProps) {
  return (
    <RP.Root open={open} onOpenChange={onOpenChange}>
      <RP.Trigger asChild>{trigger}</RP.Trigger>
      <RP.Portal>
        <RP.Content
          sideOffset={6}
          align={align}
          aria-label={ariaLabel}
          aria-labelledby={labelledBy}
          className={clsx(
            "z-50 rounded-lg border border-border bg-surface text-text-primary shadow-popover",
            className,
          )}
        >
          {children}
        </RP.Content>
      </RP.Portal>
    </RP.Root>
  );
}
