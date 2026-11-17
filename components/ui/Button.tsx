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
        "outline-none focus-visible:ring-2 focus-visible:ring-brand-ring",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        pill
          ? "h-6 px-2 text-xs rounded-full border border-dashed border-border text-text-secondary bg-surface hover:bg-bg-hover"
          : [
              "px-3 text-base font-semibold rounded-md",
              size === "sm" ? "h-6" : "h-7",
              variant === "primary"
                ? "bg-brand text-white hover:bg-brand-hover shadow-button"
                : "bg-surface text-text-primary border border-border shadow-button hover:bg-bg-hover",
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
