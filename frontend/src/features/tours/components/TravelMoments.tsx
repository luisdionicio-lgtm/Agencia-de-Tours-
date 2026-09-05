import { useState } from "react";
import { ArrowRight, Camera, MapPin } from "lucide-react";
import { Link } from "../../../core/routing";
import type { Tour } from "../../../shared/types";
import { tourMoney } from "../lib/presentation";
import { tourPhotoPreview } from "../config/tourMedia";
import styles from "./TravelMoments.module.css";

const experiences = [
  { slug: "machu-picchu", image: "/travel-archive/machu-picchu-equipo.webp", place: "Machu Picchu", region: "Perú", note: "La ciudadela inca, dentro del circuito Cusco–Puno–Arequipa." },
  { slug: "oxapampa-pozuzo", image: "/tour-galleries/pozuzo/comunidad-local.webp", place: "Oxapampa y Pozuzo", region: "Perú", note: "Encuentros culturales y naturaleza de selva alta." },
  { slug: "guayaquil-costa-ecuador", image: "/tour-galleries/guayaquil/montanita.webp", place: "Montañita", region: "Ecuador", note: "Una extensión a la costa para consultar con tu asesor." },
  { slug: "machu-picchu", image: "/tour-galleries/machu-picchu/arequipa.webp", place: "Arequipa", region: "Perú", note: "La Ciudad Blanca completa el circuito por el sur del Perú." },
  { slug: "lago-titicaca-ruta-bolivia", image: "/tour-galleries/bolivia/uros.webp", place: "Lago Titicaca", region: "Perú y Bolivia", note: "Paisajes de altura y cultura viva en los Uros." },
  { slug: "ica-y-huacachina", image: "/travel-archive/ica-tubulares.webp", place: "Huacachina", region: "Perú", note: "Una aventura entre dunas, tubulares y el oasis." },
  { slug: "guayaquil-costa-ecuador", image: "/tour-galleries/guayaquil/la-perla.webp", place: "Guayaquil", region: "Ecuador", note: "El Malecón, Las Peñas y una ciudad junto al río." },
  { slug: "tarapoto-naturaleza", image: "/travel-archive/tarapoto-mirador.webp", place: "Tarapoto", region: "Perú", note: "Miradores y paisajes amazónicos para tu próxima ruta." }
];
const filters = ["Todos", "Perú", "Ecuador", "Perú y Bolivia"];

export function TravelMoments({ tours }: { tours: Tour[] }) {
  const [filter, setFilter] = useState("Todos");
  const [expanded, setExpanded] = useState(false);
  const available = experiences.flatMap((experience) => {
    const tour = tours.find((item) => item.slug === experience.slug);
    return tour ? [{ ...experience, tour }] : [];
  });
  const filtered = available.filter((item) => filter === "Todos" || item.region === filter);
  const visible = expanded ? filtered : filtered.slice(0, 6);
  return <section className={styles.section} aria-labelledby="travel-moments-title">
    <div className={styles.shell}>
      <div className={styles.heading}>
        <div><span><Camera size={16} /> Momentos del viaje</span><h2 id="travel-moments-title">Encuentra tu próxima historia</h2><p>Conoce los destinos a través de nuestros viajes. Elige una fotografía y descubre el paquete relacionado.</p></div>
        <Link to="/tours" className={styles.catalog}>Explorar todos los paquetes <ArrowRight size={17} /></Link>
      </div>
      <div className={styles.filters} role="group" aria-label="Filtrar fotografías por región">
        {filters.map((region) => <button key={region} type="button" aria-pressed={filter === region} onClick={() => { setFilter(region); setExpanded(false); }}>{region}</button>)}
        <span role="status">{filtered.length} experiencias</span>
      </div>
      <div className={styles.grid}>
        {visible.map((item) => <Link key={item.place} to={`/tours/${item.tour.id}`} className={styles.card} aria-label={`Descubrir ${item.place}: ${item.tour.title}`}>
          <div className={styles.photo}><img src={tourPhotoPreview(item.image)} alt={`${item.place}: viajeros y paisajes de la ruta`} loading="lazy" decoding="async" /><span><ArrowRight size={18} /></span></div>
          <div className={styles.copy}><small><MapPin size={13} /> {item.region}</small><h3>{item.place}</h3><p>{item.note}</p><div><span>Paquete desde <strong>{tourMoney(item.tour)}</strong></span><b>Ver ruta <ArrowRight size={15} /></b></div></div>
        </Link>)}
      </div>
      {filtered.length > 6 && <button className={styles.more} type="button" aria-expanded={expanded} onClick={() => setExpanded(!expanded)}>{expanded ? "Mostrar selección principal" : `Ver ${filtered.length - 6} experiencias más`}</button>}
      <p className={styles.disclaimer}>Fotos de viajes realizados. Precios referenciales por paquete; fechas, visitas y servicios se confirman antes de contratar.</p>
    </div>
  </section>;
}
