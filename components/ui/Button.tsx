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
        "inline-flex items-center justify-center gap-1.5 whitespace-nowrap cursor-pointer select-none",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        pill
          ? "h-(--size-control-md) px-2 text-caption leading-4 font-semibold rounded-full border border-dashed border-border text-control bg-surface focus-visible:shadow-focus enabled:hover:bg-bg-hover"
          : [
              "px-2 text-body font-semibold rounded-md",
              size === "sm" ? "h-(--size-control-sm)" : "h-(--size-control-md)",
              variant === "primary"
                ? "bg-brand text-on-brand focus-visible:shadow-focus enabled:hover:bg-brand-hover"
                : "bg-surface text-control shadow-ring focus-visible:shadow-ring-focus enabled:hover:bg-bg-hover",
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
