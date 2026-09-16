import { useState } from "react";
import { CalendarDays, UsersRound, ArrowRight } from "lucide-react";
import type { Tour } from "../../../shared/types";
import { buildWhatsAppUrl } from "../config/contact";
import { tourMoney } from "../lib/presentation";

export function TourQuote({ tour }: { tour: Tour }) {
  const [date, setDate] = useState("");
  const [people, setPeople] = useState("2");
  const today = new Intl.DateTimeFormat("en-CA", { timeZone: "America/Lima" }).format(new Date());
  const message = `Hola JohnToursPerú, deseo cotizar ${tour.title} (${tour.destination}). Fecha estimada: ${date || "por definir"}. Viajeros: ${people}. Quisiera confirmar disponibilidad, precio final, servicios incluidos y condiciones antes de reservar.`;
  return <div className="quote-layout">
    <aside className="quote-summary"><img src={tour.imageUrl} alt={tour.title} /><div><small>Tu experiencia seleccionada</small><h3>{tour.title}</h3><p>{tour.destination} · {tour.duration}</p><strong>{tourMoney(tour)}</strong><p>Tarifa referencial por persona. El importe final se confirma en la propuesta.</p></div></aside>
    <form className="quote-form" onSubmit={(event) => { event.preventDefault(); window.open(buildWhatsAppUrl(message), "_blank", "noopener,noreferrer"); }}>
      <h3>Cuéntanos cómo quieres viajar</h3><p>Prepara tu consulta y revísala en WhatsApp antes de enviarla al asesor.</p>
      <label><span><CalendarDays size={18} aria-hidden="true" /> Fecha estimada (opcional)</span><input type="date" min={today} value={date} onChange={(event) => setDate(event.target.value)} /></label>
      <label><span><UsersRound size={18} aria-hidden="true" /> Número de viajeros</span><input type="number" min="1" max="100" required value={people} onChange={(event) => setPeople(event.target.value)} /></label>
      <button className="btn-gold" type="submit">Preparar consulta en WhatsApp <ArrowRight size={18} aria-hidden="true" /></button>
      <p className="quote-note">Esta consulta no genera una reserva ni un cobro. La disponibilidad se confirma con el asesor.</p>
    </form>
  </div>;
}
