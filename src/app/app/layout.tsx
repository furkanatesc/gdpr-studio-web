import type { ReactNode } from "react";
import { AppShell } from "@/components/app/app-shell";
import { SessionGate } from "@/components/app/session-gate";

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <AppShell>
      <SessionGate>{children}</SessionGate>
    </AppShell>
  );
}
