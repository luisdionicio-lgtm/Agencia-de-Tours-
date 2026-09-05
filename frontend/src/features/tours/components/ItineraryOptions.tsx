import { useState } from "react";
import { ArrowRight, CalendarDays, CheckCircle2, Route } from "lucide-react";
import type { ItineraryVariant } from "../config/itineraryCatalog";
import { buildWhatsAppUrl } from "../config/contact";
import styles from "./ItineraryOptions.module.css";

export function ItineraryOptions({ variants }: { variants: ItineraryVariant[] }) {
  const [selectedId, setSelectedId] = useState(variants[0]?.id);
  const selected = variants.find((variant) => variant.id === selectedId) ?? variants[0];
  if (!selected) return null;
  return <section className={styles.section} id="tour-itineraries" aria-labelledby="itinerary-options-title">
    <div className={styles.heading}><span><Route size={16} /> Diseña tu experiencia</span><h3 id="itinerary-options-title">Una ruta, distintas formas de vivirla</h3><p>Compara las modalidades y consulta la que mejor se adapte a tu viaje.</p></div>
    <div className={styles.layout}>
      <fieldset className={styles.choices}>
        <legend>Elige una modalidad</legend>
        {variants.map((variant) => <label key={variant.id} className={styles.choice}>
          <input type="radio" name="itinerary-variant" value={variant.id} checked={selected.id === variant.id} onChange={() => setSelectedId(variant.id)} />
          <span><strong>{variant.title}</strong><small><CalendarDays size={13} />{variant.duration}</small></span>
          <CheckCircle2 className={styles.check} size={19} aria-hidden="true" />
        </label>)}
      </fieldset>
      <div className={styles.preview} aria-live="polite" aria-atomic="true">
        <small>Lo principal de esta propuesta</small><h4>{selected.title}</h4><span className={styles.duration}><CalendarDays size={15} />{selected.duration}</span>
        <ol className={styles.route}>{selected.publicHighlights.map((highlight, index) => <li key={highlight}><span>{String(index + 1).padStart(2, "0")}</span><strong>{highlight}</strong></li>)}</ol>
        <p className={styles.note}>{selected.referenceOnly ? "Ruta referencial de archivo. Consulta fechas, disponibilidad y tarifa actual." : "La secuencia, fechas y servicios se ajustan a la propuesta confirmada."} Las actividades opcionales se cotizan por separado.</p>
        <a href={buildWhatsAppUrl(`Hola JohnToursPerú, me interesa la modalidad ${selected.title} (${selected.duration}). Quisiera confirmar fechas, servicios incluidos y tarifa.`)} target="_blank" rel="noopener noreferrer">Consultar esta modalidad <ArrowRight size={17} /></a>
      </div>
    </div>
  </section>;
}
