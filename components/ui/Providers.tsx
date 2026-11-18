"use client";
import type { ReactNode } from "react";
import * as RT from "@radix-ui/react-tooltip";
import { AnnouncerProvider } from "./Announcer";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <RT.Provider delayDuration={300}>
      <AnnouncerProvider>{children}</AnnouncerProvider>
    </RT.Provider>
  );
}
