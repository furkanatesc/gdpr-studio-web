import Image from "next/image";

/*
  Bağlam fotoğrafı — sözleşme §0: elle çizim yok, GERÇEK fotoğraf; tam gri tonlama +
  düz lacivert örtü (üç renk kuralı korunur, fotoğraf kendi rengini getirmez).

  Kaynaklar (Wikimedia Commons):
  - /photos/foto-arsiv.jpg  — "Copyright Card Catalog Files", Michael Holley (Public Domain)
  - /photos/foto-kitap.jpg  — "Old books on bookshelf", Clem Onojeghuo / Unsplash (CC0)
  - /photos/foto-kasa.png   — "Porta caveau banca, 1967", Aldo Moisio (Public Domain)
  - /photos/foto-kablo.jpg  — "Rear of rack at NERSC data center", Derrick Coetzee (CC0)
  - /photos/foto-imza.jpg   — "Legal Contract & Signature", Blogtrepreneur (CC BY 2.0)
*/
export function ContextPhoto({ src, className = "" }: { src: string; className?: string }) {
  return (
    <div aria-hidden className={`relative overflow-hidden ${className}`}>
      <Image src={src} alt="" fill sizes="480px" className="object-cover grayscale" />
      <div className="absolute inset-0" style={{ backgroundColor: "rgba(18,48,85,0.42)" }} />
    </div>
  );
}
