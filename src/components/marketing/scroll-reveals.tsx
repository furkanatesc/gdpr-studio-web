"use client";

import { useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

/**
 * WOW.js benzeri scroll-reveal: [data-reveal] öğeleri görünüme girince
 * fadeInUp + stagger ile belirir. ScrollTrigger.batch ile gruplar halinde.
 */
export function ScrollReveals() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    gsap.registerPlugin(ScrollTrigger);
    const els = gsap.utils.toArray<HTMLElement>("[data-reveal]");
    if (!els.length) return;

    // Başlangıç durumu: gizli + aşağıda
    gsap.set(els, { opacity: 0, y: 28 });

    const triggers = ScrollTrigger.batch(els, {
      start: "top 88%",
      onEnter: (batch) =>
        gsap.to(batch, {
          opacity: 1,
          y: 0,
          duration: 0.6,
          ease: "power2.out",
          stagger: 0.1,
          overwrite: true,
        }),
    });

    // Layout/font yüklemesi sonrası konumları yeniden hesapla
    const refresh = () => ScrollTrigger.refresh();
    const t = window.setTimeout(refresh, 200);
    window.addEventListener("load", refresh);

    return () => {
      window.clearTimeout(t);
      window.removeEventListener("load", refresh);
      triggers.forEach((tr) => tr.kill());
      gsap.set(els, { clearProps: "all" });
    };
  }, []);

  return null;
}
