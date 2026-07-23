"use client";

import { useEffect, useMemo, useState } from "react";
import { PageHeader } from "@/components/app/page-header";
import {
  refreshComplianceChecklist,
  useComplianceChecklist,
} from "@/components/app/use-compliance-checklist";
import { Textarea } from "@/components/ui/textarea";
import { setComplianceStatus } from "@/lib/api";
import type { ChecklistGroup, ChecklistItem, ComplianceStatusValue } from "@/lib/types";
import { cn } from "@/lib/utils";
import { BelgeGecmisiTab } from "./belge-gecmisi-tab";

/*
  /app/kontrol — Uyum Kontrol Listesi (Faz B, spec §6). PageHeader grameri (eyebrow +
  Frank Ruhl Libre başlık + genel skor sağ slot); gruplara ayrılmış gereksinim listesi;
  her satır 3-durum kontrolü + opsiyonel not. Skor SUNUCUDAN gelen alanları değil,
  yerel `groups` state'inden türetilir (spec §3 formülü birebir) — böylece optimistik
  durum değişikliği anında skora yansır, ekstra yuvarlama/eşitleme derdi olmaz.
  Onaylanmamış otomatik öneriler `status` alanına yazılmadığı için zaten sayılmaz.
*/
const STATUS_OPTIONS: readonly [ComplianceStatusValue, string][] = [
  ["yapildi", "Yapıldı"],
  ["eksik", "Eksik"],
  ["uygulanmaz", "Uygulanmaz"],
];

const TONE_ACTIVE: Record<ComplianceStatusValue, string> = {
  yapildi: "bg-ok-soft text-ok",
  eksik: "bg-warning-soft text-warning",
  uygulanmaz: "bg-surface-2 text-ink-muted",
};

function scoreOf(items: ChecklistItem[]): number | null {
  const total = items.length;
  const uygulanmaz = items.filter((i) => i.status === "uygulanmaz").length;
  const yapildi = items.filter((i) => i.status === "yapildi").length;
  const denom = total - uygulanmaz;
  return denom <= 0 ? null : yapildi / denom;
}

function pct(score: number | null): string {
  return score === null ? "—" : `%${Math.round(score * 100)}`;
}

