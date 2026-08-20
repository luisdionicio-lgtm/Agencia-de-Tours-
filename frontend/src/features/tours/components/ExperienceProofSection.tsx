import { ArrowRight, MapPinned, ShieldCheck, UsersRound } from "lucide-react";
import { Link } from "../../../core/routing";

const EXPERIENCES = [
  {
    tourId: 1,
    image: "/experience-proof/machu-grupo.webp",
    destination: "Machu Picchu",
    route: "Cusco, Perú",
    message: "Viajes grupales con coordinación antes, durante y después del recorrido."
  },
  {
    tourId: 9,
    image: "/experience-proof/uros-grupo.webp",
    destination: "Islas de los Uros",
    route: "Puno, Perú",
    message: "Experiencias culturales con orientación en destino y una ruta organizada."
  },
  {
    tourId: 2,
    image: "/experience-proof/guayaquil-grupo.webp",
    destination: "Guayaquil",
    route: "Ecuador",
    message: "Acompañamiento para grupos en experiencias nacionales e internacionales."
  }
] as const;

export function ExperienceProofSection() {
  return (
    <section className="experience-proof-section" aria-labelledby="experience-proof-title">
      <div className="experience-proof-shell">
        <div className="experience-proof-heading">
          <div>
            <span><ShieldCheck size={15} /> Experiencias JohnToursPerú</span>
            <h2 id="experience-proof-title">Viajes reales, acompañamiento que se nota</h2>
            <p>Una muestra breve de grupos atendidos por nuestro equipo en diferentes rutas.</p>
          </div>
          <div className="experience-proof-seal"><UsersRound size={20} /><span><strong>Atención cercana</strong><small>Coordinación para cada grupo</small></span></div>
        </div>

        <div className="experience-proof-grid">
          {EXPERIENCES.map((experience) => (
            <Link key={experience.destination} to={`/tours/${experience.tourId}`} className="experience-proof-card">
              <img src={experience.image} alt={`Grupo de viajeros en ${experience.destination}`} loading="lazy" decoding="async" />
              <span className="experience-proof-overlay" />
              <span className="experience-proof-copy">
                <small><MapPinned size={14} /> {experience.route}</small>
                <strong>{experience.destination}</strong>
                <em>{experience.message}</em>
                <b>Conocer el paquete <ArrowRight size={17} /></b>
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
