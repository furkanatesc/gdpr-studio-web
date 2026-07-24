"use client";

import { useState } from "react";
import { useToast } from "@/components/ui/toast";
import type { StreamHandlers } from "@/lib/api";
import type { GenerateResponse, GroundingRecord } from "@/lib/types";
import { refreshWorkspaceInfo } from "@/components/app/use-workspace-info";

/*
  Üretim akışı durum makinesi — aydınlatma/çerez/işleme kaydı (ve sonraki DPA/DPIA/ihlal)
  ekranlarının ortak `onGenerate`'i: acc+grounding biriktirme, 90ms throttle'lı flush,
  onDone'da refreshWorkspaceInfo() (kenar çubuğu kullanım sayacı) + ekrana özgü toast metni.
  Davranış aydinlatma-client.tsx'teki orijinal onGenerate ile birebir; yalnız
  başarı mesajı ve akışı başlatan çağrı (stream fn) parametreleştirildi.
*/
export function useDocumentStream() {
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [streaming, setStreaming] = useState(false);
  const [result, setResult] = useState<GenerateResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [quotaBlock, setQuotaBlock] = useState<{ used: number; quota: number } | null>(null);

  async function generate(
    startStream: (h: StreamHandlers) => Promise<void>,
    successMessage: string,
  ): Promise<void> {
    setLoading(true);
    setStreaming(true);
    setResult(null);
    setError(null);
    setQuotaBlock(null);

    let acc = "";
    let grounding: GroundingRecord[] = [];
    let lastFlush = 0;
    const flush = (force = false) => {
      const now = Date.now();
      if (!force && now - lastFlush < 90) return;
      lastFlush = now;
      setResult({ text: acc, grounding, model: "", disclaimer: "" });
    };

    try {
      await startStream({
        onGrounding: (g) => {
          grounding = g;
          flush(true);
        },
        onDelta: (t) => {
          acc += t;
          flush();
        },
        onDone: (meta) => {
          setResult({
            text: acc,
            grounding,
            model: meta.model,
            disclaimer: meta.disclaimer,
            usage: meta.usage,
          });
          toast(successMessage);
          refreshWorkspaceInfo(); // kenar çubuğu kullanım sayacı
        },
        onQuotaExceeded: (info) => setQuotaBlock(info),
        onError: (msg) => setError(msg),
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Beklenmeyen bir hata oluştu.");
    } finally {
      setStreaming(false);
      setLoading(false);
    }
  }

  function reset(): void {
    setResult(null);
    setError(null);
    setQuotaBlock(null);
  }

  return { loading, streaming, result, error, quotaBlock, generate, reset };
}

/** İndirme akışı — blob → geçici `<a download>` (aydinlatma-client.tsx'teki orijinal onDownload ile birebir). */
export function useDocumentDownload() {
  const toast = useToast();
  const [downloading, setDownloading] = useState(false);

  async function download(fetchBlob: () => Promise<Blob>, filename: string): Promise<void> {
    setDownloading(true);
    try {
      const blob = await fetchBlob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      toast(e instanceof Error ? e.message : "İndirme başarısız.");
    } finally {
      setDownloading(false);
    }
  }

  return { downloading, download };
}
