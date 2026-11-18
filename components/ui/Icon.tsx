import type { ReactNode, SVGProps } from "react";

export type IconName =
  | "plus" | "chart" | "export" | "gear" | "x" | "check" | "chevron-down"
  | "chevron-up" | "copy" | "more" | "search" | "circle-plus" | "sort"
  | "calendar" | "clock" | "refund" | "ban" | "bank" | "info" | "mail";

const PATHS: Record<IconName, ReactNode> = {
  plus: <path d="M8 3v10M3 8h10" />,
  chart: <path d="M3 13V8M8 13V3M13 13V6" />,
  export: <path d="M8 10V2M5 5l3-3 3 3M3 10v3h10v-3" />,
  gear: (
    <>
      <circle cx="8" cy="8" r="2" />
      <path d="M8 1.5v2M8 12.5v2M1.5 8h2M12.5 8h2M3.4 3.4l1.4 1.4M11.2 11.2l1.4 1.4M3.4 12.6l1.4-1.4M11.2 4.8l1.4-1.4" />
    </>
  ),
  x: <path d="M3.5 3.5l9 9M12.5 3.5l-9 9" />,
  check: <path d="M3 8.5l3.5 3.5L13 4.5" />,
  "chevron-down": <path d="M4 6l4 4 4-4" />,
  "chevron-up": <path d="M4 10l4-4 4 4" />,
  copy: (
    <>
      <rect x="5" y="5" width="8" height="8" rx="1.5" />
      <path d="M3 10V4.5A1.5 1.5 0 0 1 4.5 3H10" />
    </>
  ),
  more: (
    <>
      <circle cx="3.5" cy="8" r="0.9" fill="currentColor" />
      <circle cx="8" cy="8" r="0.9" fill="currentColor" />
      <circle cx="12.5" cy="8" r="0.9" fill="currentColor" />
    </>
  ),
  search: (
    <>
      <circle cx="7" cy="7" r="4" />
      <path d="M10 10l3.5 3.5" />
    </>
  ),
  "circle-plus": (
    <>
      <circle cx="8" cy="8" r="6" />
      <path d="M8 5.5v5M5.5 8h5" />
    </>
  ),
  sort: <path d="M5 13V3M2.5 5.5L5 3l2.5 2.5M11 3v10M8.5 10.5L11 13l2.5-2.5" />,
  calendar: (
    <>
      <rect x="2.5" y="3.5" width="11" height="10" rx="1.5" />
      <path d="M2.5 7h11M5.5 2v3M10.5 2v3" />
    </>
  ),
  clock: (
    <>
      <circle cx="8" cy="8" r="6" />
      <path d="M8 4.5V8l2.5 1.5" />
    </>
  ),
  mail: (
    <>
      <rect x="2" y="3.5" width="12" height="9" rx="1.5" />
      <path d="M2.5 5l5.5 4 5.5-4" />
    </>
  ),
  refund: <path d="M6 3L3 6l3 3M3 6h6.5a3.5 3.5 0 0 1 0 7H7" />,
  ban: (
    <>
      <circle cx="8" cy="8" r="6" />
      <path d="M3.8 3.8l8.4 8.4" />
    </>
  ),
  bank: <path d="M2 6l6-3.5L14 6M3.5 7v5M6.5 7v5M9.5 7v5M12.5 7v5M2 13.5h12" />,
  info: (
    <>
      <circle cx="8" cy="8" r="6" />
      <path d="M8 7.5v3.5" />
      <circle cx="8" cy="5.2" r="0.7" fill="currentColor" stroke="none" />
    </>
  ),
};

export interface IconProps extends Omit<SVGProps<SVGSVGElement>, "name" | "size"> {
  name: IconName;
  size?: number;
}

export function Icon({ name, size = 12, ...rest }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      {...rest}
    >
      {PATHS[name]}
    </svg>
  );
}
