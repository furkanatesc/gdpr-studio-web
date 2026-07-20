"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { PageHeader } from "@/components/app/page-header";
import { useWorkspaceInfo } from "@/components/app/use-workspace-info";
import { Button, Field, Input, Select } from "@/components/ui";
import { useToast } from "@/components/ui/toast";
import {
  createClient,
  listClients,
  SECTOR_LABELS,
  updateClient,
  usingRealApi,
  type Client,
} from "@/lib/api";
import { cn } from "@/lib/utils";

/*
  Müvekkil yönetimi (Faz 2.1 envanter-müvekkil): kurum = hukuk bürosu, her müvekkilin
  kendi sektörü + veri sorumlusu profili var. Sol: liste + ekleme formu. Sağ: seçili
  müvekkilin profili (yalnız yönetici düzenler — backend 409/403 ile korur). Envanter
  Araçlar → Envanter Yönetimi'nde (/app/envanter) yönetilir. usingRealApi guard —
  mock modda sayfa devre dışı mesajı verir.
*/

type ProfileKey = "legal_name" | "mersis" | "kep" | "adres" | "eposta" | "telefon" | "vergi_dairesi" | "vergi_no";

const PROFILE_FIELDS: readonly [ProfileKey, string][] = [
  ["legal_name", "Ünvan (tam)"],
  ["mersis", "Mersis no"],
  ["kep", "KEP adresi"],
  ["adres", "Adres"],
  ["eposta", "E-posta"],
  ["telefon", "Telefon"],
  ["vergi_dairesi", "Vergi dairesi"],
  ["vergi_no", "Vergi no"],
];

function toForm(client: Client): Record<ProfileKey, string> {
  const out = {} as Record<ProfileKey, string>;
  for (const [key] of PROFILE_FIELDS) out[key] = client[key] ?? "";
  return out;
}

function NewClientForm({ onCreated }: { onCreated: (c: Client) => void }) {
  const toast = useToast();
  const [name, setName] = useState("");
  const [sector, setSector] = useState("");
  const [busy, setBusy] = useState(false);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;
    setBusy(true);
    createClient(trimmed, sector || null)
      .then((c) => {
        toast("Müvekkil eklendi.");
        setName("");
        setSector("");
        onCreated(c);
      })
      .catch((e) => toast(e instanceof Error ? e.message : "Müvekkil eklenemedi."))
      .finally(() => setBusy(false));
  }

  return (
    <form onSubmit={onSubmit} className="mt-6 flex flex-col gap-2.5 border-t border-border pt-5">
      <h3 className="font-medium text-[11px] uppercase tracking-[0.1em] text-ink-subtle">
        Yeni müvekkil
      </h3>
      <Input
        placeholder="Müvekkil adı"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
        aria-label="Müvekkil adı"
      />
      <Select value={sector} onChange={(e) => setSector(e.target.value)} aria-label="Sektör">
        <option value="">Sektör seçilmedi</option>
        {Object.entries(SECTOR_LABELS).map(([k, label]) => (
          <option key={k} value={k}>
            {label}
          </option>
        ))}
      </Select>
      <Button type="submit" size="sm" disabled={busy || !name.trim()}>
        Ekle
      </Button>
    </form>
  );
}

function ProfileForm({
  client,
  isAdmin,
  onSaved,
}: {
  client: Client;
  isAdmin: boolean;
  onSaved: (c: Client) => void;
}) {
  const toast = useToast();
  const [form, setForm] = useState(() => toForm(client));
  const [busy, setBusy] = useState(false);

  function onSave() {
    setBusy(true);
    const patch: Partial<Client> = {};
    for (const [key] of PROFILE_FIELDS) patch[key] = form[key] || null;
    updateClient(client.id, patch)
      .then((c) => {
        toast("Müvekkil profili kaydedildi.");
        onSaved(c);
      })
      .catch((e) => toast(e instanceof Error ? e.message : "Kaydedilemedi."))
      .finally(() => setBusy(false));
  }

  if (!isAdmin)
    return (
      <div className="mt-4">
        {PROFILE_FIELDS.map(([key, label]) => (
          <div
            key={key}
            className="flex flex-col gap-1 border-t border-border py-3 first:border-t-0 sm:flex-row sm:items-center sm:justify-between"
          >
            <span className="font-medium text-[10px] uppercase tracking-[0.1em] text-ink-subtle">
              {label}
            </span>
            <span className="text-[13.5px] text-ink">{client[key] || "—"}</span>
          </div>
        ))}
      </div>
    );

  return (
    <div className="mt-4">
      <div className="grid gap-3 sm:grid-cols-2">
        {PROFILE_FIELDS.map(([key, label]) => (
          <Field key={key} label={label}>
            <Input value={form[key]} onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))} />
          </Field>
        ))}
      </div>
      <Button size="sm" className="mt-4" disabled={busy} onClick={onSave}>
        Profili kaydet
      </Button>
    </div>
  );
}

