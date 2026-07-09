"use client";

import Link from "next/link";

/*
  Uyum skoru halkası (Faz B, T10) — 10 disiplin kuralının TEK bilinçli istisnası:
  radius=0 kuralı burada geçerli değil, halka doğası gereği dairedir (spec §6/plan T10
  notu). SVG stroke-dasharray ile accent dolgu + muted (border tonu) kalan; ortada
  yüzde. score=null (seed yok / payda=0) → "—", uydurulmuş sayı gösterilmez.
  Tıklanınca /app/kontrol'e gider.
*/
export function ScoreRing({ score }: { score: number | null }) {
  const size = 88;
  const stroke = 8;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const pct = score === null ? 0 : Math.round(score * 100);
  const offset = c * (1 - pct / 100);

  return (
    <Link
      href="/app/kontrol"
      aria-label="Uyum kontrol listesine git"
      className="group relative inline-flex h-[88px] w-[88px] flex-shrink-0 items-center justify-center"
    >
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="var(--border)"
          strokeWidth={stroke}
        />
        {score !== null && (
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke="var(--accent)"
            strokeWidth={stroke}
            strokeDasharray={c}
            strokeDashoffset={offset}
            strokeLinecap="butt"
            className="transition-[stroke-dashoffset] duration-500 ease-out"
          />
        )}
      </svg>
      <span className="absolute font-display text-lg font-light text-ink transition-colors group-hover:text-accent">
        {score === null ? "—" : `%${pct}`}
      </span>
    </Link>
  );
}
