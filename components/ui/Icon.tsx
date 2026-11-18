import type { LucideIcon } from "lucide-react";
import {
  ArrowUpDown,
  ArrowUpFromLine,
  Ban,
  Calendar,
  ChartColumn,
  Check,
  ChevronDown,
  ChevronUp,
  CirclePlus,
  Clock,
  Copy,
  Ellipsis,
  Info,
  Landmark,
  Mail,
  Plus,
  Search,
  Settings,
  Sparkles,
  Undo2,
  X,
} from "lucide-react";
import type { SVGProps } from "react";

export type IconName =
  | "plus" | "chart" | "export" | "gear" | "x" | "check" | "chevron-down"
  | "chevron-up" | "copy" | "more" | "search" | "circle-plus" | "sort"
  | "calendar" | "clock" | "refund" | "ban" | "bank" | "info" | "mail"
  | "sparkles";

const ICONS: Record<IconName, LucideIcon> = {
  plus: Plus,
  chart: ChartColumn,
  export: ArrowUpFromLine,
  gear: Settings,
  x: X,
  check: Check,
  "chevron-down": ChevronDown,
  "chevron-up": ChevronUp,
  copy: Copy,
  more: Ellipsis,
  search: Search,
  "circle-plus": CirclePlus,
  sort: ArrowUpDown,
  calendar: Calendar,
  clock: Clock,
  refund: Undo2,
  ban: Ban,
  bank: Landmark,
  info: Info,
  mail: Mail,
  sparkles: Sparkles,
};

export interface IconProps extends Omit<SVGProps<SVGSVGElement>, "name" | "size" | "ref"> {
  name: IconName;
  size?: number;
}

export function Icon({ name, size = 12, ...rest }: IconProps) {
  const Cmp = ICONS[name];
  return <Cmp width={size} height={size} strokeWidth={2} aria-hidden="true" focusable="false" {...rest} />;
}
