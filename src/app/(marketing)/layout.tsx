import type { ReactNode } from "react";
import { SiteNav } from "@/components/marketing/site-nav";
import { SiteFooter } from "@/components/marketing/site-footer";
import { ScrollReveals } from "@/components/marketing/scroll-reveals";
import { SmoothScroll } from "@/components/marketing/smooth-scroll";
import { StructuredData } from "@/components/marketing/structured-data";

export default function MarketingLayout({ children }: { children: ReactNode }) {
  return (
    <div className="theme-brand min-h-dvh bg-bg text-ink">
      <StructuredData />
      <SmoothScroll />
      <ScrollReveals />
      <SiteNav />
      <main>{children}</main>
      <SiteFooter />
    </div>
  );
}
