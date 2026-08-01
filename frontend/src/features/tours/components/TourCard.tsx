import { ArrowRight, Award, CalendarDays, Hotel, MapPin, Plane, ShieldCheck, UsersRound } from "lucide-react";
import { Link } from "../../../core/routing";
import type { Tour } from "../../../shared/types";
import { tourMoney } from "../lib/presentation";

export function TourCard({ tour }: { tour: Tour }) {
  const benefits = [
    { icon: <ShieldCheck size={17} />, label: "Viaje seguro" },
    { icon: <Hotel size={17} />, label: "Alojamiento" },
    { icon: <UsersRound size={17} />, label: "Asistencia" }
  ];

  return (
    <article className="tour-card group">
      <div className="tour-card-media">
        <img src={tour.imageUrl} alt={tour.title} loading="lazy" decoding="async" />
        <div className="tour-card-media-shade" />
        <span className="tour-type-badge"><Plane size={13} /> {tour.type === "NACIONAL" ? "Tour nacional" : "Tour internacional"}</span>
        <span className="tour-verified-badge"><ShieldCheck size={14} /> Experiencia verificada</span>
      </div>
      <div className="tour-card-body">
        <div className="tour-card-heading">
          <p className="tour-location"><MapPin size={15} /> {tour.destination}</p>
          <span className="tour-recommended"><Award size={15} /> Selección JhonTours</span>
        </div>
        <h3>{tour.title}</h3>
        <p className="tour-card-description">{tour.description}</p>
        <div className="tour-benefits" aria-label="Características del paquete">
          {benefits.map((benefit) => (
            <span key={benefit.label}><i>{benefit.icon}</i>{benefit.label}</span>
          ))}
        </div>
        <div className="tour-card-summary">
          <div className="tour-card-price"><small>Desde</small><strong>{tourMoney(tour)}</strong><span>por persona</span></div>
          <div className="tour-card-duration"><CalendarDays size={19} /><span><small>Duración</small><strong>{tour.duration}</strong></span></div>
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
