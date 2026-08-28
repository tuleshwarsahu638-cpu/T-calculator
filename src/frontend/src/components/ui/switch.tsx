"use client";

import * as SwitchPrimitive from "@radix-ui/react-switch";
import type * as React from "react";

import { cn } from "@/lib/utils";

function Switch({
  className,
  ...props
}: React.ComponentProps<typeof SwitchPrimitive.Root>) {
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      className={cn(
        "peer inline-flex h-6 w-11 shrink-0 items-center rounded-full border-2 shadow-xs transition-all outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50",
        "data-[state=unchecked]:bg-zinc-700 data-[state=unchecked]:border-zinc-500",
        "data-[state=checked]:bg-emerald-500 data-[state=checked]:border-emerald-400 data-[state=checked]:shadow-[0_0_10px_rgba(16,185,129,0.6)]",
        className,
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className={cn(
          "pointer-events-none block size-4 rounded-full ring-0 transition-transform",
          "data-[state=unchecked]:bg-zinc-300 data-[state=unchecked]:translate-x-0.5",
          "data-[state=checked]:bg-white data-[state=checked]:translate-x-[22px]",
        )}
      />
    </SwitchPrimitive.Root>
  );
}

export { Switch };
