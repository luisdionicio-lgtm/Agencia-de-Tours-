import { ArrowRight, CalendarDays, Camera, ChevronLeft, ChevronRight, CirclePlay, Info, MapPin, Sparkles } from "lucide-react";
import { Link } from "../../../core/routing";
import type { Tour } from "../../../shared/types";

type Promotion = {
  tourId: number;
  title: string;
  destination: string;
  period: string;
  message: string;
  image: string;
  video?: string;
};

const promotions: Promotion[] = [
  {
    tourId: 1,
    title: "Cusco y Machu Picchu",
    destination: "Cusco, Perú",
    period: "Periodo demo · 15 ago. — 30 sep. 2026",
    message: "Solicita una propuesta para familias, parejas o grupos con itinerario coordinado y acompañamiento antes del viaje.",
    image: "/destinations/machu-picchu.webp"
  },
  {
    tourId: 5,
    title: "Tarapoto: naturaleza en movimiento",
    destination: "San Martín, Perú",
    period: "Periodo demo · 01 sep. — 15 nov. 2026",
    message: "Conoce una muestra del recorrido y consulta una salida adaptada a tus fechas. Actividades sujetas a confirmación del operador.",
    image: "/destinations/tarapoto.webp",
    video: "/media/tarapoto-naturaleza.mp4"
  },
  {
    tourId: 2,
    title: "Guayaquil y costa ecuatoriana",
    destination: "Guayaquil, Ecuador",
    period: "Periodo demo · 02 oct. — 30 nov. 2026",
    message: "Combina recorridos urbanos y una experiencia costera en una propuesta internacional preparada según el tamaño del grupo.",
    image: "/destinations/ecuador-costa.webp"
  },
  {
    tourId: 6,
    title: "Europa esencial",
    destination: "Madrid · París · Roma",
    period: "Temporada referencial · abr. — jun. 2027",
    message: "Una ruta demostrativa por tres capitales europeas para empezar a planificar con tiempo vuelos, alojamiento y experiencias culturales.",
    image: "/destinations/europa-esencial.webp"
  }
];

export function PromotionsShowcase({ tours }: { tours: Tour[] }) {
  return (
    <section className="promotion-section px-4 py-16 lg:px-6 lg:py-20" aria-labelledby="promotion-title">
      <div className="mx-auto max-w-7xl">
        <div className="promotion-heading">
          <div>
            <span className="section-kicker"><Sparkles size={15} /> Inspiración y promociones</span>
            <h2 id="promotion-title">Ideas para tu próximo viaje</h2>
            <p>Fotos, videos breves y periodos promocionales de demostración para ayudarte a elegir. La tarifa y disponibilidad siempre se confirman con un asesor.</p>
          </div>
          <span className="promotion-demo-note"><Info size={17} /> Contenido referencial</span>
        </div>

        <div id="promotionCarousel" className="carousel slide promotion-carousel" data-bs-ride="carousel" data-bs-interval="7000">
          <div className="carousel-indicators">
            {promotions.map((promotion, index) => <button key={promotion.title} type="button" data-bs-target="#promotionCarousel" data-bs-slide-to={index} className={index === 0 ? "active" : ""} aria-current={index === 0 ? "true" : undefined} aria-label={`Mostrar promoción de ${promotion.title}`} />)}
          </div>
          <div className="carousel-inner">
            {promotions.map((promotion, index) => {
              const tour = tours.find((item) => item.id === promotion.tourId);
              return (
                <article key={promotion.title} className={`carousel-item ${index === 0 ? "active" : ""}`}>
                  <div className="promotion-layout">
                    <div className="promotion-media">
                      {promotion.video ? (
                        <video controls playsInline preload="none" poster={promotion.image} aria-label={`Video promocional referencial de ${promotion.title}`}>
                          <source src={promotion.video} type="video/mp4" />
                          Tu navegador no puede reproducir este video.
                        </video>
                      ) : <img src={promotion.image} alt={`Imagen referencial de ${promotion.title}`} loading={index === 0 ? "eager" : "lazy"} decoding="async" />}
                      <span className="promotion-media-kind">{promotion.video ? <CirclePlay size={16} /> : <Camera size={16} />} {promotion.video ? "Video breve" : "Fotografía"}</span>
                    </div>
                    <div className="promotion-copy">
                      <span className="promotion-label">Propuesta demostrativa</span>
                      <p className="promotion-location"><MapPin size={16} /> {promotion.destination}</p>
                      <h3>{tour?.title ?? promotion.title}</h3>
                      <p className="promotion-message">{promotion.message}</p>
                      <span className="promotion-period"><CalendarDays size={18} /><span><small>Fecha promocional referencial</small><strong>{promotion.period}</strong></span></span>
                      <Link to={`/tours/${promotion.tourId}`} className="promotion-cta"><span><small>Revisar itinerario</small><strong>Conocer esta propuesta</strong></span><ArrowRight size={18} /></Link>
                      <small className="promotion-disclaimer">No constituye una oferta final. Precio, fecha, servicios y condiciones se validan antes de reservar.</small>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
          <button className="carousel-control-prev promotion-control" type="button" data-bs-target="#promotionCarousel" data-bs-slide="prev" aria-label="Promoción anterior"><ChevronLeft /></button>
          <button className="carousel-control-next promotion-control" type="button" data-bs-target="#promotionCarousel" data-bs-slide="next" aria-label="Promoción siguiente"><ChevronRight /></button>
        </div>
      </div>
    </section>
  );
}
