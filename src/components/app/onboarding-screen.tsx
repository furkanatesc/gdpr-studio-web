"use client";

import { useState } from "react";
import { Button, Input } from "@/components/ui";
import { bootstrap } from "@/lib/api";
import { refreshWorkspaceInfo } from "./use-workspace-info";

export function OnboardingScreen() {
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (name.trim().length < 2) {
      setErr("Kurum adı en az 2 karakter olmalı.");
      return;
    }
    setBusy(true);
    setErr(null);
    bootstrap(name.trim())
      .then(() => {
        refreshWorkspaceInfo();
        window.location.reload();
      })
      .catch((e) => {
        setErr(e instanceof Error ? e.message : "Kurum oluşturulamadı.");
        setBusy(false);
      });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-bg p-6">
      <form onSubmit={submit} className="w-full max-w-md border border-border bg-surface p-8">
        <h1 className="text-lg font-medium text-ink">Kurumunuzu oluşturun</h1>
        <p className="mt-2 text-[13.5px] leading-relaxed text-ink-muted">
          Belge üretimine başlamadan önce kurumunuzu tanımlayın. Kurumunuz, üretilen
          belgelerin veri sorumlusudur. Ayrıntıları sonra Ayarlar&apos;dan tamamlayabilirsiniz.
        </p>
        <label htmlFor="org-name" className="mt-5 block text-[13px] text-ink">
          Kurum adı
        </label>
        <Input
          id="org-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Örn. Acme Turizm A.Ş."
          className="mt-1"
          autoFocus
        />
        {err && <p className="mt-2 text-[13px] text-red-600">{err}</p>}
        <Button type="submit" disabled={busy || name.trim().length < 2} className="mt-5 w-full">
          {busy ? "Oluşturuluyor…" : "Kurumu oluştur"}
        </Button>
      </form>
    </div>
  );
}
