import { useState } from "react";
import { ExternalLink, PlayCircle, X } from "lucide-react";
import styles from "./TourSocialVideo.module.css";

// Only reviewed posts from the agency's public account belong here.
const videos: Record<string, { id: string; title: string; description: string }> = {
  "tarapoto-naturaleza": {
    id: "7677759606340324629",
    title: "Tarapoto: naturaleza que se vive",
    description: "Un momento entre cataratas y paisajes amazónicos, compartido por @johntoursperu. Consulta qué visitas corresponden a tu salida."
  }
};

export function TourSocialVideo({ tourSlug }: { tourSlug: string }) {
  const video = videos[tourSlug];
  const [loadedId, setLoadedId] = useState<string | null>(null);
  if (!video) return null;
  const loaded = loadedId === video.id;
  return <section className={styles.section} aria-labelledby={`social-video-${tourSlug}`}>
    <div className={styles.copy}>
      <small>Desde nuestro TikTok</small>
      <h3 id={`social-video-${tourSlug}`}>{video.title}</h3>
      <p>{video.description}</p>
      <a href={`https://www.tiktok.com/@johntoursperu/video/${video.id}`} target="_blank" rel="noopener noreferrer">Ver publicación original <ExternalLink size={16} /></a>
      <p className={styles.notice}>El reproductor se conecta con TikTok solo al activarlo. TikTok puede utilizar cookies; si no carga, abre la publicación original.</p>
    </div>
    <div className={styles.player}>
      {loaded ? <>
        <iframe src={`https://www.tiktok.com/player/v1/${video.id}?autoplay=0&rel=0&description=1`} title={video.title} allow="fullscreen" allowFullScreen referrerPolicy="strict-origin-when-cross-origin" />
        <button className={styles.close} type="button" onClick={() => setLoadedId(null)} aria-label="Cerrar reproductor de TikTok"><X size={18} /></button>
      </> : <button className={styles.activate} type="button" onClick={() => setLoadedId(video.id)}><PlayCircle size={54} /><strong>Cargar video de TikTok</strong><span>Sin reproducción automática</span></button>}
    </div>
  </section>;
}
