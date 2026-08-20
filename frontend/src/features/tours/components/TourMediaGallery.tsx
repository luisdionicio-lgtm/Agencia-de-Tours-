import { Camera, MapPinned, ShieldCheck } from "lucide-react";
import { tourMediaBySlug } from "../config/tourMedia";

export function TourMediaGallery({ tourSlug }: { tourSlug: string }) {
  const gallery = tourMediaBySlug[tourSlug];
  if (!gallery) return null;

  return (
    <section className="tour-media-gallery" aria-labelledby={`tour-media-${tourSlug}`}>
      <div className="tour-media-heading">
        <div>
          <span><Camera size={15} /> Fotografías propias</span>
          <h3 id={`tour-media-${tourSlug}`}>Así se vive esta ruta</h3>
          <p>{gallery.introduction}</p>
        </div>
        <div className="tour-media-origin"><ShieldCheck size={18} /><span><strong>Archivo seleccionado</strong><small>{gallery.eyebrow}</small></span></div>
      </div>
      <div className={`tour-media-grid tour-media-grid-${gallery.items.length}`}>
        {gallery.items.map((item) => (
          <figure key={item.image} className="tour-media-card">
            <img src={item.image} alt={item.alt} loading="lazy" decoding="async" />
            <figcaption>
              <small><MapPinned size={13} /> {item.stage}</small>
              <strong>{item.title}</strong>
            </figcaption>
          </figure>
        ))}
      </div>
      <p className="tour-media-disclaimer">Selección visual del archivo propio. La secuencia definitiva, horarios, accesos y servicios se confirman al reservar.</p>
    </section>
  );
}
