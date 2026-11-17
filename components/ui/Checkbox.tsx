import * as RC from "@radix-ui/react-checkbox";
import { Icon } from "./Icon";

export interface CheckboxProps {
  checked: boolean | "indeterminate";
  onCheckedChange: (v: boolean) => void;
  "aria-label": string;
}

export function Checkbox({ checked, onCheckedChange, ...rest }: CheckboxProps) {
  return (
    <RC.Root
      checked={checked}
      onCheckedChange={(v) => onCheckedChange(v === true)}
      className="flex size-3.5 shrink-0 items-center justify-center rounded-sm border border-border bg-surface text-white outline-none cursor-pointer focus-visible:ring-2 focus-visible:ring-brand-ring data-[state=checked]:bg-brand data-[state=checked]:border-brand data-[state=indeterminate]:bg-brand data-[state=indeterminate]:border-brand"
      {...rest}
    >
      <RC.Indicator className="flex items-center justify-center">
        {checked === "indeterminate" ? (
          <span className="block h-0.5 w-2 rounded-sm bg-white" />
        ) : (
          <Icon name="check" size={10} strokeWidth={2.2} />
        )}
      </RC.Indicator>
    </RC.Root>
  );
}