function RequirementRow({
  item,
  pending,
  error,
  onSetStatus,
  onSaveNote,
}: {
  item: ChecklistItem;
  pending: boolean;
  error?: string;
  onSetStatus: (key: string, status: ComplianceStatusValue) => void;
  onSaveNote: (key: string, note: string) => void;
}) {
  const [noteOpen, setNoteOpen] = useState(Boolean(item.note));
  // Not taslağı yalnız kullanıcı yazarken yerel; kaydettikten sonra item.note zaten
  // aynı değere eşitlenir (optimistik güncelleme) — ayrı bir senkron effect gerekmez.
  const [draft, setDraft] = useState(item.note ?? "");

  const showApprove = item.sourceType === "auto" && !item.status && item.suggestion === "yapildi";

  return (
    <div className="border border-border bg-surface p-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="font-display text-[15px] text-ink">{item.title}</p>
          {item.maddeRef && (
            <p className="mt-1 font-mono text-[10.5px] text-ink-subtle">{item.maddeRef}</p>
          )}
          {item.description && (
            <p className="mt-2 max-w-xl text-[13px] leading-relaxed text-ink-muted">
              {item.description}
            </p>
          )}
        </div>
        <div className="flex flex-shrink-0 items-center gap-1 border border-border-strong p-1">
          {STATUS_OPTIONS.map(([value, label]) => (
            <button
              key={value}
              type="button"
              onClick={() => onSetStatus(item.key, value)}
              disabled={pending}
              aria-pressed={item.status === value}
              className={cn(
                "px-3 py-1.5 text-[11.5px] font-medium uppercase tracking-[0.04em] transition-colors disabled:opacity-50",
                item.status === value ? TONE_ACTIVE[value] : "text-ink-muted hover:text-ink",
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {showApprove && (
        <div className="mt-3 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-3">
          <p className="text-[12.5px] text-ink-muted">
            Sistem: üretilmiş görünüyor <span className="text-ink">→ Onayla?</span>
          </p>
          <button
            type="button"
            onClick={() => onSetStatus(item.key, "yapildi")}
            disabled={pending}
            className="border border-accent px-3 py-1.5 text-[11px] font-medium uppercase tracking-[0.06em] text-accent transition-colors hover:bg-accent hover:text-accent-contrast disabled:opacity-50"
          >
            Onayla
          </button>
        </div>
      )}

      <div className="mt-3 border-t border-border pt-3">
        {noteOpen ? (
          <div className="flex flex-col gap-2 sm:flex-row sm:items-start">
            <Textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="Not (opsiyonel) — kanıt/gerekçe"
              rows={2}
              className="sm:flex-1"
            />
            <button
              type="button"
              onClick={() => onSaveNote(item.key, draft)}
              disabled={pending}
              className="border border-border-strong px-3 py-2 text-[12px] text-ink transition-colors hover:bg-surface-2 disabled:opacity-50 sm:self-start"
            >
              Kaydet
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setNoteOpen(true)}
            className="font-medium text-[11px] uppercase tracking-[0.06em] text-ink-subtle transition-colors hover:text-ink"
          >
            + Not ekle
          </button>
        )}
      </div>

      {error && <p className="mt-2 text-[12px] text-danger">{error}</p>}
    </div>
  );
}

export function KontrolClient() {
  const { checklist, ready, error: loadError } = useComplianceChecklist();
  const [groups, setGroups] = useState<ChecklistGroup[] | null>(null);
  const [pendingKey, setPendingKey] = useState<string | null>(null);
  const [rowErrors, setRowErrors] = useState<Record<string, string>>({});
  const [tab, setTab] = useState<"liste" | "belgeler">("liste");

  useEffect(() => {
    if (checklist) setGroups(checklist.groups);
  }, [checklist]);

  const allItems = useMemo(() => groups?.flatMap((g) => g.items) ?? [], [groups]);
  const overallScore = useMemo(() => scoreOf(allItems), [allItems]);

  async function applyStatus(key: string, status: ComplianceStatusValue, note?: string | null) {
    if (!groups) return;
    const prev = groups;
    const next = groups.map((g) => ({
      ...g,
      items: g.items.map((it) =>
        it.key === key ? { ...it, status, note: note ?? it.note ?? null, source: "user" } : it,
      ),
    }));
    setGroups(next);
    setRowErrors((e) => ({ ...e, [key]: "" }));
    setPendingKey(key);
    try {
      await setComplianceStatus(key, status, note ?? undefined);
      refreshComplianceChecklist();
    } catch (e) {
      setGroups(prev);
      setRowErrors((errs) => ({ ...errs, [key]: (e as Error).message }));
    } finally {
      setPendingKey(null);
    }
  }

  function handleSetStatus(key: string, status: ComplianceStatusValue) {
    const item = allItems.find((i) => i.key === key);
    void applyStatus(key, status, item?.note ?? null);
  }

  function handleSaveNote(key: string, note: string) {
    const item = allItems.find((i) => i.key === key);
    void applyStatus(key, (item?.status as ComplianceStatusValue) ?? "eksik", note);
  }

  const header = (
    <PageHeader
      eyebrow="Araçlar / Uyum Kontrol Listesi"
      title="Uyum Kontrol Listesi"
      description="KVKK/GDPR yükümlülüklerinizin durumu — tek tek işaretleyin; sistem bazı kalemleri üretim kayıtlarından önerir, son kararı siz verirsiniz."
      action={
        tab === "liste" ? (
          <div className="text-right">
            <p className="font-medium text-[9.5px] uppercase tracking-[0.12em] text-ink-subtle">
              Genel uyum skoru
            </p>
            <p className="mt-1 font-display text-3xl font-light text-ink">{pct(overallScore)}</p>
          </div>
        ) : undefined
      }
    />
  );

  const tabBar = (
    <div className="mt-6 flex gap-1 border-b border-border">
      {([["liste", "Kontrol Listesi"], ["belgeler", "Belge Geçmişi"]] as const).map(([k, label]) => (
        <button
          key={k}
          type="button"
          onClick={() => setTab(k)}
          className={cn(
            "px-4 py-2 text-[12.5px] font-medium uppercase tracking-[0.06em] transition-colors",
            tab === k ? "border-b-2 border-accent text-ink" : "text-ink-muted hover:text-ink",
          )}
        >
          {label}
        </button>
      ))}
    </div>
  );

  function renderListeBody() {
    if (!ready) return <p className="mt-6 text-[14px] text-ink-muted">Yükleniyor…</p>;

    if (loadError && !groups)
      return (
        <div className="mt-6 border border-danger/40 bg-danger-soft px-5 py-4 text-sm text-danger">
          {loadError}
        </div>
      );

    if (!groups || groups.every((g) => g.items.length === 0))
      return (
        <div className="mt-8 border border-dashed border-border-strong bg-surface px-8 py-12 text-center">
          <p className="mx-auto max-w-md font-display text-xl text-ink">Gereksinim seti yakında</p>
          <p className="mx-auto mt-3 max-w-md text-[13.5px] leading-relaxed text-ink-muted">
            Uyum kontrol listesi içeriği hazırlandıktan sonra burada görünecek.
          </p>
        </div>
      );

    return (
      <div className="mt-8 flex flex-col gap-8">
        {groups.map((group) => {
          const groupScore = scoreOf(group.items);
          return (
            <section key={group.group}>
              <div className="flex items-center justify-between gap-3 border-b border-border pb-2">
                <h2 className="font-display text-[17px] text-ink">{group.group}</h2>
                <span className="font-medium text-[11px] text-ink-subtle">{pct(groupScore)}</span>
              </div>
              <div className="mt-4 flex flex-col gap-3">
                {group.items.map((item) => (
                  <RequirementRow
                    key={item.key}
                    item={item}
                    pending={pendingKey === item.key}
                    error={rowErrors[item.key]}
                    onSetStatus={handleSetStatus}
                    onSaveNote={handleSaveNote}
                  />
                ))}
              </div>
            </section>
          );
        })}
      </div>
    );
  }

  return (
    <div>
      {header}
      {tabBar}
      {tab === "liste" ? renderListeBody() : <BelgeGecmisiTab />}
    </div>
  );
}
