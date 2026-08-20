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
    destination: "Cusco · Puno · Arequipa",
    route: "Lima → Cusco · circuito terrestre · Arequipa → Lima",
    connection: "Entrada por Cusco y retorno desde Arequipa, sujetos a la propuesta final",
    objective: "Coordinar un itinerario multidestino que evite retrocesos y permita una aclimatación tranquila antes de continuar hacia Puno y Arequipa.",
    decisionGuide: ["Compara un viaje multidestino", "Revisa el equipaje incluido", "Confirma el retorno desde Arequipa"],
    airlines: [
      { name: "LATAM", brand: "latam", logo: "/airlines/latam.svg", idealFor: "Mayor variedad de horarios y familias tarifarias", href: "https://www.latamairlines.com/pe/es/destinos/vuelos-desde-lima-a-cusco" },
      { name: "SKY", brand: "sky", logo: "/airlines/sky-airline.svg", idealFor: "Comparar una tarifa ligera en vuelo directo", href: "https://www.skyairline.com/flights/es-pe/vuelos-desde-lima-a-cusco" },
      { name: "JetSMART", brand: "jetsmart", logo: "/airlines/jetsmart.svg", idealFor: "Revisar una alternativa de precio base", href: "https://jetsmart.com/PE/es/" }
    ]
  },
  {
    destination: "Tarapoto · naturaleza amazónica",
    route: "Lima → Tarapoto",
    connection: "Vuelo nacional · aproximadamente 1 h 25 min en ruta directa",
    objective: "Llegar durante el día para coordinar el traslado y comenzar la experiencia amazónica con tranquilidad.",
    decisionGuide: ["Compara el horario de llegada", "Revisa el equipaje incluido", "Confirma cambios y flexibilidad"],
    airlines: [
      { name: "LATAM", brand: "latam", logo: "/airlines/latam.svg", idealFor: "Comparar horarios y familias tarifarias", href: "https://www.latamairlines.com/pe/es/destinos/vuelos-a-tarapoto" },
      { name: "SKY", brand: "sky", logo: "/airlines/sky-airline.svg", idealFor: "Revisar disponibilidad y tarifa ligera", href: "https://www.skyairline.com/flights/es-pe" },
      { name: "JetSMART", brand: "jetsmart", logo: "/airlines/jetsmart.svg", idealFor: "Comparar precio base y servicios adicionales", href: "https://jetsmart.com/PE/es/" }
    ]
  },
  {
    destination: "Guayaquil · costa ecuatoriana",
    route: "Lima → Guayaquil",
    connection: "Vuelo internacional · directo o con conexión según fecha y aerolínea",
    objective: "Elegir un horario que facilite migraciones, traslado al alojamiento y el inicio ordenado del programa.",
    decisionGuide: ["Confirma si la ruta es directa", "Revisa requisitos migratorios", "Compara equipaje y horario final"],
    airlines: [
      { name: "LATAM", brand: "latam", logo: "/airlines/latam.svg", idealFor: "Comparar la ruta Lima–Guayaquil y sus condiciones", href: "https://www.latamairlines.com/pe/es/destinos/ecuador" },
      { name: "Avianca", brand: "avianca", logo: "/airlines/avianca.svg", idealFor: "Revisar horarios, escalas y tarifa final", href: "https://www.avianca.com/es_us/vuelos-desde-lima-a-guayaquil" }
    ]
  }
];
