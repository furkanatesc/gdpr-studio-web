"use client";

import { useCallback, useEffect, useState } from "react";
import { Button, Input, Select } from "@/components/ui";
import { useToast } from "@/components/ui/toast";
import {
  createInvitation,
  listInvitations,
  listMembers,
  removeMember,
  revokeInvitation,
  updateMemberRole,
  usingRealApi,
  type InviteOut,
  type MemberOut,
} from "@/lib/api";

/*
  Ekip/Üye yönetimi (mimari review H2). Backend /api/memberships + /api/invitations'ı bağlar.
  - Yönetici: üye rol değiştir/çıkar + davet oluştur/iptal. Avukat: yalnız roster okur.
  - Son-yönetici koruması backend'de (409); UI hatayı toast ile gösterir.
  - Mock modda (API yok) bölüm kendini gizler — sahte veri uydurulmaz.
*/

const ROLE_LABEL: Record<string, string> = { yonetici: "Yönetici", avukat: "Avukat" };

export function TeamSection({ selfRole }: { selfRole: string | undefined }) {
  const toast = useToast();
  const isAdmin = selfRole === "yonetici";

  const [members, setMembers] = useState<MemberOut[] | null>(null);
  const [invites, setInvites] = useState<InviteOut[]>([]);
  const [busy, setBusy] = useState(false);

  const [email, setEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("avukat");

  // setState .then callback'lerinde (kod tabanı deseni; senkron effect-setState kaçınılır).
  const refresh = useCallback(() => {
    return Promise.all([
      listMembers(),
      isAdmin ? listInvitations() : Promise.resolve([] as InviteOut[]),
    ])
      .then(([m, inv]) => {
        setMembers(m);
        setInvites(inv.filter((i) => i.status === "pending"));
      })
      .catch((e) => {
        toast(e instanceof Error ? e.message : "Ekip bilgileri yüklenemedi.");
      });
  }, [isAdmin, toast]);

  useEffect(() => {
    if (usingRealApi) void refresh();
  }, [refresh]);

  if (!usingRealApi) return null;

  async function onRoleChange(userId: string, role: string) {
    setBusy(true);
    try {
      await updateMemberRole(userId, role);
      toast("Rol güncellendi.");
      await refresh();
    } catch (e) {
      toast(e instanceof Error ? e.message : "Rol değiştirilemedi.");
    } finally {
      setBusy(false);
    }
  }

  async function onRemove(userId: string, memberEmail: string) {
    if (!confirm(`${memberEmail} kurumdan çıkarılsın mı? Erişimi kaldırılır.`)) return;
    setBusy(true);
    try {
      await removeMember(userId);
      toast("Üye çıkarıldı.");
      await refresh();
    } catch (e) {
      toast(e instanceof Error ? e.message : "Üye çıkarılamadı.");
    } finally {
      setBusy(false);
    }
  }

  async function onInvite(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = email.trim();
    if (!trimmed) return;
    setBusy(true);
    try {
      await createInvitation(trimmed, inviteRole);
      toast("Davet gönderildi.");
      setEmail("");
      await refresh();
    } catch (err) {
      toast(err instanceof Error ? err.message : "Davet gönderilemedi.");
    } finally {
      setBusy(false);
    }
  }

  async function onRevoke(invId: string) {
    setBusy(true);
    try {
      await revokeInvitation(invId);
      toast("Davet iptal edildi.");
      await refresh();
    } catch (e) {
      toast(e instanceof Error ? e.message : "Davet iptal edilemedi.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="border border-border bg-surface p-6 lg:col-span-2">
      <h2 className="font-display text-[17px] text-ink">Ekip</h2>

      {/* Üye listesi */}
      <div className="mt-4">
        {members === null ? (
          <p className="text-[13px] text-ink-muted">Üyeler yükleniyor…</p>
        ) : (
          <ul>
            {members.map((m) => (
              <li
                key={m.userId}
                className="flex flex-col gap-2 border-t border-border py-3.5 first:border-t-0 sm:flex-row sm:items-center sm:justify-between"
              >
                <span className="text-[13.5px] text-ink">
                  {m.email}
                  {m.isSelf && <span className="ml-2 text-[11px] text-ink-subtle">(siz)</span>}
                </span>
                <div className="flex items-center gap-2">
                  {isAdmin ? (
                    <>
                      <Select
                        value={m.role}
                        disabled={busy}
                        onChange={(e) => onRoleChange(m.userId, e.target.value)}
                        className="h-9 w-36 text-[13px]"
                        aria-label={`${m.email} rolü`}
                      >
                        <option value="yonetici">Yönetici</option>
                        <option value="avukat">Avukat</option>
                      </Select>
                      <Button
                        variant="ghost"
                        size="sm"
                        disabled={busy}
                        onClick={() => onRemove(m.userId, m.email)}
                      >
                        Çıkar
                      </Button>
                    </>
                  ) : (
                    <span className="text-[12px] uppercase tracking-[0.08em] text-ink-subtle">
                      {ROLE_LABEL[m.role] ?? m.role}
                    </span>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Yalnız yönetici: davet oluştur + bekleyen davetler */}
      {isAdmin && (
        <div className="mt-6 border-t border-border pt-5">
          <h3 className="font-medium text-[11px] uppercase tracking-[0.1em] text-ink-subtle">
            Üye davet et
          </h3>
          <form onSubmit={onInvite} className="mt-3 flex flex-col gap-2 sm:flex-row">
            <Input
              type="email"
              required
              placeholder="e-posta@kurum.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="sm:flex-1"
              aria-label="Davet e-postası"
            />
            <Select
              value={inviteRole}
              onChange={(e) => setInviteRole(e.target.value)}
              className="h-11 sm:w-40"
              aria-label="Davet rolü"
            >
              <option value="avukat">Avukat</option>
              <option value="yonetici">Yönetici</option>
            </Select>
            <Button type="submit" size="md" disabled={busy}>
              Davet gönder
            </Button>
          </form>

          {invites.length > 0 && (
            <ul className="mt-5">
              <li className="pb-2 font-medium text-[10px] uppercase tracking-[0.1em] text-ink-subtle">
                Bekleyen davetler
              </li>
              {invites.map((i) => (
                <li
                  key={i.id}
                  className="flex items-center justify-between border-t border-border py-3"
                >
                  <span className="text-[13px] text-ink">
                    {i.email}
                    <span className="ml-2 text-[11px] text-ink-subtle">
                      {ROLE_LABEL[i.role] ?? i.role}
                    </span>
                  </span>
                  <Button variant="ghost" size="sm" disabled={busy} onClick={() => onRevoke(i.id)}>
                    İptal
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </section>
  );
}
