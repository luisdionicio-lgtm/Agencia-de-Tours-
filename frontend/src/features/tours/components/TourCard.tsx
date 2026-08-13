import { ArrowRight, Award, CalendarDays, Hotel, MapPin, Plane, ShieldCheck, UsersRound, type LucideIcon } from "lucide-react";
import { Link } from "../../../core/routing";
import type { Tour } from "../../../shared/types";
import { tourMoney } from "../lib/presentation";

const TOUR_TAGS = {
  NACIONAL: ["Cultura", "Naturaleza", "Asistencia"],
  INTERNACIONAL: ["Internacional", "Planificación", "Asistencia"]
} as const;

const TOUR_BENEFITS: ReadonlyArray<{ icon: LucideIcon; label: string; tone: string }> = [
  { icon: ShieldCheck, label: "Plan verificado", tone: "secure" },
  { icon: Hotel, label: "Hotel coordinado", tone: "stay" },
  { icon: UsersRound, label: "Asesor humano", tone: "guide" }
];

export function TourCard({ tour }: { tour: Tour }) {
  const tags = TOUR_TAGS[tour.type];

  return (
    <article className="tour-card group">
      <div className="tour-card-media">
        <img src={tour.imageUrl} alt={tour.title} loading="lazy" decoding="async" />
        <div className="tour-card-media-shade" />
        <span className="tour-type-badge"><i><Plane size={13} /></i> {tour.type === "NACIONAL" ? "Tour nacional" : "Tour internacional"}</span>
        <span className="tour-verified-badge"><i><ShieldCheck size={14} /></i> Selección confiable</span>
      </div>
      <div className="tour-card-body">
        <div className="tour-card-heading">
          <p className="tour-location"><i><MapPin size={15} /></i> {tour.destination}</p>
          <span className="tour-recommended"><i><Award size={15} /></i> Selección JohnTours</span>
        </div>
        <h3>{tour.title}</h3>
        <p className="tour-card-description">{tour.description}</p>
        <div className="tour-tags">{tags.map((tag) => <span key={tag}>{tag}</span>)}</div>
        <div className="tour-benefits" aria-label="Características del paquete">
          {TOUR_BENEFITS.map(({ icon: Icon, label, tone }) => (
            <span key={label} className="tour-benefit"><i className={`tour-benefit-icon is-${tone}`}><b aria-hidden="true" /><Icon size={17} /></i><em>{label}</em></span>
          ))}
        </div>
        <div className="tour-card-summary">
          <div className="tour-card-price"><small>{tour.priceIsEstimated ? "Precio demo desde" : Number(tour.price) > 0 ? "Desde" : "Tarifa"}</small><strong>{tourMoney(tour)}</strong><span>{tour.priceIsEstimated ? "referencial · confirmar" : Number(tour.price) > 0 ? "por persona" : "según fecha y grupo"}</span></div>
          <div className="tour-card-duration"><i><CalendarDays size={18} /></i><span><small>Duración</small><strong>{tour.duration}</strong></span></div>
        </div>
        <Link to={`/tours/${tour.id}`} className="tour-card-cta">
          <span className="button-emblem button-emblem-gold"><Plane size={17} /></span>
          <span className="button-copy"><small>Información completa</small><strong>Conocer el paquete</strong></span>
          <span className="button-terminal"><ArrowRight size={17} /></span>
        </Link>
      </div>
    </article>
  );
}
