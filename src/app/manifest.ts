import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "KVKK Yönetim",
    short_name: "KVKK Yönetim",
    description:
      "KVKK ve GDPR uyum dokümanlarını gerçek veri envanterine dayandırarak, hukuki olarak doğru biçimde üreten platform.",
    lang: "tr",
    start_url: "/",
    display: "standalone",
    background_color: "#FFFFFF",
    theme_color: "#123055",
    icons: [
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml" },
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
  };
}
