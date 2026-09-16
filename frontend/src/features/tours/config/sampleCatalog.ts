import type { Tour, Reservation, Payment } from "../../../shared/types";
import type { TourDeparture } from "../lib/presentation";
import { itineraryCatalog } from "./itineraryCatalog";

const demoDepartures = (_tourId: number, items: [number, string, string, number, number][]): TourDeparture[] =>
  items.map(([id, startDate, endDate, capacity, availableSlots]) => ({ id, startDate, endDate, capacity, availableSlots, status: "ACTIVO" }));

export const demoTours: Tour[] = [
  {
    id: 1,
    title: "Cusco, Puno y Arequipa",
    slug: "machu-picchu",
    destination: "Sur del Perú",
    description: "Circuito integrado por Cusco, Machu Picchu, el lago Titicaca en Puno y el patrimonio histórico de Arequipa, con traslados y asistencia coordinados.",
    price: 2480,
    priceIsEstimated: true,
    currency: "PEN",
    duration: "7 días / 6 noches",
    type: "NACIONAL",
    availableSlots: 0,
    imageUrl: "/destinations/machu-picchu.webp",
    isFeatured: true,
    status: "ACTIVO",
    itinerary: [
      "Día 1: llegada a Cusco, aclimatación y circuito arqueológico de Sacsayhuamán.",
      "Día 2: Valle Sagrado con Pisac, Urubamba, Ollantaytambo y Chinchero.",
      "Día 3: viaje en tren, bus e ingreso programado a Machu Picchu con guiado y retorno asistido.",
      "Día 4: Valle Sur y salida nocturna hacia Puno.",
      "Día 5: navegación por el lago Titicaca, islas de los Uros y circuito cultural en Chucuito.",
      "Día 6: Chullpas de Sillustani y traslado nocturno hacia Arequipa.",
      "Día 7: Yanahuara, centro histórico de Arequipa y retorno coordinado."
    ],
    includes: ["Vuelos nacionales indicados en la propuesta", "Alojamiento seleccionado", "Alimentación y accesos señalados en el programa", "Traslados, guiado y asistencia de JohnToursPerú"],
    excludes: ["Servicios no detallados en la cotización final", "Actividades opcionales", "Gastos personales"],
    departures: demoDepartures(1, [[101, "2026-09-12", "2026-09-18", 20, 20], [102, "2026-10-10", "2026-10-16", 20, 20]])
  },
  {
    id: 2,
    title: "Guayaquil y costa ecuatoriana",
    slug: "guayaquil-costa-ecuador",
    destination: "Guayaquil, Ecuador",
    description: "Descubre Guayaquil y una experiencia costera con recorridos urbanos, paisajes frente al mar y actividades coordinadas.",
    price: 198,
    priceIsEstimated: true,
    currency: "USD",
    duration: "3 días / 2 noches",
    type: "INTERNACIONAL",
    availableSlots: 0,
    imageUrl: "/destinations/ecuador-costa.webp",
    isFeatured: true,
    status: "ACTIVO",
    itinerary: [
      "Traslado desde la frontera, llegada a Guayaquil, cena e instalación en el alojamiento.",
      "Full day por Cerro Santa Ana, Las Peñas, teleférico, río Guayas, Parque de las Iguanas y Malecón 2000.",
      "Desayuno y retorno coordinado por la frontera Ecuador–Perú."
    ],
    includes: ["Alojamiento seleccionado por 2 noches", "Traslado fronterizo indicado", "Recorrido urbano confirmado", "Asistencia de JohnToursPerú"],
    excludes: ["Transporte hasta la frontera", "Actividades no confirmadas", "Alimentación y gastos personales no detallados"],
    departures: demoDepartures(2, [[201, "2026-10-02", "2026-10-04", 20, 20], [202, "2026-11-13", "2026-11-15", 20, 20]])
  },
  {
    id: 3,
    title: "Oxapampa y Pozuzo",
    slug: "oxapampa-pozuzo",
    destination: "Pasco, Perú",
    description: "Naturaleza, cataratas, café y tradición austroalemana en una ruta auténtica por Oxapampa y Pozuzo.",
    price: 780,
    priceIsEstimated: true,
    currency: "PEN",
    duration: "4 días / 3 noches",
    type: "NACIONAL",
    availableSlots: 0,
    imageUrl: "/tour-galleries/pozuzo/comunidad-local.webp",
    isFeatured: true,
    status: "ACTIVO",
    itinerary: [
      "Salida coordinada hacia Oxapampa, recepción local e instalación en el alojamiento.",
      "Recorrido natural por cataratas y espacios vinculados al café, sujeto a condiciones locales.",
      "Ruta hacia Pozuzo y visita cultural a sus principales espacios de tradición austroalemana.",
      "Desayuno, tiempo para compras locales y retorno coordinado."
    ],
    includes: ["Alojamiento seleccionado por 3 noches", "Movilidad turística durante los recorridos indicados", "Guía local", "Asistencia de JohnToursPerú"],
    excludes: ["Transporte no indicado en el programa", "Alimentación no especificada", "Actividades opcionales y gastos personales"],
    departures: demoDepartures(3, [[301, "2026-09-18", "2026-09-21", 20, 20], [302, "2026-10-23", "2026-10-26", 20, 20]])
  },
  {
    id: 4,
    title: "Ica y Huacachina",
    slug: "ica-y-huacachina",
    destination: "Ica, Perú",
    description: "Dunas, tubulares, sandboard, bodegas pisqueras y atardeceres inolvidables en el oasis.",
    price: 650,
    priceIsEstimated: true,
    currency: "PEN",
    duration: "2 días / 1 noche",
    type: "NACIONAL",
    availableSlots: 0,
    imageUrl: "/destinations/ica-huacachina.webp",
    isFeatured: true,
    status: "ACTIVO",
    itinerary: [
      "Salida hacia Ica, recepción, visita referencial a una bodega seleccionada y recorrido por Huacachina al atardecer.",
      "Experiencia programada en las dunas, tiempo libre en el oasis y retorno coordinado al punto acordado."
    ],
    includes: ["Alojamiento seleccionado por 1 noche", "Movilidad turística para las visitas indicadas", "Coordinación de actividades", "Asistencia de JohnToursPerú"],
    excludes: ["Alimentación no detallada", "Actividades adicionales no indicadas", "Gastos personales"],
    departures: demoDepartures(4, [[401, "2026-09-05", "2026-09-06", 20, 20], [402, "2026-10-03", "2026-10-04", 20, 20]])
  },
  {
    id: 5,
    title: "Tarapoto y naturaleza amazónica",
    slug: "tarapoto-naturaleza",
    destination: "San Martín, Perú",
    description: "Paisajes amazónicos, recorridos acuáticos y experiencias de naturaleza en una ruta coordinada desde Tarapoto.",
    price: 1890,
    priceIsEstimated: true,
    currency: "PEN",
    duration: "5 días / 4 noches",
    type: "NACIONAL",
    availableSlots: 0,
    imageUrl: "/destinations/tarapoto.webp",
    isFeatured: true,
    status: "ACTIVO",
    itinerary: [
      "Llegada a Tarapoto, recepción, traslado y recorrido cultural por Lamas.",
      "Full day en la Laguna Azul del Sauce.",
      "Ruta por Rioja y Moyobamba con experiencias naturales confirmadas.",
      "Catarata de Ahuashiyacu y retorno a Tarapoto.",
      "Huacamaillo o Pishurayacu según el clima, y traslado coordinado de salida."
    ],
    includes: ["Vuelo Lima–Tarapoto–Lima según cotización", "Alojamiento seleccionado por 4 noches", "Alimentación y recorridos indicados", "Asistencia de JohnToursPerú"],
    excludes: ["Actividades no indicadas en la cotización", "Servicios opcionales", "Gastos personales"],
    departures: demoDepartures(5, [[501, "2026-09-25", "2026-09-29", 20, 20], [502, "2026-11-06", "2026-11-10", 20, 20]])
  },
  {
    id: 6,
    title: "Sueños de Europa: cuatro países",
    slug: "europa-esencial-madrid-paris-roma",
    destination: "España, Francia, Suiza e Italia",
    description: "Circuito europeo por Madrid, París, Zúrich, Venecia, Florencia, Roma, Costa Azul y Barcelona.",
    price: 4780,
    priceIsEstimated: true,
    currency: "USD",
    duration: "17 días / 15 noches",
    type: "INTERNACIONAL",
    availableSlots: 0,
    imageUrl: "/destinations/europa-esencial.webp",
    imageCredit: "Imagen referencial de Unsplash",
    isFeatured: false,
    status: "ACTIVO",
    itinerary: itineraryCatalog.find((item) => item.id === "suenos-europa")?.days,
    includes: ["Vuelo Lima–Madrid–Lima según cotización", "Alojamiento y desayunos señalados", "Circuito y traslados descritos en el programa", "Tarjeta de asistencia y acompañamiento de JohnToursPerú"],
    excludes: ["Vuelos internacionales salvo indicación expresa", "Entradas, alimentación o equipaje no detallados", "Visados, seguros y gastos personales"],
    departures: demoDepartures(6, [[601, "2027-04-12", "2027-04-28", 20, 20], [602, "2027-06-07", "2027-06-23", 20, 20]])
  },
  {
    id: 7,
    title: "Italia clásica: Roma, Florencia y Venecia",
    slug: "italia-clasica-roma-florencia-venecia",
    destination: "Italia",
    description: "Propuesta cultural por Roma, Florencia y Venecia con conexiones planificadas y tiempo para conocer cada ciudad con tranquilidad.",
    price: 2490,
    priceIsEstimated: true,
    currency: "USD",
    duration: "9 días / 8 noches",
    type: "INTERNACIONAL",
    availableSlots: 0,
    imageUrl: "/destinations/italia-clasica.webp",
    imageCredit: "Imagen referencial de Unsplash",
    isFeatured: false,
    status: "ACTIVO",
    itinerary: [
      "Llegada a Roma, recepción y orientación del recorrido italiano.",
      "Visita panorámica de la Roma histórica y sus espacios monumentales.",
      "Jornada cultural vinculada al Vaticano y tiempo libre asistido.",
      "Traslado a Florencia e ingreso al alojamiento.",
      "Recorrido por el centro histórico de Florencia y espacios artísticos seleccionados.",
      "Traslado a Venecia con acompañamiento logístico.",
      "Recorrido por plazas, canales y barrios históricos de Venecia.",
      "Día libre para actividades opcionales confirmadas previamente.",
      "Traslado coordinado para el retorno."
    ],
    includes: ["Alojamiento seleccionado por 8 noches", "Conexiones terrestres o ferroviarias indicadas", "Recorridos coordinados", "Asistencia de JohnToursPerú"],
    excludes: ["Vuelos internacionales", "Entradas no detalladas", "Tasas locales, alimentación, seguro y gastos personales"],
    departures: demoDepartures(7, [[701, "2027-05-03", "2027-05-11", 20, 20], [702, "2027-09-13", "2027-09-21", 20, 20]])
  },
  {
    id: 8,
    title: "España y Portugal: Madrid, Barcelona y Lisboa",
    slug: "espana-portugal-madrid-barcelona-lisboa",
    destination: "España y Portugal",
    description: "Circuito demostrativo por ciudades ibéricas que combina arquitectura, cultura, gastronomía y recorridos urbanos con asistencia coordinada.",
    price: 2390,
    priceIsEstimated: true,
    currency: "USD",
    duration: "10 días / 9 noches",
    type: "INTERNACIONAL",
    availableSlots: 0,
    imageUrl: "/destinations/espana-portugal.webp",
    imageCredit: "Imagen referencial de Unsplash",
    isFeatured: false,
    status: "ACTIVO",
    itinerary: [
      "Llegada a Madrid, recepción coordinada e introducción al programa.",
      "Recorrido por el centro histórico y espacios culturales de Madrid.",
      "Día flexible para una experiencia adicional previamente confirmada.",
      "Traslado a Barcelona e ingreso al alojamiento.",
      "Circuito urbano por los principales espacios arquitectónicos de Barcelona.",
      "Jornada libre asistida para actividades personales.",
      "Traslado a Lisboa y orientación de la etapa portuguesa.",
      "Recorrido por barrios históricos y miradores de Lisboa.",
      "Día para una visita opcional coordinada según el programa final.",
      "Traslado al aeropuerto y retorno."
    ],
    includes: ["Alojamiento seleccionado por 9 noches", "Conexiones indicadas entre ciudades", "Recorridos descritos en la propuesta", "Asistencia de JohnToursPerú"],
    excludes: ["Vuelos internacionales", "Entradas y alimentación no especificadas", "Visados, seguro, tasas y gastos personales"],
    departures: demoDepartures(8, [[801, "2027-04-19", "2027-04-28", 20, 20], [802, "2027-10-04", "2027-10-13", 20, 20]])
  },
  {
    id: 9,
    title: "Lago Titicaca y ruta Bolivia",
    slug: "lago-titicaca-ruta-bolivia",
    destination: "Puno, Perú y Bolivia",
    description: "Circuito demostrativo por el lago navegable más alto del mundo, comunidades del altiplano y una extensión cultural hacia Bolivia.",
    price: 480,
    priceIsEstimated: true,
    currency: "USD",
    duration: "5 días / 4 noches",
    type: "INTERNACIONAL",
    availableSlots: 0,
    imageUrl: "/travel-archive/lago-titicaca.webp",
    isFeatured: false,
    status: "ACTIVO",
    itinerary: [
      "Llegada a Puno, recepción coordinada, instalación y orientación para la experiencia en altura.",
      "Navegación programada por el lago Titicaca y visita cultural según el circuito confirmado.",
      "Traslado terrestre hacia la frontera y continuación de la ruta boliviana con asistencia.",
      "Recorrido cultural y paisajístico por los puntos incluidos en la propuesta final.",
      "Retorno coordinado a Puno y conexión con el transporte de regreso."
    ],
    includes: ["Alojamiento seleccionado por 4 noches", "Traslados terrestres indicados", "Recorrido lacustre confirmado", "Asistencia de JohnToursPerú"],
    excludes: ["Transporte hasta Puno", "Tasas migratorias o requisitos documentarios", "Alimentación y actividades no detalladas", "Gastos personales"],
    departures: demoDepartures(9, [[901, "2026-10-15", "2026-10-19", 20, 20], [902, "2027-03-18", "2027-03-22", 20, 20]])
  },
  {
    id: 10, title: "Máncora, Punta Sal y Tumbes", slug: "mancora-punta-sal-tumbes", destination: "Piura y Tumbes, Perú",
    description: "Costa norte, atardeceres frente al mar, experiencia marina en Ñuro y recorrido por los manglares de Tumbes.",
    price: 1700, priceIsEstimated: true, currency: "PEN", duration: "5 días / 4 noches", type: "NACIONAL", availableSlots: 0,
    imageUrl: "/destinations/mancora-tumbes.webp", imageCredit: "Imagen referencial: AlCortés · CC BY 2.0 · Wikimedia Commons", isFeatured: true, status: "ACTIVO",
    itinerary: itineraryCatalog.find((item) => item.id === "norte-peru")?.days,
    includes: ["Alojamiento seleccionado por 4 noches", "Traslados en destino indicados", "Recorridos confirmados", "Asistencia de JohnToursPerú"],
    excludes: ["Vuelos o transporte hasta Piura/Tumbes", "Actividades marinas no confirmadas", "Alimentación y gastos personales"],
    departures: demoDepartures(10, [[1001, "2026-10-22", "2026-10-26", 20, 20], [1002, "2027-02-18", "2027-02-22", 20, 20]])
  },
  {
    id: 11, title: "Cartagena e islas del Caribe", slug: "cartagena-islas-caribe", destination: "Cartagena, Colombia",
    description: "Historia caribeña, ciudad amurallada y jornadas de playa entre Islas del Rosario y Barú.",
    price: 1400, priceIsEstimated: true, currency: "USD", duration: "5 días / 4 noches", type: "INTERNACIONAL", availableSlots: 0,
    imageUrl: "/destinations/cartagena-colombia.webp", imageCredit: "Imagen referencial: Laslovarga · CC BY-SA 4.0 · Wikimedia Commons", isFeatured: true, status: "ACTIVO",
    itinerary: itineraryCatalog.find((item) => item.id === "cartagena")?.days,
    includes: ["Alojamiento seleccionado por 4 noches", "Traslados indicados en el programa", "Excursiones confirmadas", "Asistencia de JohnToursPerú"],
    excludes: ["Vuelos internacionales salvo indicación", "Impuestos o entradas no detallados", "Alimentación y gastos personales"],
    departures: demoDepartures(11, [[1101, "2026-11-05", "2026-11-09", 20, 20], [1102, "2027-03-11", "2027-03-15", 20, 20]])
  },
  {
    id: 12, title: "Río de Janeiro esencial", slug: "rio-de-janeiro", destination: "Río de Janeiro, Brasil",
    description: "Panorámicas de Río, Pan de Azúcar, patrimonio de Petrópolis y tiempo libre acompañado.",
    price: 1690, priceIsEstimated: true, currency: "USD", duration: "6 días / 5 noches", type: "INTERNACIONAL", availableSlots: 0,
    imageUrl: "/destinations/rio-janeiro.webp", imageCredit: "Imagen referencial: Arne Müseler · CC BY-SA 3.0 · Wikimedia Commons", isFeatured: true, status: "ACTIVO",
    itinerary: itineraryCatalog.find((item) => item.id === "rio")?.days,
    includes: ["Alojamiento seleccionado por 5 noches", "Traslados indicados", "Recorridos panorámicos confirmados", "Asistencia de JohnToursPerú"],
    excludes: ["Vuelos internacionales salvo indicación", "Entradas o excursiones opcionales", "Alimentación y gastos personales"],
    departures: demoDepartures(12, [[1201, "2027-02-08", "2027-02-13", 20, 20], [1202, "2027-05-17", "2027-05-22", 20, 20]])
  },
  {
    id: 13, title: "Buenos Aires e Iguazú", slug: "buenos-aires-iguazu", destination: "Argentina y Brasil",
    description: "Buenos Aires, Tigre y las Cataratas de Iguazú vistas desde ambos lados de la frontera.",
    price: 1600, priceIsEstimated: true, currency: "USD", duration: "10 días / 9 noches", type: "INTERNACIONAL", availableSlots: 0,
    imageUrl: "/destinations/iguazu-argentina.webp", imageCredit: "Imagen referencial: Horacio Cambeiro · CC BY 4.0 · Wikimedia Commons", isFeatured: true, status: "ACTIVO",
    itinerary: itineraryCatalog.find((item) => item.id === "iguazu")?.days,
    includes: ["Vuelos y equipaje señalados en la cotización", "Alojamiento seleccionado por 9 noches", "Visitas confirmadas en Buenos Aires e Iguazú", "Asistencia de JohnToursPerú"],
    excludes: ["Vuelos salvo indicación expresa", "Requisitos migratorios y seguros", "Alimentación, opcionales y gastos personales"],
    departures: demoDepartures(13, [[1301, "2027-04-05", "2027-04-14", 20, 20], [1302, "2027-08-09", "2027-08-18", 20, 20]])
  },
  {
    id: 14, title: "Punta Cana y Santo Domingo", slug: "punta-cana-santo-domingo", destination: "República Dominicana",
    description: "Playas del Caribe, Isla Saona, Isla Catalina y la historia colonial de Santo Domingo.",
    price: 1570, priceIsEstimated: true, currency: "USD", duration: "6 días / 5 noches", type: "INTERNACIONAL", availableSlots: 0,
    imageUrl: "/destinations/punta-cana.webp", imageCredit: "Imagen referencial: NoonIcarus · CC BY-SA 3.0 · Wikimedia Commons", isFeatured: true, status: "ACTIVO",
    itinerary: itineraryCatalog.find((item) => item.id === "punta-cana")?.days,
    includes: ["Vuelos y equipaje según cotización", "Alojamiento seleccionado por 5 noches", "Alimentación y excursiones confirmadas", "Asistencia de JohnToursPerú"],
    excludes: ["Vuelos internacionales salvo indicación", "Actividades opcionales", "Tasas, alimentación y gastos personales"],
    departures: demoDepartures(14, [[1401, "2027-01-21", "2027-01-26", 20, 20], [1402, "2027-06-10", "2027-06-15", 20, 20]])
  },
  {
    id: 15, title: "Disney y Orlando", slug: "disney-orlando", destination: "Orlando y Miami, Estados Unidos",
    description: "Programa familiar demostrativo con Miami, Magic Kingdom, Epcot y Universal Studios.",
    price: 3730, priceIsEstimated: true, currency: "USD", duration: "7 días / 6 noches", type: "INTERNACIONAL", availableSlots: 0,
    imageUrl: "/destinations/orlando-parques.webp", imageCredit: "Imagen referencial: Jedi94 · CC BY-SA 4.0 · Wikimedia Commons", isFeatured: true, status: "ACTIVO",
    itinerary: itineraryCatalog.find((item) => item.id === "disney")?.days,
    includes: ["Vuelos y equipaje según cotización", "Alojamiento seleccionado por 6 noches", "Entradas a parques confirmadas", "Traslados y asistencia de JohnToursPerú"],
    excludes: ["Vuelos, visa y seguro salvo indicación", "Entradas a parques no confirmadas", "Alimentación, equipaje y gastos personales"],
    departures: demoDepartures(15, [[1501, "2027-03-15", "2027-03-21", 20, 20], [1502, "2027-07-12", "2027-07-18", 20, 20]])
  },
  {
    id: 16, title: "Cusco, Ica y Lima 2027", slug: "cusco-ica-lima-2027", destination: "Cusco, Ica y Lima, Perú",
    description: "Ruta privada por la historia inca, Machu Picchu, la Montaña de Siete Colores, Lima histórica, Paracas y Huacachina.",
    price: 1428, priceIsEstimated: true, currency: "USD", duration: "9 días / 8 noches", type: "NACIONAL", availableSlots: 0,
    imageUrl: "/destinations/ica-huacachina.webp", isFeatured: false, status: "ACTIVO",
    itinerary: itineraryCatalog.find((item) => item.id === "cusco-ica-lima")?.days,
    includes: ["Vuelos Lima–Cusco–Lima según cotización", "Alojamiento y desayunos señalados", "Traslados, accesos y excursiones indicadas", "Asistencia de JohnToursPerú"],
    excludes: ["Vuelos internacionales", "Actividades opcionales", "Servicios no detallados y gastos personales"],
    departures: demoDepartures(16, [[1601, "2027-05-03", "2027-05-11", 20, 20], [1602, "2027-09-06", "2027-09-14", 20, 20]])
  },
  {
    id: 17, title: "Punta Sal y norte cultural", slug: "punta-sal-norte-cultural", destination: "Tumbes, Piura y Chiclayo, Perú",
    description: "Playa y descanso en Punta Sal, manglares de Puerto Pizarro, Máncora, Ñuro y el patrimonio cultural de Chiclayo.",
    price: 2890, priceIsEstimated: true, currency: "PEN", duration: "6 días / 5 noches", type: "NACIONAL", availableSlots: 0,
    imageUrl: "/destinations/punta-sal-resort.webp", imageCredit: "Imagen referencial: DIOHER_PAVAL · CC BY 3.0 · Wikimedia Commons", isFeatured: false, status: "ACTIVO",
    itinerary: itineraryCatalog.find((item) => item.id === "punta-sal-cultural")?.days,
    includes: ["Vuelos nacionales indicados", "Alojamiento confirmado en Punta Sal y norte", "Alimentación, traslados y recorridos señalados", "Asistencia de JohnToursPerú"],
    excludes: ["Servicios del resort no incluidos en la tarifa final", "Actividades marinas opcionales", "Gastos personales"],
    departures: demoDepartures(17, [[1701, "2026-10-15", "2026-10-20", 20, 20], [1702, "2027-02-11", "2027-02-16", 20, 20]])
  }
];

export const demoReservation: Reservation = {
  id: 2026001,
  isDemo: true,
  travelDate: "2026-08-15",
  peopleCount: 2,
  totalAmount: 3100,
  status: "PENDIENTE",
  customer: { fullName: "Cliente de demostración", email: "cliente.demo@example.com", phone: "999 999 999" },
  tour: demoTours[0]
};

export const demoPayment: Payment = {
  id: 5001,
  status: "PENDIENTE",
  paymentMethod: "YAPE",
  amount: 200,
  externalReference: "JT-DEMO-2026",
  paidAt: "2026-07-27T10:30:00-05:00",
  proof: { id: 1, fileName: "comprobante-yape-demo.png", mimeType: "image/png", sizeBytes: 245000, createdAt: "2026-07-27T10:31:00-05:00" },
  audits: [{ id: 1, action: "SUBMITTED", createdAt: "2026-07-27T10:31:00-05:00" }],
  reservation: demoReservation
};

