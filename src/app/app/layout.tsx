import type { Metadata } from "next";
import type { ReactNode } from "react";
import { AppShell } from "@/components/app/app-shell";
import { SessionGate } from "@/components/app/session-gate";
import { ToastProvider } from "@/components/ui/toast";

// Tüm /app/* çalışma alanı kimlik doğrulama arkasında — index'lenmez. robots.ts'teki
// Disallow: /app/ kuralıyla belt-and-suspenders (bazı bot'lar robots.txt'i yok sayabilir).
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <AppShell>
      <SessionGate>
        <ToastProvider>{children}</ToastProvider>
      </SessionGate>
    </AppShell>
  );
}
