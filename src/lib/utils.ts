// Bağımlılıksız sınıf birleştirici (clsx/tailwind-merge gerektirmeden).
export function cn(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(" ");
}
