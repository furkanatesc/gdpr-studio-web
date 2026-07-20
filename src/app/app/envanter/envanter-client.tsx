"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { PageHeader } from "@/components/app/page-header";
import { InventoryEditor } from "@/components/app/inventory-editor";
import { Field, Select } from "@/components/ui";
import { useToast } from "@/components/ui/toast";
import { listClients, SECTOR_LABELS, usingRealApi, type Client } from "@/lib/api";

/*
  Envanter merkezi ekranı — müvekkil seç, envanterini elle düzenle/yükle.
  Düzenleme mantığı InventoryEditor'da (müvekkil sayfasıyla paylaşılır).
  ?client=<id> ile müvekkil sayfasından gelen bağlam taşınır; geçersiz/yoksa
  listedeki ilk müvekkile düşülür.
*/
export function EnvanterClient() {
  const toast = useToast();
  const searchParams = useSearchParams();
  const clientParam = searchParams.get("client");
  const [clients, setClients] = useState<Client[] | null>(null);
  const [selectedId, setSelectedId] = useState<string>("");

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

  const header = <PageHeader eyebrow="Araçlar / Envanter" title="Envanter Yönetimi" />;

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
            <section className="mt-5 border border-border bg-surface p-6">
              <h2 className="font-display text-[17px] text-ink">Veri envanteri</h2>
              <InventoryEditor key={selectedId} clientId={selectedId} />
            </section>
          )}
        </div>
      )}
    </div>
  );
}
