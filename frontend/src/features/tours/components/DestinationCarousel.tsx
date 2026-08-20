import { ArrowRight, CalendarDays, ChevronLeft, ChevronRight, MapPin, Sparkles } from "lucide-react";
import { Link } from "../../../core/routing";
import type { Tour } from "../../../shared/types";
import { tourMoney } from "../lib/presentation";

const destinationMood: Record<string, string> = {
  "machu-picchu": "Cusco, Puno y Arequipa conectados en un solo circuito.",
  "guayaquil-costa-ecuador": "Ciudad, costa y experiencias frente al mar.",
  "oxapampa-pozuzo": "Naturaleza, calma y tradición en un solo viaje.",
  "ica-y-huacachina": "Aventura entre dunas y atardeceres inolvidables.",
  "tarapoto-naturaleza": "Amazonía, agua y paisajes llenos de vida.",
  "mancora-punta-sal-tumbes": "Sol, costa norte y naturaleza marina.",
  "cartagena-islas-caribe": "Historia, color y mar Caribe en una misma ruta.",
  "rio-de-janeiro": "Miradores icónicos, cultura y energía brasileña.",
  "buenos-aires-iguazu": "Ciudad, naturaleza y cataratas monumentales.",
  "punta-cana-santo-domingo": "Playas caribeñas y patrimonio colonial.",
  "disney-orlando": "Diversión familiar y parques inolvidables."
};

export function DestinationCarousel({ tours }: { tours: Tour[] }) {
  const destinations = tours;
  if (!destinations.length) return null;

  return (
    <section id="destinos" className="destination-showcase px-4 py-16 lg:px-6 lg:py-20" aria-labelledby="destination-showcase-title">
      <div className="mx-auto max-w-7xl">
        <div className="destination-showcase-heading">
          <div>
            <span className="section-kicker"><Sparkles size={15} /> Destinos extraordinarios</span>
            <h2 id="destination-showcase-title">Encuentra el viaje que quieres recordar</h2>
            <p>{destinations.length} experiencias nacionales e internacionales para comparar, elegir y abrir directamente su paquete.</p>
          </div>
          <Link to="/tours" className="destination-all-link">Ver todos los tours <ArrowRight size={17} /></Link>
        </div>

        <div id="destinationCarousel" className="carousel slide destination-carousel" data-bs-ride="carousel" data-bs-interval="5200">
          <div className="carousel-indicators">
            {destinations.map((tour, index) => <button key={tour.id} type="button" data-bs-target="#destinationCarousel" data-bs-slide-to={index} className={index === 0 ? "active" : ""} aria-current={index === 0 ? "true" : undefined} aria-label={`Mostrar ${tour.title}`} />)}
          </div>
          <div className="carousel-inner">
            {destinations.map((tour, index) => (
              <article key={tour.id} className={`carousel-item ${index === 0 ? "active" : ""}`}>
                <img src={tour.imageUrl} alt={`Paisaje referencial de ${tour.title}`} loading={index === 0 ? "eager" : "lazy"} decoding="async" />
                <div className="destination-carousel-overlay" />
                <div className="destination-carousel-content">
                  <span className="destination-type">{tour.type === "NACIONAL" ? "Tour nacional" : "Tour internacional"}</span>
                  <p><MapPin size={16} /> {tour.destination}</p>
                  <h3>{tour.title}</h3>
                  <strong>{destinationMood[tour.slug] ?? "Una experiencia diseñada para disfrutar cada momento."}</strong>
                  <div className="destination-carousel-meta">
                    <span><CalendarDays size={17} /> {tour.duration}</span>
                    <span><small>{Number(tour.price) > 0 ? "Desde" : "Tarifa"}</small>{tourMoney(tour)}</span>
                  </div>
                  <Link to={`/tours/${tour.id}`} className="destination-carousel-cta">Ver experiencia <ArrowRight size={18} /></Link>
                </div>
              </article>
            ))}
          </div>
          <button className="carousel-control-prev destination-carousel-control" type="button" data-bs-target="#destinationCarousel" data-bs-slide="prev" aria-label="Destino anterior"><ChevronLeft /></button>
          <button className="carousel-control-next destination-carousel-control" type="button" data-bs-target="#destinationCarousel" data-bs-slide="next" aria-label="Destino siguiente"><ChevronRight /></button>
        </div>
      </div>
    </section>
  );
}
