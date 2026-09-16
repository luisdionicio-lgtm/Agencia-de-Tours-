import { ArrowRight, CalendarDays, ClipboardList, MapPin, Plane, Globe2 } from "lucide-react";
import { Link } from "../../../core/routing";
import type { Tour } from "../../../shared/types";
import { tourMoney } from "../lib/presentation";
import { SpotlightCard } from "./TravelMotion";
import { ServiceIcon } from "./ServiceIcon";

const TOUR_TAGS = {
  NACIONAL: ["Cultura", "Naturaleza", "Asistencia"],
  INTERNACIONAL: ["Internacional", "Planificación", "Asistencia"]
} as const;

export function TourCard({ tour }: { tour: Tour }) {
  const tags = TOUR_TAGS[tour.type];

  return (
    <SpotlightCard className="tour-card group">
      <div className="tour-card-media">
        <img src={tour.imageUrl} alt={tour.title} loading="lazy" decoding="async" />
        <div className="tour-card-media-shade" />
        <span className="tour-type-badge"><ServiceIcon icon={tour.type === "NACIONAL" ? MapPin : Globe2} size={15} /> {tour.type === "NACIONAL" ? "Tour nacional" : "Tour internacional"}</span>
      </div>
      <div className="tour-card-body">
        <div className="tour-card-heading">
          <p className="tour-location"><i><MapPin size={15} /></i> {tour.destination}</p>
        </div>
        <h3>{tour.title}</h3>
        <p className="tour-card-description">{tour.description}</p>
        <div className="tour-tags">{tags.map((tag) => <span key={tag}>{tag}</span>)}</div>
        {!!tour.includes?.length && <div className="tour-services-preview"><ServiceIcon icon={ClipboardList} /><p><strong>Servicios del programa</strong><span>{tour.includes.slice(0, 2).join(" · ")}</span></p></div>}
        <div className="tour-card-summary">
          <div className="tour-card-price"><small>{tour.priceIsEstimated ? "Tarifa referencial" : Number(tour.price) > 0 ? "Desde" : "Tarifa"}</small><strong>{tourMoney(tour)}</strong><span>{tour.priceIsEstimated ? "por persona · confirmar" : Number(tour.price) > 0 ? "por persona" : "según fecha y grupo"}</span></div>
          <div className="tour-card-duration"><i><CalendarDays size={18} /></i><span><small>Duración</small><strong>{tour.duration}</strong></span></div>
        </div>
        <Link to={`/tours/${tour.id}`} className="tour-card-cta">
          <span className="button-emblem button-emblem-gold"><Plane size={17} /></span>
          <span className="button-copy"><small>Información completa</small><strong>Conocer el paquete</strong></span>
          <span className="button-terminal"><ArrowRight size={17} /></span>
        </Link>
      </div>
    </SpotlightCard>
  );
}
