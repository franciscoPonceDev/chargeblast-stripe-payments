import type { ButtonHTMLAttributes } from "react";
import clsx from "clsx";
import { Icon, type IconName } from "./Icon";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "pill";
  size?: "sm" | "md";
  icon?: IconName;
}

export function Button({
  variant = "secondary",
  size = "md",
  icon,
  type = "button",
  className,
  children,
  ...rest
}: ButtonProps) {
  const pill = variant === "pill";
  return (
    <button
      type={type}
      className={clsx(
        "inline-flex items-center justify-center gap-1 whitespace-nowrap cursor-pointer select-none",
        "outline-transparent focus-visible:ring-2 focus-visible:ring-brand-ring",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        pill
          ? "h-(--size-control-sm) px-2 text-xs rounded-full border border-dashed border-border text-text-secondary bg-surface enabled:hover:bg-bg-hover"
          : [
              "px-3 text-body font-semibold rounded-md",
              size === "sm" ? "h-(--size-control-sm)" : "h-(--size-control-md)",
              variant === "primary"
                ? "bg-brand text-on-brand enabled:hover:bg-brand-hover shadow-button"
                : "bg-surface text-text-primary border border-border shadow-button enabled:hover:bg-bg-hover",
            ],
        className,
      )}
      {...rest}
    >
      {icon && <Icon name={icon} />}
      {children}
    </button>
  );
}
