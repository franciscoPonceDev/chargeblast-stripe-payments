import type { LucideIcon } from "lucide-react";
import {
  ArrowLeftRight,
  ArrowUpDown,
  ArrowUpFromLine,
  Ban,
  Bell,
  Calendar,
  ChartColumn,
  Check,
  ChevronDown,
  ChevronUp,
  CircleHelp,
  CirclePlus,
  CreditCard,
  Clock,
  Copy,
  Ellipsis,
  FileText,
  House,
  Info,
  Landmark,
  LayoutGrid,
  Mail,
  Menu,
  Package,
  Plug,
  Plus,
  Radar,
  Receipt,
  Rocket,
  Search,
  Settings,
  Sigma,
  Sparkles,
  Terminal,
  Undo2,
  User,
  Wallet,
  X,
} from "lucide-react";
import type { SVGProps } from "react";

export type IconName =
  | "plus" | "chart" | "export" | "gear" | "x" | "check" | "chevron-down"
  | "chevron-up" | "copy" | "more" | "search" | "circle-plus" | "sort"
  | "calendar" | "clock" | "refund" | "ban" | "bank" | "info" | "mail"
  | "sparkles" | "home" | "wallet" | "transactions" | "user" | "package" | "rocket"
  | "file-text" | "sigma" | "radar" | "plug" | "credit-card" | "receipt" | "terminal"
  | "bell" | "help" | "grid" | "menu";

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
  home: House,
  wallet: Wallet,
  transactions: ArrowLeftRight,
  user: User,
  package: Package,
  rocket: Rocket,
  "file-text": FileText,
  sigma: Sigma,
  radar: Radar,
  plug: Plug,
  "credit-card": CreditCard,
  receipt: Receipt,
  terminal: Terminal,
  bell: Bell,
  help: CircleHelp,
  grid: LayoutGrid,
  menu: Menu,
};

export interface IconProps extends Omit<SVGProps<SVGSVGElement>, "name" | "size" | "ref"> {
  name: IconName;
  size?: number;
}

export function Icon({ name, size = 12, ...rest }: IconProps) {
  const Cmp = ICONS[name];
  return <Cmp width={size} height={size} strokeWidth={2} aria-hidden="true" focusable="false" {...rest} />;
}
