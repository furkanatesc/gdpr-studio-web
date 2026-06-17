"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas } from "@react-three/fiber";
import * as THREE from "three";
import gsap from "gsap";

const W = 2.6;
const H = 3.6;

function makeCoverTexture(): THREE.CanvasTexture {
  const c = document.createElement("canvas");
  c.width = 512;
  c.height = 710;
  const ctx = c.getContext("2d")!;
  const g = ctx.createLinearGradient(0, 0, 512, 710);
  g.addColorStop(0, "#2a2117");
  g.addColorStop(0.55, "#1d1710");
  g.addColorStop(1, "#14100a");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 512, 710);

  ctx.strokeStyle = "rgba(217,184,92,0.55)";
  ctx.lineWidth = 3;
  ctx.strokeRect(34, 34, 512 - 68, 710 - 68);
  ctx.lineWidth = 1;
  ctx.strokeStyle = "rgba(217,184,92,0.28)";
  ctx.strokeRect(52, 52, 512 - 104, 710 - 104);

  ctx.textAlign = "center";
  ctx.fillStyle = "#e8c87a";
  ctx.font = "600 76px Georgia, 'Times New Roman', serif";
  ctx.fillText("KVKK", 256, 330);
  ctx.fillText("Yönetim", 256, 410);

  ctx.fillStyle = "rgba(217,184,92,0.55)";
  ctx.fillRect(256 - 46, 452, 92, 2);

  ctx.fillStyle = "rgba(217,184,92,0.72)";
  ctx.font = "20px Georgia, serif";
  ctx.fillText("VERİ KORUMA PLATFORMU", 256, 498);

  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  return tex;
}

function Book({ onOpened }: { onOpened: () => void }) {
  const { book, pivot } = useMemo(() => {
    const leather = new THREE.MeshStandardMaterial({ color: "#1d1710", roughness: 0.7, metalness: 0.06 });
    const cream = new THREE.MeshStandardMaterial({ color: "#f4ecd6", roughness: 0.95 });
    const tex = makeCoverTexture();
    const faceFront = new THREE.MeshStandardMaterial({ map: tex, roughness: 0.55, metalness: 0.12 });
    const coverMats = [leather, leather, leather, leather, faceFront, leather];

    const book = new THREE.Group();
    const back = new THREE.Mesh(new THREE.BoxGeometry(W, H, 0.08), leather);
    back.position.z = -0.26;
    book.add(back);
    const pages = new THREE.Mesh(new THREE.BoxGeometry(W - 0.14, H - 0.14, 0.42), cream);
    book.add(pages);
    const spine = new THREE.Mesh(new THREE.BoxGeometry(0.12, H, 0.62), leather);
    spine.position.x = -W / 2;
    book.add(spine);

    const pivot = new THREE.Group();
    pivot.position.set(-W / 2, 0, 0.24);
    const cover = new THREE.Mesh(new THREE.BoxGeometry(W, H, 0.06), coverMats);
    cover.position.x = W / 2;
    pivot.add(cover);
    book.add(pivot);

    book.rotation.set(0.12, -0.5, 0);
    return { book, pivot };
  }, []);

  useEffect(() => {
    const tl = gsap.timeline();
    tl.from(book.position, { y: -0.6, duration: 1.0, ease: "power2.out" }, 0)
      .from(book.rotation, { y: -1.1, duration: 1.1, ease: "power2.out" }, 0)
      .to(pivot.rotation, { y: -2.45, duration: 1.35, ease: "power3.inOut" }, 0.7)
      .to(book.rotation, { y: -0.2, duration: 1.35, ease: "power2.inOut" }, 0.7)
      .add(onOpened, ">-0.1");
    return () => {
      tl.kill();
      book.traverse((o) => {
        if (o instanceof THREE.Mesh) {
          o.geometry.dispose();
          (Array.isArray(o.material) ? o.material : [o.material]).forEach((m) => m.dispose());
        }
      });
    };
  }, [book, pivot, onOpened]);

  return <primitive object={book} />;
}

export function Book3DIntro() {
  const [done, setDone] = useState(false);
  const [mounted, setMounted] = useState(false);
  const overlayRef = useRef<HTMLDivElement>(null);

  function finish() {
    document.body.style.overflow = "";
    sessionStorage.setItem("kvkk-intro-seen", "1");
    setDone(true);
  }

  useEffect(() => {
    const seen = sessionStorage.getItem("kvkk-intro-seen");
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (seen || reduce) {
      setDone(true);
      return;
    }
    document.body.style.overflow = "hidden";
    setMounted(true);
    // Güvenlik ağı: ne olursa olsun 6 sn sonra kapan (WebGL hatası vb.)
    const t = window.setTimeout(finish, 6000);
    return () => {
      window.clearTimeout(t);
      document.body.style.overflow = "";
    };
  }, []);

  function onOpened() {
    gsap.to(overlayRef.current, {
      autoAlpha: 0,
      duration: 0.6,
      ease: "power2.inOut",
      delay: 0.25,
      onComplete: finish,
    });
  }

  if (done) return null;

  return (
    <div
      ref={overlayRef}
      className="theme-brand fixed inset-0 z-[100] bg-bg"
    >
      {mounted && (
        <Canvas camera={{ position: [1.1, 0.5, 6.6], fov: 34 }} dpr={[1, 2]} gl={{ antialias: true }}>
          <color attach="background" args={["#17130d"]} />
          <ambientLight intensity={0.85} />
          <directionalLight position={[5, 6, 6]} intensity={1.7} color="#fff4d6" />
          <directionalLight position={[-4, 1, 3]} intensity={0.5} color="#d9b85c" />
          <Book onOpened={onOpened} />
        </Canvas>
      )}

      <div className="pointer-events-none absolute inset-x-0 bottom-10 text-center">
        <p className="font-display text-sm tracking-[0.2em] text-ink-subtle">KVKK YÖNETİM</p>
      </div>

      <button
        onClick={finish}
        className="absolute bottom-6 right-6 text-[12px] tracking-wide text-ink-subtle transition-colors hover:text-ink"
      >
        Geç ↗
      </button>
    </div>
  );
}
