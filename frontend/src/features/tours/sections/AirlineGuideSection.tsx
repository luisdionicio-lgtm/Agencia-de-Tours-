import { ArrowRight, CheckCircle2, Compass, ExternalLink, MapPin, Plane, PlaneTakeoff, ShieldCheck, Sparkles } from "lucide-react";
import { airlineRoutes } from "../config/airlineRoutes";
import { buildWhatsAppUrl } from "../config/contact";

export function AirlineGuideSection() {
  return (
    <section className="airline-guide px-4 py-16 lg:px-6" aria-labelledby="airline-guide-title">
      <div className="mx-auto max-w-7xl">
        <div className="airline-guide-heading">
          <div>
            <span className="airline-guide-kicker"><Sparkles size={16} /> Conexiones bien pensadas</span>
            <h2 id="airline-guide-title">El vuelo correcto para el objetivo de tu tour</h2>
            <p>Compara alternativas oficiales según el ritmo del itinerario, la comodidad de la conexión, el equipaje y el horario de llegada.</p>
          </div>
          <span className="airline-guide-trust"><ShieldCheck size={17} /> Enlaces oficiales</span>
        </div>

        <div className="airline-route-grid">
          {airlineRoutes.map((item) => (
            <article key={item.destination} className="airline-route-card">
              <div className="airline-route-title">
                <span aria-hidden="true"><PlaneTakeoff size={20} /></span>
                <div><small>{item.route}</small><h3>{item.destination}</h3></div>
              </div>
              <p className="airline-connection">{item.connection}</p>
              <div className="airline-objective">
                <span aria-hidden="true"><Compass size={18} /></span>
                <div><small>Objetivo de la conexión</small><strong>{item.objective}</strong></div>
              </div>
              <ul className="airline-decision-guide" aria-label={`Criterios para elegir vuelo hacia ${item.destination}`}>
                {item.decisionGuide.map((criterion) => <li key={criterion}><CheckCircle2 size={14} /> {criterion}</li>)}
              </ul>
              <div className="airline-links">
                {item.airlines.map((airline) => (
                  <a key={airline.name} data-airline={airline.brand} href={airline.href} target="_blank" rel="noopener noreferrer" aria-label={`Consultar ${airline.name} para ${item.destination} en su sitio oficial`}>
                    <span className="airline-logo-frame">
                      <img src={airline.logo} alt={`Logo de ${airline.name}`} loading="lazy" decoding="async" />
                    </span>
                    <span className="airline-link-copy"><small>Ideal para comparar</small><strong>{airline.name}</strong><span>{airline.idealFor}</span></span>
                    <span className="airline-link-terminal" aria-hidden="true"><ExternalLink size={15} /></span>
                  </a>
                ))}
              </div>
            </article>
          ))}
        </div>

        <div className="airline-land-note">
          <span><MapPin size={20} /></span>
          <div><strong>Ica y Oxapampa: conexión terrestre</strong><p>Nuestro asesor puede ayudarte a coordinar el traslado desde Lima como parte de la planificación del tour.</p></div>
          <a href={buildWhatsAppUrl("Hola JhonToursPerú, deseo orientación sobre vuelos y traslados para mi tour.")} target="_blank" rel="noopener noreferrer"><span>Consultar traslado</span><span className="airline-transfer-terminal"><ArrowRight size={16} /></span></a>
        </div>
        <p className="airline-disclaimer"><Plane size={14} /> JhonToursPerú no vende el boleto aéreo desde este bloque. Las rutas, tarifas y condiciones pertenecen a cada aerolínea y pueden cambiar; confirma siempre el precio final y los servicios incluidos en su web oficial.</p>
      </div>
    </section>
  );
}
