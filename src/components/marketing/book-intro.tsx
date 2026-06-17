"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";

export function BookIntro() {
  const [done, setDone] = useState(false);
  const overlayRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<HTMLDivElement>(null);
  const coverRef = useRef<HTMLDivElement>(null);
  const tlRef = useRef<gsap.core.Timeline | null>(null);

  useEffect(() => {
    const seen = sessionStorage.getItem("kvkk-intro-seen");
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (seen || reduce) {
      setDone(true);
      return;
    }
    document.body.style.overflow = "hidden";

    const tl = gsap.timeline({
      onComplete: () => {
        sessionStorage.setItem("kvkk-intro-seen", "1");
        document.body.style.overflow = "";
        setDone(true);
      },
    });
    tlRef.current = tl;
    tl.from(sceneRef.current, { scale: 0.9, opacity: 0, duration: 0.6, ease: "power2.out" })
      .to(coverRef.current, { rotateY: -158, duration: 1.2, ease: "power3.inOut" }, "+=0.5")
      .to(sceneRef.current, { scale: 1.08, opacity: 0, duration: 0.6, ease: "power2.in" }, "-=0.25")
      .to(overlayRef.current, { autoAlpha: 0, duration: 0.5 }, "-=0.35");

    return () => {
      document.body.style.overflow = "";
      tl.kill();
    };
  }, []);

  function skip() {
    tlRef.current?.kill();
    sessionStorage.setItem("kvkk-intro-seen", "1");
    document.body.style.overflow = "";
    setDone(true);
  }

  if (done) return null;

  return (
    <div
      ref={overlayRef}
      className="theme-brand fixed inset-0 z-[100] flex items-center justify-center bg-bg"
      style={{ perspective: "1800px" }}
    >
      <div
        ref={sceneRef}
        className="relative"
        style={{ width: 320, height: 440, transformStyle: "preserve-3d" }}
      >
        {/* İç sayfa — kapak açılınca görünür */}
        <div className="absolute inset-0 flex flex-col items-center justify-center rounded-r-[8px] rounded-l-[3px] border border-border bg-surface px-8 text-center">
          <div className="font-display text-3xl leading-tight text-ink">
            Hukuki doğruluk,
            <br />
            <span className="text-accent">gerçek envanterden.</span>
          </div>
          <div className="mt-4 text-[11px] uppercase tracking-[0.2em] text-ink-subtle">
            KVKK 6698 · GDPR 2016/679
          </div>
        </div>

        {/* Kitap kapağı (deri + altın kabartma) */}
        <div
          ref={coverRef}
          className="absolute inset-0 overflow-hidden rounded-r-[8px] rounded-l-[3px]"
          style={{
            transformOrigin: "left center",
            transformStyle: "preserve-3d",
            backfaceVisibility: "hidden",
            background:
              "linear-gradient(135deg, #2a2117 0%, #1d1710 55%, #14100a 100%)",
            boxShadow:
              "inset 0 0 0 1px rgba(217,184,92,0.25), inset 0 0 60px rgba(0,0,0,0.6), 0 30px 60px rgba(0,0,0,0.5)",
          }}
        >
          {/* Sırt gölgesi (sol kenar) */}
          <div
            className="absolute inset-y-0 left-0 w-5"
            style={{
              background:
                "linear-gradient(90deg, rgba(0,0,0,0.55), transparent)",
            }}
          />
          {/* Altın çerçeve */}
          <div
            className="absolute inset-5 rounded-[4px]"
            style={{ boxShadow: "inset 0 0 0 1px rgba(217,184,92,0.45)" }}
          />
          <div
            className="absolute inset-[26px] rounded-[3px]"
            style={{ boxShadow: "inset 0 0 0 1px rgba(217,184,92,0.2)" }}
          />

          {/* Başlık */}
          <div className="absolute inset-0 flex flex-col items-center justify-center px-8 text-center">
            <div
              className="font-display text-[34px] leading-tight tracking-wide"
              style={{
                color: "#e8c87a",
                textShadow: "0 1px 0 rgba(0,0,0,0.6), 0 0 18px rgba(217,184,92,0.25)",
              }}
            >
              KVKK
              <br />
              Yönetim
            </div>
            <div className="mt-4 h-px w-14" style={{ background: "rgba(217,184,92,0.5)" }} />
            <div
              className="mt-4 text-[10px] uppercase tracking-[0.22em]"
              style={{ color: "rgba(217,184,92,0.7)" }}
            >
              Veri Koruma Platformu
            </div>
          </div>
        </div>
      </div>

      <button
        onClick={skip}
        className="absolute bottom-6 right-6 text-[12px] tracking-wide text-ink-subtle transition-colors hover:text-ink"
      >
        Geç ↗
      </button>
    </div>
  );
}
