"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import { Sidebar } from "./sidebar";
import { cn } from "@/lib/utils";

export function AppShell({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex h-dvh overflow-hidden bg-bg">
      {/* Masaüstü sidebar */}
      <div className="hidden md:block">
        <Sidebar />
      </div>

      {/* Mobil overlay */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/40 md:hidden"
          onClick={() => setOpen(false)}
          aria-hidden
        />
      )}

      {/* Mobil off-canvas sidebar */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-50 transition-transform duration-200 md:hidden",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <Sidebar onNavigate={() => setOpen(false)} />
      </div>

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Mobil üst bar — safe-area (çentik) için üst/yan padding max() ile */}
        <div
          className="sticky top-0 z-30 flex items-center gap-3 border-b border-border bg-surface px-4 py-3 md:hidden"
          style={{
            paddingTop: "max(0.75rem, env(safe-area-inset-top))",
            paddingLeft: "max(1rem, env(safe-area-inset-left))",
            paddingRight: "max(1rem, env(safe-area-inset-right))",
          }}
        >
          <button
            onClick={() => setOpen(true)}
            aria-label="Menüyü aç"
            className="flex h-9 w-9 items-center justify-center rounded-[var(--radius)] border border-border text-ink"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 6h18M3 12h18M3 18h18" />
            </svg>
          </button>
          <Link href="/app" className="font-display text-[17px] text-ink">
            KVKK <span className="text-accent-strong">Yönetim</span>
          </Link>
        </div>

        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-3xl px-5 py-8 md:px-10 md:py-12">{children}</div>
        </main>
      </div>
    </div>
  );
}
