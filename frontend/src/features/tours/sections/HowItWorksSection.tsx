import { CalendarCheck, CheckCircle2, FileCheck2, MapPinned, MessageCircle, WalletCards } from "lucide-react";

const steps = [
  [MapPinned, "Elige tu tour", "Explora destinos y revisa la información de cada experiencia."],
  [CalendarCheck, "Define tu fecha", "Indica cuándo deseas viajar y cuántas personas participarán."],
  [FileCheck2, "Registra tu reserva", "Completa tus datos para generar una solicitud identificable."],
  [WalletCards, "Separa con Yape", "Realiza el pago de reserva y registra el comprobante."],
  [CheckCircle2, "Recibe la validación", "Nuestro equipo revisa la información y confirma el proceso."],
  [MessageCircle, "Coordina tu experiencia", "Continúa por WhatsApp con tu itinerario y detalles finales."]
] as const;

export function HowItWorksSection() {
  return <section className="how-it-works px-4 py-16 lg:px-6 lg:py-20" aria-labelledby="how-title"><div className="mx-auto max-w-7xl">
    <div className="section-centered-heading"><span className="section-kicker"><CheckCircle2 size={16} /> Proceso simple y claro</span><h2 id="how-title">Reserva tu experiencia en pocos pasos</h2><p>Una ruta guiada para pasar de la inspiración a la coordinación de tu viaje.</p></div>
    <div className="how-it-works-grid">{steps.map(([Icon, title, text], index) => <article key={title} className="how-step-card"><span className="how-step-number">{String(index + 1).padStart(2, "0")}</span><i><Icon size={23} /></i><h3>{title}</h3><p>{text}</p></article>)}</div>
  </div></section>;
}
