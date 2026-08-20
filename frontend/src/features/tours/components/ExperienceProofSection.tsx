import { ArrowRight, BadgeCheck, MapPinned, PlaneTakeoff, ShieldCheck, UsersRound } from "lucide-react";
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

const OPERATIONAL_SUPPORT = [
  {
    image: "/operations/recepcion-aeropuerto.webp",
    eyebrow: "Recepción coordinada",
    title: "Acompañamiento desde el aeropuerto",
    message: "El punto de encuentro, el traslado y el contacto responsable se confirman antes de la llegada.",
    Icon: PlaneTakeoff
  },
  {
    image: "/operations/equipo-johntoursperu.webp",
    eyebrow: "Equipo JohnToursPerú",
    title: "Personas que conocen la ruta",
    message: "Una muestra de nuestro equipo en destino para orientar al grupo durante la experiencia.",
    Icon: BadgeCheck
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

        <div className="operations-proof">
          <div className="operations-proof-intro">
            <span>Antes del primer recorrido</span>
            <h3>La experiencia también se construye en la coordinación</h3>
            <p>Aeropuerto y equipo de atención forman parte del archivo visual porque representan momentos reales del servicio, no destinos adicionales.</p>
          </div>
          <div className="operations-proof-grid">
            {OPERATIONAL_SUPPORT.map(({ Icon, ...item }) => (
              <article key={item.image} className="operations-proof-card">
                <img src={item.image} alt={item.title} loading="lazy" decoding="async" />
                <div><small><Icon size={15} /> {item.eyebrow}</small><strong>{item.title}</strong><p>{item.message}</p></div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
