"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { PageHeader } from "@/components/app/page-header";
import { InventoryEditor } from "@/components/app/inventory-editor";
import { InventoryWizard } from "@/components/app/inventory-wizard";
import { InventoryImportMenu } from "@/components/app/inventory-import-menu";
import { Field, Select } from "@/components/ui";
import { useToast } from "@/components/ui/toast";
import { listClients, SECTOR_LABELS, usingRealApi, type Client } from "@/lib/api";
import { cn } from "@/lib/utils";

/*
  Envanter Çalışma Alanı — müvekkil seç, envanteri gir. İki mod tek yerde:
  Tablo (VERBİS grid) ve Rehberli Anket (sihirbaz). Excel içe/dışa aktarma ikincil
  bir menüde. Mod URL'de (?mode=rehberli) — /app/anket-sihirbazi buraya redirect eder.
*/

type Mode = "tablo" | "rehberli";

export function EnvanterClient() {
  const toast = useToast();
  const searchParams = useSearchParams();
  const router = useRouter();
  const clientParam = searchParams.get("client");
  const mode: Mode = searchParams.get("mode") === "rehberli" ? "rehberli" : "tablo";
  const [clients, setClients] = useState<Client[] | null>(null);
  const [selectedId, setSelectedId] = useState<string>("");
  const [importOpen, setImportOpen] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    if (!usingRealApi) return;
    listClients()
      .then((cs) => {
        setClients(cs);
        setSelectedId((id) => {
          if (id) return id;
          if (clientParam && cs.some((c) => c.id === clientParam)) return clientParam;
          return cs[0]?.id ?? "";
        });
      })
      .catch((e) => toast(e instanceof Error ? e.message : "Müvekkiller yüklenemedi."));
  }, [toast, clientParam]);

  function setMode(m: Mode) {
    const params = new URLSearchParams(searchParams.toString());
    if (m === "rehberli") params.set("mode", "rehberli");
    else params.delete("mode");
    const qs = params.toString();
    router.replace(`/app/envanter${qs ? `?${qs}` : ""}`);
  }

  const header = (
    <PageHeader
      eyebrow="Araçlar / Envanter"
      title="Envanter Yönetimi"
      action={
        selectedId ? (
          <InventoryImportMenu
            clientId={selectedId}
            open={importOpen}
            onOpenChange={setImportOpen}
            onImported={() => setReloadKey((k) => k + 1)}
          />
        ) : undefined
      }
    />
  );

  if (!usingRealApi)
    return (
      <div>
        {header}
        <p className="mt-6 text-[14px] text-ink-muted">
          Envanter yönetimi gerçek API bağlantısı gerektirir; bu ortamda devre dışı.
        </p>
      </div>
    );

  return (
    <div>
      {header}

      {clients === null ? (
        <p className="mt-8 text-[13px] text-ink-muted">Yükleniyor…</p>
      ) : clients.length === 0 ? (
        <div className="mt-8 border border-dashed border-border-strong bg-surface px-8 py-12 text-center">
          <p className="text-[13.5px] text-ink-muted">
            Envanter tanımlamak için önce bir müvekkil oluşturun.
          </p>
          <Link
            href="/app/muvekkiller"
            className="mt-4 inline-block font-medium text-[12.5px] uppercase tracking-[0.08em] text-accent-strong hover:underline"
          >
            Müvekkil Yönetimi&apos;ne git ↗
          </Link>
        </div>
      ) : (
        <div className="mt-8">
          <section className="border border-border bg-surface p-6">
            <Field label="Müvekkil">
              <Select value={selectedId} onChange={(e) => setSelectedId(e.target.value)}>
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                    {c.sector ? ` — ${SECTOR_LABELS[c.sector] ?? c.sector}` : ""}
                  </option>
                ))}
              </Select>
            </Field>
          </section>

          {selectedId && (
            <>
              <div className="mt-5 flex gap-1 border-b border-border">
                {([["tablo", "Tablo"], ["rehberli", "Rehberli Anket"]] as const).map(([k, label]) => (
                  <button
                    key={k}
                    type="button"
                    onClick={() => setMode(k)}
                    className={cn(
                      "px-4 py-2 text-[12.5px] font-medium uppercase tracking-[0.06em] transition-colors",
                      mode === k ? "border-b-2 border-accent text-ink" : "text-ink-muted hover:text-ink",
                    )}
                  >
                    {label}
                  </button>
                ))}
              </div>

              {mode === "tablo" ? (
                <section className="mt-5 border border-border bg-surface p-6">
                  <h2 className="font-display text-[17px] text-ink">Veri envanteri</h2>
                  <InventoryEditor
                    key={`${selectedId}-${reloadKey}`}
                    clientId={selectedId}
                    onSwitchToWizard={() => setMode("rehberli")}
                    onOpenImport={() => setImportOpen(true)}
                  />
                </section>
              ) : (
                <InventoryWizard key={selectedId} clientId={selectedId} />
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
