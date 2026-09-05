import { useEffect, useRef, useState } from "react";
import { Camera, ChevronLeft, ChevronRight, Expand, MapPinned, X } from "lucide-react";
import { tourMediaBySlug, tourPhotoPreview } from "../config/tourMedia";
import styles from "./TourMediaGallery.module.css";

export function TourMediaGallery({ tourSlug }: { tourSlug: string }) {
  const gallery = tourMediaBySlug[tourSlug];
  const [selected, setSelected] = useState<number | null>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const active = selected === null ? undefined : gallery?.items[selected];
  const isOpen = Boolean(active);

  useEffect(() => {
    const element = dialog.current;
    if (!isOpen || !element) return;
    const previousOverflow = document.body.style.overflow;
    element.showModal();
    document.body.style.overflow = "hidden";
    return () => {
      element.close();
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen]);

  useEffect(() => { setSelected(null); }, [tourSlug]);
  if (!gallery) return null;
  const navigate = (direction: number) => setSelected((current) => current === null ? null : (current + direction + gallery.items.length) % gallery.items.length);

  return (
    <section id="tour-photos" className={styles.gallery} aria-labelledby={`tour-media-${tourSlug}`}>
      <div className={styles.heading}>
        <div>
          <span><Camera size={15} /> Galería del destino</span>
          <h3 id={`tour-media-${tourSlug}`}>Así se vive esta ruta</h3>
          <p>{gallery.introduction}</p>
        </div>
        <small>{gallery.items.length} fotografías · Toca para ampliar</small>
      </div>
      <div className={styles.grid}>
        {gallery.items.map((item, index) => (
          <figure key={item.image} className={styles.card}>
            <button type="button" className={styles.photo} onClick={() => setSelected(index)} aria-label={`Ampliar foto: ${item.title}`} aria-haspopup="dialog">
              <img src={tourPhotoPreview(item.image)} alt={item.alt} loading="lazy" decoding="async" />
              <span className={styles.expand}><Expand size={17} aria-hidden="true" /></span>
            </button>
            <figcaption>
              <small><MapPinned size={13} /> {item.stage}</small>
              <strong>{item.title}</strong>
            </figcaption>
          </figure>
        ))}
      </div>
      <p className={styles.disclaimer}>Imágenes de la ruta. Las visitas incluidas, horarios y servicios se confirman en la propuesta de tu reserva.</p>
      <dialog ref={dialog} className={styles.viewer} aria-labelledby={`photo-title-${tourSlug}`} onCancel={() => setSelected(null)} onClose={() => setSelected(null)} onClick={(event) => { if (event.target === event.currentTarget) setSelected(null); }} onKeyDown={(event) => {
        if (event.key === "ArrowRight") { event.preventDefault(); navigate(1); }
        if (event.key === "ArrowLeft") { event.preventDefault(); navigate(-1); }
      }}>
        {active && <div className={styles.viewerContent}>
          <div className={styles.toolbar}><span id={`photo-title-${tourSlug}`}>{active.title}</span><button type="button" onClick={() => setSelected(null)} aria-label="Cerrar fotografía" autoFocus><X /></button></div>
          <img className={styles.fullPhoto} src={active.image} alt={active.alt} />
          <div className={styles.navigation}>
            <button type="button" onClick={() => navigate(-1)} aria-label="Fotografía anterior"><ChevronLeft /></button>
            <span aria-live="polite">{(selected ?? 0) + 1} / {gallery.items.length} · {active.stage}</span>
            <button type="button" onClick={() => navigate(1)} aria-label="Fotografía siguiente"><ChevronRight /></button>
          </div>
        </div>}
      </dialog>
    </section>
  );
}
