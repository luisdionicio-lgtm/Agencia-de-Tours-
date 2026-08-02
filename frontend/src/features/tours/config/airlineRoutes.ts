export type AirlineOption = {
  name: string;
  brand: string;
  logo: string;
  idealFor: string;
  href: string;
};

export type AirlineRouteGuide = {
  destination: string;
  route: string;
  connection: string;
  objective: string;
  decisionGuide: string[];
  airlines: AirlineOption[];
};

export const airlineRoutes: AirlineRouteGuide[] = [
  {
    destination: "Cusco · Machu Picchu",
    route: "Lima → Cusco",
    connection: "Vuelo directo · aproximadamente 1 h 20 min a 1 h 30 min",
    objective: "Llegar a Cusco con tiempo suficiente para el traslado, la orientación inicial y una aclimatación tranquila.",
    decisionGuide: ["Prioriza el horario de llegada", "Compara el equipaje incluido", "Deja margen antes del primer recorrido"],
    airlines: [
      { name: "LATAM", brand: "latam", logo: "/airlines/latam.svg", idealFor: "Mayor variedad de horarios y familias tarifarias", href: "https://www.latamairlines.com/pe/es/destinos/vuelos-desde-lima-a-cusco" },
      { name: "SKY", brand: "sky", logo: "/airlines/sky-airline.svg", idealFor: "Comparar una tarifa ligera en vuelo directo", href: "https://www.skyairline.com/flights/es-pe/vuelos-desde-lima-a-cusco" },
      { name: "JetSMART", brand: "jetsmart", logo: "/airlines/jetsmart.svg", idealFor: "Revisar una alternativa de precio base", href: "https://jetsmart.com/PE/es/" }
    ]
  },
  {
    destination: "Disney Orlando",
    route: "Lima → Orlando",
    connection: "Vuelo con conexión · duración sujeta al itinerario elegido",
    objective: "Elegir una conexión cómoda que reduzca el cansancio y permita iniciar el programa familiar con tranquilidad.",
    decisionGuide: ["Evalúa el tiempo total", "Evita escalas demasiado cortas", "Confirma maletas y selección de asiento"],
    airlines: [
      { name: "Copa Airlines", brand: "copa", logo: "/airlines/copa-airlines.png", idealFor: "Comparar conexión internacional vía Panamá", href: "https://www.copaair.com/en/flights-from-lima-to-orlando?redirecturl=true" },
      { name: "Avianca", brand: "avianca", logo: "/airlines/avianca.svg", idealFor: "Revisar otra combinación oficial hacia Orlando", href: "https://www.avianca.com/us/es/vuelos-desde-lima-a-orlando" }
    ]
  },
  {
    destination: "Egipto · El Cairo",
    route: "Lima → El Cairo",
    connection: "Ruta de larga distancia · una o más conexiones",
    objective: "Equilibrar duración, descanso y equipaje para llegar en buenas condiciones al inicio del circuito cultural.",
    decisionGuide: ["Compara horas y escalas", "Revisa requisitos de tránsito", "Prioriza equipaje y flexibilidad"],
    airlines: [
      { name: "Iberia", brand: "iberia", logo: "/airlines/iberia.svg", idealFor: "Buscar la ruta oficial Lima–El Cairo", href: "https://www.iberia.com/pe/vuelos-baratos/Lima-El-Cairo/" },
      { name: "Turkish Airlines", brand: "turkish", logo: "/airlines/turkish-airlines.svg", idealFor: "Comparar una conexión internacional vía Estambul", href: "https://www.turkishairlines.com/es-int/flights/flights-to-cairo/" }
    ]
  }
];
