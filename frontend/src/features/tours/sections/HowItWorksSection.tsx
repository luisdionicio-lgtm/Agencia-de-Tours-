import { CalendarCheck, CheckCircle2, FileCheck2, MapPinned, MessageCircle, WalletCards } from "lucide-react";
import { ServiceIcon } from "../components/ServiceIcon";
import { isStaticPresentation } from "../config/contact";

const consultationSteps = [
  [MapPinned, "Encuentra tu destino", "Revisa el recorrido y los servicios propuestos para tu viaje."],
  [CalendarCheck, "Cuéntanos tu plan", "Comparte tus fechas, número de viajeros y presupuesto con un asesor."],
  [FileCheck2, "Recibe tu cotización", "Confirma disponibilidad, precio final y condiciones antes de realizar un pago."]
] as const;

const steps = [
  [MapPinned, "Elige tu tour", "Explora destinos y revisa la información de cada experiencia."],
  [CalendarCheck, "Define tu fecha", "Indica cuándo deseas viajar y cuántas personas participarán."],
  [FileCheck2, "Registra tu reserva", "Completa tus datos para generar una solicitud identificable."],
  [WalletCards, "Separa con Yape", "Realiza el pago de reserva y registra el comprobante."],
  [CheckCircle2, "Recibe la validación", "Nuestro equipo revisa la información y confirma el proceso."],
  [MessageCircle, "Coordina tu experiencia", "Continúa por WhatsApp con tu itinerario y detalles finales."]
] as const;

export function HowItWorksSection() {
  const visibleSteps = isStaticPresentation ? consultationSteps : steps;
  return <section className="how-it-works px-4 py-16 lg:px-6 lg:py-20" aria-labelledby="how-title"><div className="mx-auto max-w-7xl">
    <div className="section-centered-heading"><span className="section-kicker"><CheckCircle2 size={16} /> Proceso simple y claro</span><h2 id="how-title">Reserva tu experiencia en pocos pasos</h2><p>Una ruta guiada para pasar de la inspiración a la coordinación de tu viaje.</p></div>
    <div className="how-it-works-grid">{visibleSteps.map(([Icon, title, text], index) => <article key={title} className="how-step-card"><span className="how-step-number">{String(index + 1).padStart(2, "0")}</span><ServiceIcon icon={Icon} size={24} /><h3>{title}</h3><p>{text}</p></article>)}</div>
  </div></section>;
}
