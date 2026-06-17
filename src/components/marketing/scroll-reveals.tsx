"use client";

import { useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

/** Anasayfa bölümlerini (hero hariç) kaydırınca yumuşakça belirtir. */
export function ScrollReveals() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    gsap.registerPlugin(ScrollTrigger);

    const sections = Array.from(
      document.querySelectorAll<HTMLElement>("main section"),
    ).slice(1); // ilk bölüm (hero) hariç

    const ctx = gsap.context(() => {
      sections.forEach((s) => {
        gsap.from(s, {
          opacity: 0,
          y: 30,
          duration: 0.7,
          ease: "power2.out",
          scrollTrigger: { trigger: s, start: "top 84%", once: true },
        });
      });
    });

    return () => ctx.revert();
  }, []);

  return null;
}
