"use client";

import { useRef, useState } from "react";
import { useToast } from "@/components/ui/toast";
import type { StreamHandlers } from "@/lib/api";
import type { GenerateResponse, GroundingRecord } from "@/lib/types";
import { refreshWorkspaceInfo } from "@/components/app/use-workspace-info";

type StartStream = (h: StreamHandlers) => Promise<void>;

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
  const [warning, setWarning] = useState<{ code: string; message: string } | null>(null);

  // Her generate çağrısı benzersiz bir run kimliği alır; Durdur (cancel) sayaç değerini
  // artırıp mevcut çalıştırmayı geçersizleştirir → gecikmeli/iptal edilmiş olaylar (delta/done)
  // no-op olur ve yeni bir çalıştırmaya karışmaz. Ağ isteği arkada tamamlanır (rezerve-mahsup
  // faturalaması disconnect'i zaten kapsar); UI anında serbest kalır.
  const runRef = useRef(0);
  const lastRunRef = useRef<{ startStream: StartStream; successMessage: string } | null>(null);

  async function generate(startStream: StartStream, successMessage: string): Promise<void> {
    const myRun = ++runRef.current;
    const stale = () => runRef.current !== myRun;
    lastRunRef.current = { startStream, successMessage };
    setLoading(true);
    setStreaming(true);
    setResult(null);
    setError(null);
    setQuotaBlock(null);
    setWarning(null);

    let acc = "";
    let grounding: GroundingRecord[] = [];
    let lastFlush = 0;
    const flush = (force = false) => {
      if (stale()) return;
      const now = Date.now();
      if (!force && now - lastFlush < 90) return;
      lastFlush = now;
      setResult({ text: acc, grounding, model: "", disclaimer: "" });
    };

    try {
      await startStream({
        onGrounding: (g) => {
          if (stale()) return;
          grounding = g;
          flush(true);
        },
        onDelta: (t) => {
          if (stale()) return;
          acc += t;
          flush();
        },
        onDone: (meta) => {
          if (stale()) return;
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
        onQuotaExceeded: (info) => {
          if (stale()) return;
          setQuotaBlock(info);
        },
        onError: (msg) => {
          if (stale()) return;
          setResult(null); // hatada yarım/kesik belge kalmasın (P2-2)
          setError(msg);
        },
        onWarning: (w) => {
          if (stale()) return;
          setWarning(w);
        },
      });
    } catch (e) {
      if (stale()) return;
      setResult(null);
      setError(e instanceof Error ? e.message : "Beklenmeyen bir hata oluştu.");
    } finally {
      if (!stale()) {
        setStreaming(false);
        setLoading(false);
      }
    }
  }

  function cancel(): void {
    runRef.current++; // mevcut çalıştırmayı geçersizleştir
    setStreaming(false);
    setLoading(false);
    setResult(null);
    setError(null);
  }

  function retry(): void {
    const last = lastRunRef.current;
    if (last) void generate(last.startStream, last.successMessage);
  }

  function reset(): void {
    setResult(null);
    setError(null);
    setQuotaBlock(null);
    setWarning(null);
  }

  return { loading, streaming, result, error, quotaBlock, warning, generate, reset, cancel, retry };
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
