import { ArrowRight, Camera, MapPin, ShieldCheck } from "lucide-react";
import { Link } from "../../../core/routing";

const ARCHIVE_EXPERIENCES = [
  { tourId: 1, image: "/travel-archive/machu-picchu-equipo.webp", place: "Machu Picchu", country: "Circuito Cusco, Puno y Arequipa", price: "S/ 2,850", note: "Ciudadela inca dentro del circuito integrado" },
  { tourId: 1, image: "/travel-archive/valle-sagrado-equipo.webp", place: "Valle Sagrado", country: "Circuito Cusco, Puno y Arequipa", price: "S/ 2,850", note: "Paisajes andinos antes de continuar hacia Puno" },
  { tourId: 9, image: "/travel-archive/lago-titicaca.webp", place: "Lago Titicaca", country: "Puno y Bolivia", price: "USD 480", note: "Ruta binacional de cultura y naturaleza" },
  { tourId: 2, image: "/travel-archive/guayaquil-la-perla.webp", place: "La Perla", country: "Guayaquil, Ecuador", price: "USD 890", note: "Ciudad, malecón y costa ecuatoriana" },
  { tourId: 3, image: "/travel-archive/pozuzo-colonia.webp", place: "Pozuzo", country: "Pasco, Perú", price: "S/ 780", note: "Historia austroalemana y naturaleza" },
  { tourId: 4, image: "/travel-archive/ica-tubulares.webp", place: "Huacachina", country: "Ica, Perú", price: "S/ 650", note: "Dunas, tubulares y atardecer en el oasis" },
  { tourId: 5, image: "/travel-archive/tarapoto-mirador.webp", place: "Tarapoto", country: "San Martín, Perú", price: "S/ 1,150", note: "Miradores y naturaleza amazónica" }
] as const;

export function TravelArchiveShowcase() {
  return (
    <section className="travel-archive-section" aria-labelledby="travel-archive-title">
      <div className="travel-archive-shell">
        <div className="travel-archive-heading">
          <div>
            <span><Camera size={16} /> Selección de destinos</span>
            <h2 id="travel-archive-title">Destinos vividos por nuestro equipo</h2>
            <p>Una selección curada de fotografías propias, elegidas por claridad y valor turístico para mostrar experiencias reales.</p>
          </div>
          <div className="travel-archive-trust"><ShieldCheck size={18} /><strong>Fotografías propias</strong><small>Optimizadas y sin metadatos</small></div>
        </div>

        <div className="travel-archive-grid">
          {ARCHIVE_EXPERIENCES.map((item, index) => (
            <Link key={`${item.place}-${index}`} to={`/tours/${item.tourId}`} className={`travel-archive-card archive-card-${index + 1}`}>
              <img src={item.image} alt={`${item.place}, ${item.country}`} loading="lazy" decoding="async" />
              <span className="travel-archive-shade" />
              <span className="travel-archive-location"><MapPin size={14} /> {item.country}</span>
              <span className="travel-archive-copy">
                <small>Destino recomendado</small>
                <strong>{item.place}</strong>
                <em>{item.note}</em>
                <b><span>Precio demo desde {item.price}</span><ArrowRight size={17} /></b>
              </span>
            </Link>
          ))}
        </div>
        <p className="travel-archive-disclaimer">Precios referenciales de demostración. La tarifa final se confirma según fecha, servicios, transporte y número de viajeros.</p>
      </div>
    </section>
  );
}
