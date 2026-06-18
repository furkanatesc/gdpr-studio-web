"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

/**
 * WOW.js benzeri scroll-reveal: [data-reveal] öğeleri görünüme girince
 * fadeInUp + stagger ile belirir. Marka layout'una konur; her sayfada
 * ve client-side gezinmede (pathname değişince) yeniden taranır.
 */
export function ScrollReveals() {
  const pathname = usePathname();

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    gsap.registerPlugin(ScrollTrigger);

    // Yeni sayfanın DOM'a yerleşmesi için bir frame bekle
    const raf = requestAnimationFrame(() => {
      const els = gsap.utils.toArray<HTMLElement>("[data-reveal]");
      if (!els.length) return;

      gsap.set(els, { opacity: 0, y: 28 });
      const reveal = (batch: Element[]) =>
        gsap.to(batch, {
          opacity: 1,
          y: 0,
          duration: 0.6,
          ease: "power2.out",
          stagger: 0.08,
          overwrite: true,
        });
      const hide = (batch: Element[]) =>
        gsap.to(batch, {
          opacity: 0,
          y: 28,
          duration: 0.35,
          ease: "power2.in",
          overwrite: true,
        });

      ScrollTrigger.batch(els, {
        start: "top 88%",
        // Aşağı inerken görünür ol; yukarı çıkıp tekrar inince yeniden oynasın.
        onEnter: reveal,
        onEnterBack: reveal,
        onLeaveBack: hide,
      });
      ScrollTrigger.refresh();
    });

    return () => {
      cancelAnimationFrame(raf);
      ScrollTrigger.getAll().forEach((t) => t.kill());
      gsap.set("[data-reveal]", { clearProps: "all" });
    };
  }, [pathname]);

  return null;
}
