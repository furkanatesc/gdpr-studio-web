import { Suspense } from "react";
import { YazdirClient } from "./yazdir-client";

export const metadata = { title: "Yazdır" };

export default function YazdirPage() {
  return (
    <Suspense fallback={null}>
      <YazdirClient />
    </Suspense>
  );
}
