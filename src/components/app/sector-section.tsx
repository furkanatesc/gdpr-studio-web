"use client";

import { useState } from "react";
import { Button, Select } from "@/components/ui";
import { useToast } from "@/components/ui/toast";
import { SECTOR_LABELS, updateOrgSector, usingRealApi } from "@/lib/api";
import { refreshWorkspaceInfo } from "@/components/app/use-workspace-info";

/* Sektör, süreç şablonu grounding'inin eksenidir (spec §4). Yalnız yönetici değiştirir;
   seçilmezse süreç grounding'i devre dışı kalır (kategori fallback). */
export function SectorSection({ sector, isAdmin }: { sector: string | null | undefined; isAdmin: boolean }) {
  const toast = useToast();
  const [value, setValue] = useState(sector ?? "");
  const [busy, setBusy] = useState(false);

  if (!usingRealApi) return null;

  function onSave() {
    if (!value) return;
    setBusy(true);
    updateOrgSector(value)
      .then(() => {
        toast("Sektör kaydedildi.");
        refreshWorkspaceInfo();
      })
      .catch((e) => toast(e instanceof Error ? e.message : "Sektör kaydedilemedi."))
      .finally(() => setBusy(false));
  }

  return (
    <div className="mt-4 border-t border-border pt-4">
      <span className="font-medium text-[10px] uppercase tracking-[0.1em] text-ink-subtle">Sektör</span>
      {isAdmin ? (
        <div className="mt-2 flex gap-2">
          <Select value={value} onChange={(e) => setValue(e.target.value)} className="h-9 flex-1 text-[13px]" aria-label="Sektör">
            <option value="">Seçilmedi</option>
            {Object.entries(SECTOR_LABELS).map(([k, label]) => (
              <option key={k} value={k}>{label}</option>
            ))}
          </Select>
          <Button size="sm" disabled={busy || !value} onClick={onSave}>Kaydet</Button>
        </div>
      ) : (
        <p className="mt-2 text-[13.5px] text-ink">{sector ? SECTOR_LABELS[sector] ?? sector : "—"}</p>
      )}
      <p className="mt-2 text-[12px] leading-relaxed text-ink-muted">
        Sektör seçilince doküman sihirbazında kişi grubuna göre gerçek süreç kayıtları kullanılır.
      </p>
    </div>
  );
}