export default function MuvekkillerPage() {
  const { identity } = useWorkspaceInfo();
  const toast = useToast();
  const isAdmin = identity?.role === "yonetici";

  const [clients, setClients] = useState<Client[] | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const refresh = useCallback(() => {
    return listClients()
      .then((cs) => {
        setClients(cs);
        setSelectedId((id) => id ?? cs[0]?.id ?? null);
      })
      .catch((e) => toast(e instanceof Error ? e.message : "Müvekkiller yüklenemedi."));
  }, [toast]);

  useEffect(() => {
    if (usingRealApi) void refresh();
  }, [refresh]);

  const selected = useMemo(() => clients?.find((c) => c.id === selectedId) ?? null, [clients, selectedId]);

  function onCreated(c: Client) {
    setClients((cs) => [...(cs ?? []), c]);
    setSelectedId(c.id);
  }

  function onProfileSaved(c: Client) {
    setClients((cs) => cs?.map((x) => (x.id === c.id ? c : x)) ?? cs);
  }

  const header = (
    <PageHeader
      eyebrow="Müvekkiller"
      title="Müvekkil Yönetimi"
      description="Her müvekkilin kendi sektörü ve veri sorumlusu profili vardır. Veri envanteri Araçlar → Envanter Yönetimi'nde düzenlenir."
    />
  );

  if (!usingRealApi)
    return (
      <div>
        {header}
        <p className="mt-6 text-[14px] text-ink-muted">
          Müvekkil yönetimi gerçek API bağlantısı gerektirir; bu ortamda devre dışı.
        </p>
      </div>
    );

  return (
    <div>
      {header}
      <div className="mt-8 grid gap-6 lg:grid-cols-[300px_1fr]">
        <section className="border border-border bg-surface p-6">
          <h2 className="font-display text-[17px] text-ink">Müvekkiller</h2>
          <div className="mt-4">
            {clients === null ? (
              <p className="text-[13px] text-ink-muted">Yükleniyor…</p>
            ) : clients.length === 0 ? (
              <p className="text-[13px] text-ink-muted">Henüz müvekkil eklenmedi.</p>
            ) : (
              <ul>
                {clients.map((c) => (
                  <li key={c.id}>
                    <button
                      type="button"
                      onClick={() => setSelectedId(c.id)}
                      className={cn(
                        "flex w-full items-center justify-between gap-2 border-t border-border py-2.5 text-left first:border-t-0",
                        selectedId === c.id ? "font-medium text-ink" : "text-ink-muted hover:text-ink",
                      )}
                    >
                      <span className="truncate text-[13.5px]">{c.name}</span>
                      {c.sector && (
                        <span className="flex-shrink-0 text-[11px] text-ink-subtle">
                          {SECTOR_LABELS[c.sector] ?? c.sector}
                        </span>
                      )}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <NewClientForm onCreated={onCreated} />
        </section>

        <div className="flex flex-col gap-5">
          {selected ? (
            <section className="border border-border bg-surface p-6">
              <div className="flex items-center justify-between gap-3">
                <h2 className="font-display text-[17px] text-ink">{selected.name}</h2>
                {selected.sector && (
                  <span className="font-medium text-[10px] uppercase tracking-[0.08em] text-accent">
                    {SECTOR_LABELS[selected.sector] ?? selected.sector}
                  </span>
                )}
              </div>
              <ProfileForm key={selected.id} client={selected} isAdmin={isAdmin} onSaved={onProfileSaved} />
              <div className="mt-5 border-t border-border pt-4">
                <Link
                  href="/app/envanter"
                  className="font-medium text-[12.5px] uppercase tracking-[0.08em] text-accent-strong hover:underline"
                >
                  Veri envanterini düzenle ↗
                </Link>
              </div>
            </section>
          ) : (
            <section className="border border-dashed border-border-strong bg-surface px-8 py-12 text-center">
              <p className="text-[13.5px] text-ink-muted">Bir müvekkil seçin veya yeni ekleyin.</p>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
