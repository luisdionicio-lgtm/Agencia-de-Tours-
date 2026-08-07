import { BadgeCheck, FileText, Headphones, MapPinned, MessageCircle, ReceiptText, ShieldCheck, WalletCards } from "lucide-react";

const benefits = [
  [ShieldCheck, "Viajes seguros", "Coordinación clara antes, durante y después de cada experiencia."],
  [BadgeCheck, "Atención personalizada", "Un asesor real te orienta según tu destino y presupuesto."],
  [MapPinned, "Tours seleccionados", "Experiencias nacionales e internacionales cuidadosamente presentadas."],
  [WalletCards, "Reserva por Yape", "Separa tu viaje desde S/ 200 con un proceso sencillo."],
  [ReceiptText, "Comprobante digital", "Registra tu pago y conserva un código único de seguimiento."],
  [FileText, "Itinerario detallado", "Revisa qué incluye, exclusiones y actividades antes de decidir."],
  [MessageCircle, "Contacto por WhatsApp", "Resuelve dudas rápidamente desde un canal directo."],
  [Headphones, "Acompañamiento continuo", "Recibe orientación humana durante toda la experiencia."]
] as const;

export function TrustSection() {
  return <section className="trust-premium-section px-4 py-16 lg:px-6 lg:py-20" aria-labelledby="trust-title"><div className="mx-auto max-w-7xl">
    <div className="section-centered-heading"><span className="section-kicker"><ShieldCheck size={16} /> Confianza para viajar</span><h2 id="trust-title">Viaja con confianza con JohnToursPerú</h2><p>Información transparente, atención cercana y herramientas pensadas para que reserves con tranquilidad.</p></div>
    <div className="trust-premium-grid">{benefits.map(([Icon, title, text]) => <article key={title} className="trust-premium-card"><span><Icon size={24} /></span><h3>{title}</h3><p>{text}</p></article>)}</div>
  </div></section>;
}
