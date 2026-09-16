import type { LucideIcon } from "lucide-react";

/** Decorative service icon; the adjacent text supplies its accessible name. */
export function ServiceIcon({ icon: Icon, className = "", size = 20 }: { icon: LucideIcon; className?: string; size?: number }) {
  return <span className={`service-icon ${className}`} aria-hidden="true"><Icon size={size} strokeWidth={1.75} focusable="false" /></span>;
}
