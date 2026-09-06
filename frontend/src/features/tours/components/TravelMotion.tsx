import { type CSSProperties, type PointerEvent, type ReactNode } from "react";

/** Lightweight adaptations of React Bits Blur Text and Spotlight Card patterns.
 * https://reactbits.dev/text-animations/blur-text
 * https://reactbits.dev/components/spotlight-card
 * CSS handles reduced motion; pointer effects never trigger React renders.
 */
export function BlurText({ text, className = "" }: { text: string; className?: string }) {
  return <span className={`travel-blur-text ${className}`} aria-label={text}>
    {text.split(" ").map((word, index) => <span aria-hidden="true" className="travel-blur-word" key={`${word}-${index}`} style={{ "--word-delay": `${index * 65}ms` } as CSSProperties}>{word}{" "}</span>)}
  </span>;
}

export function SpotlightCard({ children, className = "" }: { children: ReactNode; className?: string }) {
  const moveLight = (event: PointerEvent<HTMLElement>) => {
    if (event.pointerType !== "mouse" || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const card = event.currentTarget;
    const bounds = card.getBoundingClientRect();
    card.style.setProperty("--light-x", `${event.clientX - bounds.left}px`);
    card.style.setProperty("--light-y", `${event.clientY - bounds.top}px`);
  };
  return <article className={`travel-spotlight ${className}`} onPointerMove={moveLight}>
    {children}
    <span className="travel-spotlight-light" aria-hidden="true" />
  </article>;
}
