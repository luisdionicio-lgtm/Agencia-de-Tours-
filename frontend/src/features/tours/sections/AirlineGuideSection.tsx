import { ArrowRight, ExternalLink, MapPin, Plane, PlaneTakeoff, ShieldCheck } from "lucide-react";
import { buildWhatsAppUrl } from "../config/contact";

const airlineRoutes = [
  {
    destination: "Cusco · Machu Picchu",
    route: "Lima → Cusco",
    detail: "Vuelo directo · compara horarios y equipaje incluido",
    links: [
      { name: "LATAM", brand: "latam", logo: "/airlines/latam.svg", note: "Más horarios para comparar", href: "https://www.latamairlines.com/pe/es/destinos/vuelos-desde-lima-a-cusco" },
      { name: "SKY", brand: "sky", logo: "/airlines/sky-airline.svg", note: "Alternativa de tarifa ligera", href: "https://www.skyairline.com/flights/es-pe/vuelos-desde-lima-a-cusco" },
      { name: "JetSMART", brand: "jetsmart", logo: "/airlines/jetsmart.svg", note: "Opción de bajo costo", href: "https://jetsmart.com/PE/es/" }
    ]
  },
  {
    destination: "Disney Orlando",
    route: "Lima → Orlando",
    detail: "Vuelo con conexión · revisa duración total y escalas",
    links: [
      { name: "Copa Airlines", brand: "copa", logo: "/airlines/copa-airlines.png", note: "Conexión internacional", href: "https://www.copaair.com/en/flights-from-lima-to-orlando?redirecturl=true" },
      { name: "Avianca", brand: "avianca", logo: "/airlines/avianca.svg", note: "Otra opción para comparar", href: "https://www.avianca.com/us/es/vuelos-desde-lima-a-orlando" }
    ]
  },
  {
    destination: "Egipto · El Cairo",
    route: "Lima → El Cairo",
    detail: "Ruta de larga distancia · compara tiempo y equipaje",
    links: [
      { name: "Iberia", brand: "iberia", logo: "/airlines/iberia.svg", note: "Búsqueda oficial desde Lima", href: "https://www.iberia.com/pe/vuelos-baratos/Lima-El-Cairo/" },
      { name: "Turkish Airlines", brand: "turkish", logo: "/airlines/turkish-airlines.svg", note: "Conexión vía Estambul", href: "https://www.turkishairlines.com/es-int/flights/flights-to-cairo/" }
    ]
  }
];

export function AirlineGuideSection() {
  return (
    <section className="airline-guide px-4 py-16 lg:px-6" aria-labelledby="airline-guide-title">
      <div className="mx-auto max-w-7xl">
        <div className="airline-guide-heading">
          <div>
            <span className="airline-guide-kicker"><Plane size={16} /> Planifica tu vuelo</span>
            <h2 id="airline-guide-title">Aerolíneas para comparar por destino</h2>
            <p>Accede a canales oficiales y elige por precio final, horarios, equipaje y duración del viaje.</p>
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
              <p>{item.detail}</p>
              <div className="airline-links">
                {item.links.map((airline) => (
                  <a key={airline.name} data-airline={airline.brand} href={airline.href} target="_blank" rel="noopener noreferrer" aria-label={`Consultar ${airline.name} para ${item.destination} en su sitio oficial`}>
                    <span className="airline-logo-frame">
                      <img src={airline.logo} alt={`Logo de ${airline.name}`} loading="lazy" decoding="async" />
                    </span>
                    <span className="airline-link-copy"><strong>{airline.name}</strong><small>{airline.note}</small></span>
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
        <p className="airline-disclaimer">Las rutas, tarifas y condiciones pertenecen a cada aerolínea y pueden cambiar. Antes de pagar, verifica el precio final y los servicios incluidos en su web oficial.</p>
      </div>
    </section>
  );
}
