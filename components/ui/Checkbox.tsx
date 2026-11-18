import * as RC from "@radix-ui/react-checkbox";
import { Icon } from "./Icon";

export interface CheckboxProps {
  checked: boolean | "indeterminate";
  onCheckedChange: (v: boolean) => void;
  "aria-label": string;
  disabled?: boolean;
}

export function Checkbox({ checked, onCheckedChange, ...rest }: CheckboxProps) {
  return (
    <RC.Root
      checked={checked}
      onCheckedChange={(v) => onCheckedChange(v === true)}
      className="flex size-(--size-checkbox) shrink-0 items-center justify-center rounded-sm bg-surface text-on-brand shadow-checkbox cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 focus-visible:shadow-checkbox-focus data-[state=checked]:bg-brand data-[state=checked]:shadow-checkbox-checked data-[state=checked]:focus-visible:shadow-checkbox-checked-focus data-[state=indeterminate]:bg-brand data-[state=indeterminate]:shadow-checkbox-checked data-[state=indeterminate]:focus-visible:shadow-checkbox-checked-focus"
      {...rest}
    >
      <RC.Indicator className="flex items-center justify-center">
        {checked === "indeterminate" ? (
          <span className="block h-0.5 w-2 rounded-sm bg-on-brand" />
        ) : (
          <Icon name="check" size={10} strokeWidth={2.2} />
        )}
      </RC.Indicator>
    </RC.Root>
  );
}
