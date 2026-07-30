"use client";

import { useEffect, useState } from "react";
import { Cormorant_Garamond, Spectral } from "next/font/google";
import { renderMarkdown } from "@/lib/markdown";
import { PRINT_STORAGE_KEY, type PrintPayload } from "@/lib/print";
import styles from "./yazdir.module.css";

const baslik = Cormorant_Garamond({ subsets: ["latin"], weight: ["600", "700"], variable: "--print-baslik" });
const govde = Spectral({ subsets: ["latin"], weight: ["400", "600"], variable: "--print-govde" });

const BASLIK: Record<string, string> = {
  aydinlatma: "Kişisel Verilerin Korunması Kanunu Kapsamında Aydınlatma Metni",
  cerez: "Çerez Politikası",
  kayit: "Kişisel Veri İşleme Kaydı",
};

export function YazdirClient() {
  const [payload, setPayload] = useState<PrintPayload | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    Promise.resolve().then(() => {
      const raw = sessionStorage.getItem(PRINT_STORAGE_KEY);
      if (raw) {
        try {
          setPayload(JSON.parse(raw) as PrintPayload);
        } catch {
          setPayload(null);
        }
      }
      setLoaded(true);
    });
  }, []);

  useEffect(() => {
    if (!payload) return;
    let done = false;
    const fire = () => {
      if (done) return;
      done = true;
      window.print();
    };
    // Fontlar yüklendikten sonra yazdır; başarısızsa yine de yazdır.
    document.fonts.ready.then(fire).catch(fire);
    const t = setTimeout(fire, 1500);
    return () => clearTimeout(t);
  }, [payload]);

  if (loaded && !payload) {
    return <p className={styles.bos}>Yazdırılacak belge bulunamadı.</p>;
  }
  if (!payload) return null;

  const { docType, content, cover } = payload;
  return (
    <div className={`${baslik.variable} ${govde.variable} ${styles.sayfa}`}>
      <header className={styles.kapak}>
        <h1 className={styles.kapakBaslik}>{BASLIK[docType] ?? "Belge"}</h1>
        <dl className={styles.meta}>
          <Alan etiket="Veri Sorumlusu" deger={cover.veriSorumlusu} />
          {docType === "aydinlatma" && <Alan etiket="İlgili Kişi" deger={cover.ilgiliKisi} />}
          {docType === "cerez" && <Alan etiket="Site / Uygulama" deger={cover.site} />}
          <Alan etiket="Yürürlük Tarihi" deger={cover.tarih} />
          <Alan etiket="Versiyon" deger={cover.versiyon} />
        </dl>
      </header>
      <article className={`doc-prose ${styles.govde}`} dangerouslySetInnerHTML={{ __html: renderMarkdown(content) }} />
    </div>
  );
}

function Alan({ etiket, deger }: { etiket: string; deger?: string }) {
  if (!deger) return null;
  return (
    <div className={styles.metaSatir}>
      <dt className={styles.metaEtiket}>{etiket}</dt>
      <dd className={styles.metaDeger}>{deger}</dd>
    </div>
  );
}
