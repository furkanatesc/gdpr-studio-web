"use client";

import { usePathname, useRouter } from "next/navigation";
import { DOC_CATALOG } from "@/lib/catalog";
import { useAuth } from "@/lib/auth-context";
import { usingAuth } from "@/lib/supabase";

/*
  Masaüstü üst barı (sözleşme §2.2): sol = mono breadcrumb, sağ = kullanıcı kimliği + çıkış.
  Sticky; yalnız md ve üzeri (mobil kendi barını app-shell'de kullanıyor).
*/
const SECTION_LABELS: Record<string, string> = {
  "/app": "Başlangıç",
  "/app/muvekkiller": "Müvekkil Yönetimi",
  "/app/envanter": "Envanter Yönetimi",
  "/app/kontrol": "Uyum Kontrol Listesi",
  "/app/faturalama": "Plan & Faturalama",
  "/app/ayarlar": "Ayarlar",
};

function sectionLabel(path: string): string {
  if (SECTION_LABELS[path]) return SECTION_LABELS[path];
  const doc = DOC_CATALOG.find((d) => path === `/app/${d.type}`);
  return doc ? doc.title : "Başlangıç";
}

export function TopBar() {
  const path = usePathname();
  const router = useRouter();
  const { session, signOut } = useAuth();
  const email = session?.user?.email;

  return (
    <div className="sticky top-0 z-30 hidden h-14 items-center justify-between border-b border-border bg-surface/95 px-9 backdrop-blur md:flex">
      <p className="font-medium text-[11px] uppercase tracking-[0.08em] text-ink-subtle">
        KVKK Yönetim <span aria-hidden>▸</span> {sectionLabel(path)}
      </p>
      {usingAuth && session && (
        <div className="flex items-center gap-3">
          <span className="flex h-7 w-7 items-center justify-center bg-accent text-[12px] font-medium text-accent-contrast">
            {(email?.[0] ?? "?").toUpperCase()}
          </span>
          <span className="text-[12.5px] text-ink-muted">{email}</span>
          <button
            onClick={async () => {
              await signOut();
              router.push("/login");
            }}
            className="font-medium text-[10.5px] uppercase tracking-[0.08em] text-ink-subtle transition-colors hover:text-ink"
          >
            Çıkış
          </button>
        </div>
      )}
    </div>
  );
}
