import { ArrowRight, Award, CalendarDays, Hotel, MapPin, MessageCircle, Plane, ShieldCheck, Star, UsersRound } from "lucide-react";
import { Link } from "../../../core/routing";
import type { Tour } from "../../../shared/types";
import { tourMoney } from "../lib/presentation";
import { buildWhatsAppUrl } from "../config/contact";

export function TourCard({ tour }: { tour: Tour }) {
  const tags = tour.type === "NACIONAL" ? ["Cultura", "Naturaleza", "Asistencia"] : ["Internacional", "Planificación", "Asistencia"];
  const benefits = [
    { icon: <ShieldCheck size={17} />, label: "Plan verificado" },
    { icon: <Hotel size={17} />, label: "Hotel coordinado" },
    { icon: <UsersRound size={17} />, label: "Asesor humano" }
  ];

  return (
    <article className="tour-card group">
      <div className="tour-card-media">
        <img src={tour.imageUrl} alt={tour.title} loading="lazy" decoding="async" />
        <div className="tour-card-media-shade" />
        <span className="tour-type-badge"><Plane size={13} /> {tour.type === "NACIONAL" ? "Tour nacional" : "Tour internacional"}</span>
        <span className="tour-verified-badge"><ShieldCheck size={14} /> Selección confiable</span>
      </div>
      <div className="tour-card-body">
        <div className="tour-card-heading">
          <p className="tour-location"><MapPin size={15} /> {tour.destination}</p>
          <span className="tour-recommended"><Award size={15} /> Selección JohnTours</span>
        </div>
        <h3>{tour.title}</h3>
        <div className="tour-rating" aria-label="Valoración referencial de 4.9 sobre 5"><span><Star size={15} fill="currentColor" /> 4.9</span><small>Experiencia recomendada</small></div>
        <p className="tour-card-description">{tour.description}</p>
        <div className="tour-tags">{tags.map((tag) => <span key={tag}>{tag}</span>)}</div>
        <div className="tour-benefits" aria-label="Características del paquete">
          {benefits.map((benefit) => (
            <span key={benefit.label}><i>{benefit.icon}</i>{benefit.label}</span>
          ))}
        </div>
        <div className="tour-card-summary">
          <div className="tour-card-price"><small>Desde</small><strong>{tourMoney(tour)}</strong><span>por persona</span></div>
          <div className="tour-card-duration"><CalendarDays size={19} /><span><small>Duración</small><strong>{tour.duration}</strong></span></div>
        </div>
        <div className="tour-card-actions"><Link to={`/tours/${tour.id}`} className="tour-card-cta">
          <span className="button-emblem button-emblem-gold"><Plane size={17} /></span>
          <span className="button-copy"><small>Información completa</small><strong>Conocer el paquete</strong></span>
          <span className="button-terminal"><ArrowRight size={17} /></span>
        </Link><a className="tour-card-whatsapp" href={buildWhatsAppUrl(`Hola JohnToursPerú, deseo información sobre el tour ${tour.title}.`)} target="_blank" rel="noreferrer" aria-label={`Consultar ${tour.title} por WhatsApp`}><MessageCircle size={20} /><span>WhatsApp</span></a></div>
      </div>
    </article>
  );
}
