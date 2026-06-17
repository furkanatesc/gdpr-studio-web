import type { ReactNode } from "react";
import { SiteNav } from "@/components/marketing/site-nav";
import { SiteFooter } from "@/components/marketing/site-footer";
import { ScrollReveals } from "@/components/marketing/scroll-reveals";

export default function MarketingLayout({ children }: { children: ReactNode }) {
  return (
    <div className="theme-brand min-h-screen bg-bg text-ink">
      <ScrollReveals />
      <SiteNav />
      <main>{children}</main>
      <SiteFooter />
    </div>
  );
}
