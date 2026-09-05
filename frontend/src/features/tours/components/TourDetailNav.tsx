import { Camera, FileText, MapPin, PlayCircle } from "lucide-react";
import styles from "./TourDetailNav.module.css";

export function TourDetailNav({ photos, video, itineraries }: { photos: boolean; video: boolean; itineraries: boolean }) {
  return <nav className={styles.nav} aria-label="Secciones del paquete">
    <a href="#tour-overview"><MapPin size={16} /> Resumen</a>
    {photos && <a href="#tour-photos"><Camera size={16} /> Fotografías</a>}
    {video && <a href="#tour-video"><PlayCircle size={16} /> Video del viaje</a>}
    {itineraries && <a href="#tour-itineraries"><FileText size={16} /> Comparar itinerarios</a>}
  </nav>;
}
