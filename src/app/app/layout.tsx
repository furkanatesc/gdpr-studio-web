import type { ReactNode } from "react";
import { AppShell } from "@/components/app/app-shell";
import { SessionGate } from "@/components/app/session-gate";
import { ToastProvider } from "@/components/ui/toast";

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <AppShell>
      <SessionGate>
        <ToastProvider>{children}</ToastProvider>
      </SessionGate>
    </AppShell>
  );
}
