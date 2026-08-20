import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowRight, Award, CalendarDays, CheckCircle2, ChevronDown, Clock3, Copy, Download, FileText, Filter, HeartHandshake, LayoutDashboard, LogOut, MapPin, MessageCircle, Plane, PlayCircle, Search, ShieldCheck, Sparkles, Star, UsersRound } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { api } from "../../infrastructure/api/client";
import { Link, Route, Routes, useNavigate, useParams, useSearchParams } from "../../core/routing";
import type { BusinessSettings, Payment, Reservation, Tour, TourStatus, TourType } from "../../shared/types";
import { SiteShell } from "./components/SiteShell";
import { TourCard } from "./components/TourCard";
import { buildWhatsAppUrl, demoStaffAccounts, isDemoMode, reservationAmount, socialLinks, whatsappMessages } from "./config/contact";
import { itineraryCatalog, itineraryVariantsFor, type ItineraryVariant } from "./config/itineraryCatalog";
import { destinationImage, paymentMoney, reservationCode, tourCurrency, tourMoney, type TourDeparture } from "./lib/presentation";
import { downloadReservationReceipt } from "./lib/reservationReceipt";
import { AirlineGuideSection } from "./sections/AirlineGuideSection";
import { DestinationCarousel } from "./components/DestinationCarousel";
import { ExperienceProofSection } from "./components/ExperienceProofSection";
import { PromotionsShowcase } from "./components/PromotionsShowcase";
import { TravelArchiveShowcase } from "./components/TravelArchiveShowcase";
import { HowItWorksSection } from "./sections/HowItWorksSection";

const demoDepartures = (_tourId: number, items: [number, string, string, number, number][]): TourDeparture[] =>
  items.map(([id, startDate, endDate, capacity, availableSlots]) => ({ id, startDate, endDate, capacity, availableSlots, status: "ACTIVO" }));

const demoTours: Tour[] = [
  {
    id: 1,
    title: "Machu Picchu",
    slug: "machu-picchu",
    destination: "Cusco, Perú",
    description: "Explora la ciudadela inca, el Valle Sagrado y la riqueza cultural de Cusco con guías expertos y asistencia permanente.",
    price: 1550,
    priceIsEstimated: true,
    currency: "PEN",
    duration: "5 días / 4 noches",
    type: "NACIONAL",
    availableSlots: 0,
    imageUrl: "/destinations/machu-picchu.webp",
    imageCredit: "Archivo propio de JohnToursPerú",
    isFeatured: true,
    status: "ACTIVO",
    itinerary: [
      "Día 1: llegada a Cusco, recepción, traslado al hotel, aclimatación y circuito por Sacsayhuamán, Cristo Blanco, Qenqo, Tambomachay y Puca Pucara.",
      "Día 2: Valle Sagrado de los Incas con visita a Pisac, almuerzo en Urubamba, complejo arqueológico de Ollantaytambo y parada en Chinchero antes de volver a Cusco.",
      "Día 3: salida temprana hacia Ollantaytambo, viaje en tren a Aguas Calientes, traslado en bus e ingreso guiado a Machu Picchu según el circuito y horario confirmados; retorno asistido a Cusco.",
      "Día 4: recorrido por Maras, terrazas agrícolas de Moray y Salineras; actividades opcionales se confirman en la propuesta final.",
      "Día 5: desayuno, tiempo libre según el horario del vuelo y traslado coordinado al aeropuerto para el retorno."
    ],
    includes: ["Alojamiento seleccionado por 4 noches", "Traslados indicados en el programa", "Guiado profesional en los recorridos señalados", "Asistencia de JohnToursPerú durante el viaje"],
    excludes: ["Vuelos o transporte hasta Cusco, salvo indicación expresa", "Alimentación no detallada en el programa", "Gastos personales y servicios opcionales"],
    departures: demoDepartures(1, [[101, "2026-09-12", "2026-09-16", 20, 20], [102, "2026-10-10", "2026-10-14", 20, 20]])
  },
  {
    id: 2,
    title: "Guayaquil y costa ecuatoriana",
    slug: "guayaquil-costa-ecuador",
    destination: "Guayaquil, Ecuador",
    description: "Descubre Guayaquil y una experiencia costera con recorridos urbanos, paisajes frente al mar y actividades coordinadas.",
    price: 890,
    priceIsEstimated: true,
    currency: "USD",
    duration: "5 días / 4 noches",
    type: "INTERNACIONAL",
    availableSlots: 0,
    imageUrl: "/destinations/ecuador-costa.webp",
    imageCredit: "Fotografía propia de La Perla, Guayaquil",
    isFeatured: true,
    status: "ACTIVO",
    itinerary: [
      "Llegada a Guayaquil, recepción coordinada, traslado al alojamiento y presentación del programa.",
      "Recorrido por los principales espacios urbanos y culturales de Guayaquil.",
      "Traslado hacia la zona costera y actividades recreativas previamente confirmadas.",
      "Jornada libre o experiencia adicional según la propuesta final del grupo.",
      "Salida del alojamiento y traslado coordinado al aeropuerto para el retorno."
    ],
    includes: ["Alojamiento seleccionado por 4 noches", "Traslados indicados en el programa", "Coordinación de recorridos", "Asistencia de JohnToursPerú"],
    excludes: ["Vuelos internacionales", "Actividades no confirmadas en la cotización", "Alimentación, equipaje y gastos personales"],
    departures: demoDepartures(2, [[201, "2026-10-02", "2026-10-06", 20, 20], [202, "2026-11-13", "2026-11-17", 20, 20]])
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
    imageUrl: "/destinations/oxapampa-pozuzo.webp",
    imageCredit: "Archivo propio de JohnToursPerú",
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
    imageCredit: "Fotograma de archivo propio de JohnToursPerú",
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
    price: 1150,
    priceIsEstimated: true,
    currency: "PEN",
    duration: "4 días / 3 noches",
    type: "NACIONAL",
    availableSlots: 0,
    imageUrl: "/destinations/tarapoto.webp",
    imageCredit: "Fotograma de archivo propio de JohnToursPerú",
    isFeatured: true,
    status: "ACTIVO",
    itinerary: [
      "Llegada a Tarapoto, recepción coordinada, traslado al alojamiento y orientación inicial.",
      "Recorrido natural y experiencia acuática según condiciones y disponibilidad del operador local.",
      "Visita a espacios culturales o comunidades incluidas en la propuesta final del grupo.",
      "Desayuno, tiempo libre y traslado coordinado para el viaje de retorno."
    ],
    includes: ["Alojamiento seleccionado por 3 noches", "Traslados programados en destino", "Coordinación de actividades", "Asistencia de JohnToursPerú"],
    excludes: ["Vuelos o transporte hasta Tarapoto", "Actividades no indicadas en la cotización", "Comidas y gastos personales no mencionados"],
    departures: demoDepartures(5, [[501, "2026-09-25", "2026-09-28", 20, 20], [502, "2026-11-06", "2026-11-09", 20, 20]])
  },
  {
    id: 6,
    title: "Europa esencial: Madrid, París y Roma",
    slug: "europa-esencial-madrid-paris-roma",
    destination: "España, Francia e Italia",
    description: "Ruta demostrativa por tres capitales europeas con patrimonio, arte y recorridos urbanos coordinados para una primera experiencia en Europa.",
    price: 2790,
    priceIsEstimated: true,
    currency: "USD",
    duration: "11 días / 10 noches",
    type: "INTERNACIONAL",
    availableSlots: 0,
    imageUrl: "/destinations/europa-esencial.webp",
    imageCredit: "Imagen referencial de Unsplash",
    isFeatured: false,
    status: "ACTIVO",
    itinerary: [
      "Llegada a Madrid, recepción coordinada, instalación y orientación general del circuito.",
      "Recorrido por el centro histórico de Madrid y jornada cultural según la propuesta confirmada.",
      "Traslado Madrid–París y asistencia para el ingreso al alojamiento.",
      "Circuito panorámico de París con tiempo programado para sus principales espacios culturales.",
      "Día de experiencias opcionales en París, definidas antes de la reserva final.",
      "Traslado París–Roma y recepción coordinada.",
      "Recorrido por la Roma histórica y sus plazas principales.",
      "Visita cultural vinculada al Vaticano, sujeta a entradas y condiciones del proveedor.",
      "Día libre asistido para actividades personales u opciones adicionales.",
      "Revisión del retorno, documentación y horarios de salida.",
      "Traslado coordinado al aeropuerto para el viaje de regreso."
    ],
    includes: ["Alojamiento seleccionado por 10 noches", "Traslados internos indicados en la cotización", "Recorridos descritos en el programa final", "Asistencia de JohnToursPerú"],
    excludes: ["Vuelos internacionales salvo indicación expresa", "Entradas, alimentación o equipaje no detallados", "Visados, seguros y gastos personales"],
    departures: demoDepartures(6, [[601, "2027-04-12", "2027-04-22", 20, 20], [602, "2027-06-07", "2027-06-17", 20, 20]])
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
    imageCredit: "Archivo propio de JohnToursPerú",
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
    price: 1390, priceIsEstimated: true, currency: "PEN", duration: "5 días / 4 noches", type: "NACIONAL", availableSlots: 0,
    imageUrl: "/destinations/mancora-tumbes.webp", imageCredit: "Imagen referencial: AlCortés · CC BY 2.0 · Wikimedia Commons", isFeatured: true, status: "ACTIVO",
    itinerary: itineraryCatalog.find((item) => item.id === "norte-peru")?.days,
    includes: ["Alojamiento seleccionado por 4 noches", "Traslados en destino indicados", "Recorridos confirmados", "Asistencia de JohnToursPerú"],
    excludes: ["Vuelos o transporte hasta Piura/Tumbes", "Actividades marinas no confirmadas", "Alimentación y gastos personales"],
    departures: demoDepartures(10, [[1001, "2026-10-22", "2026-10-26", 20, 20], [1002, "2027-02-18", "2027-02-22", 20, 20]])
  },
  {
    id: 11, title: "Cartagena e islas del Caribe", slug: "cartagena-islas-caribe", destination: "Cartagena, Colombia",
    description: "Historia caribeña, ciudad amurallada y jornadas de playa entre Islas del Rosario y Barú.",
    price: 1490, priceIsEstimated: true, currency: "USD", duration: "5 días / 4 noches", type: "INTERNACIONAL", availableSlots: 0,
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
    price: 2190, priceIsEstimated: true, currency: "USD", duration: "8 días / 7 noches", type: "INTERNACIONAL", availableSlots: 0,
    imageUrl: "/destinations/iguazu-argentina.webp", imageCredit: "Imagen referencial: Horacio Cambeiro · CC BY 4.0 · Wikimedia Commons", isFeatured: true, status: "ACTIVO",
    itinerary: itineraryCatalog.find((item) => item.id === "iguazu")?.days,
    includes: ["Alojamiento seleccionado por 7 noches", "Traslados indicados", "Visitas confirmadas en Buenos Aires e Iguazú", "Asistencia de JohnToursPerú"],
    excludes: ["Vuelos salvo indicación expresa", "Requisitos migratorios y seguros", "Alimentación, opcionales y gastos personales"],
    departures: demoDepartures(13, [[1301, "2027-04-05", "2027-04-12", 20, 20], [1302, "2027-08-09", "2027-08-16", 20, 20]])
  },
  {
    id: 14, title: "Punta Cana y Santo Domingo", slug: "punta-cana-santo-domingo", destination: "República Dominicana",
    description: "Playas del Caribe, Isla Saona, Isla Catalina y la historia colonial de Santo Domingo.",
    price: 1890, priceIsEstimated: true, currency: "USD", duration: "5 días / 4 noches", type: "INTERNACIONAL", availableSlots: 0,
    imageUrl: "/destinations/punta-cana.webp", imageCredit: "Imagen referencial: NoonIcarus · CC BY-SA 3.0 · Wikimedia Commons", isFeatured: true, status: "ACTIVO",
    itinerary: itineraryCatalog.find((item) => item.id === "punta-cana")?.days,
    includes: ["Alojamiento seleccionado por 4 noches", "Traslados indicados", "Excursiones confirmadas", "Asistencia de JohnToursPerú"],
    excludes: ["Vuelos internacionales salvo indicación", "Actividades opcionales", "Tasas, alimentación y gastos personales"],
    departures: demoDepartures(14, [[1401, "2027-01-21", "2027-01-25", 20, 20], [1402, "2027-06-10", "2027-06-14", 20, 20]])
  },
  {
    id: 15, title: "Disney y Orlando", slug: "disney-orlando", destination: "Orlando y Miami, Estados Unidos",
    description: "Programa familiar demostrativo con Miami, Magic Kingdom, Epcot y Universal Studios.",
    price: 2890, priceIsEstimated: true, currency: "USD", duration: "8 días / 7 noches", type: "INTERNACIONAL", availableSlots: 0,
    imageUrl: "/destinations/orlando-parques.webp", imageCredit: "Imagen referencial: Jedi94 · CC BY-SA 4.0 · Wikimedia Commons", isFeatured: true, status: "ACTIVO",
    itinerary: itineraryCatalog.find((item) => item.id === "disney")?.days,
    includes: ["Alojamiento seleccionado por 7 noches", "Traslados indicados", "Planificación de parques según entradas", "Asistencia de JohnToursPerú"],
    excludes: ["Vuelos, visa y seguro salvo indicación", "Entradas a parques no confirmadas", "Alimentación, equipaje y gastos personales"],
    departures: demoDepartures(15, [[1501, "2027-03-15", "2027-03-22", 20, 20], [1502, "2027-07-12", "2027-07-19", 20, 20]])
  }
];

const demoReservation: Reservation = {
  id: 2026001,
  isDemo: true,
  travelDate: "2026-08-15",
  peopleCount: 2,
  totalAmount: 3100,
  status: "PENDIENTE",
  customer: { fullName: "Cliente de demostración", email: "cliente.demo@example.com", phone: "999 999 999" },
  tour: demoTours[0]
};

const demoPayment: Payment = {
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

const postPaymentGuides = [
  { match: ["machu", "cusco"], key: "cusco", label: "Cusco y Machu Picchu", imageUrl: "/destinations/machu-picchu.webp", extras: ["Traslado privado", "Noche adicional", "Almuerzo regional", "Asistencia de altura", "Sesión fotográfica", "Seguro de viaje"] },
  { match: ["guayaquil", "ecuador"], key: "general", label: "Guayaquil y costa ecuatoriana", imageUrl: "/destinations/ecuador-costa.webp", extras: ["Traslado aeropuerto-hotel", "Noche adicional", "Actividad costera", "Equipaje adicional", "Seguro internacional", "Asistencia personalizada"] },
  { match: ["oxapampa", "pozuzo"], key: "oxapampa", label: "Oxapampa y Pozuzo", imageUrl: "/destinations/oxapampa-pozuzo.webp", extras: ["Traslado privado", "Noche adicional", "Experiencia de café", "Alimentación", "Visita cultural", "Seguro de viaje"] },
  { match: ["ica", "huacachina"], key: "ica", label: "Ica y Huacachina", imageUrl: "/destinations/ica-huacachina.webp", extras: ["Traslado privado", "Noche adicional", "Experiencia gastronómica", "Bodega seleccionada", "Fotografía al atardecer", "Seguro de viaje"] },
  { match: ["tarapoto", "martín"], key: "general", label: "Tarapoto y naturaleza amazónica", imageUrl: "/destinations/tarapoto.webp", extras: ["Traslado privado", "Noche adicional", "Experiencia acuática", "Alimentación", "Actividad natural", "Seguro de viaje"] },
  { match: ["italia", "florencia", "venecia"], key: "general", label: "Italia clásica", imageUrl: "/destinations/italia-clasica.webp", extras: ["Traslados privados", "Noche adicional", "Entradas culturales", "Experiencia gastronómica", "Seguro internacional", "Asistencia personalizada"] },
  { match: ["españa y portugal", "barcelona", "lisboa"], key: "general", label: "España y Portugal", imageUrl: "/destinations/espana-portugal.webp", extras: ["Traslados privados", "Noche adicional", "Entradas culturales", "Equipaje", "Seguro internacional", "Asistencia personalizada"] },
  { match: ["europa esencial", "parís"], key: "general", label: "Europa esencial", imageUrl: "/destinations/europa-esencial.webp", extras: ["Traslados privados", "Noche adicional", "Entradas culturales", "Equipaje", "Seguro internacional", "Asistencia personalizada"] }
];

function guideForTour(tour: Tour) {
  const value = `${tour.title} ${tour.destination}`.toLowerCase();
  return postPaymentGuides.find((guide) => guide.match.some((term) => value.includes(term))) ?? {
    key: "general", label: tour.title, imageUrl: tour.imageUrl || destinationImage("photo-1488646953014-85cb44e25828"),
    extras: ["Traslados", "Alojamiento adicional", "Alimentación", "Equipaje", "Seguro de viaje", "Asistencia personalizada"]
  };
}

function TourApplication() {
  return <SiteShell><RoutesView /></SiteShell>;
}

function RoutesView() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/tours" element={<Tours />} />
      <Route path="/tours/:id" element={<TourDetail />} />
      <Route path="/reservar/:id" element={<ReservationPage />} />
      <Route path="/pago/:id" element={<YapeReservationPage />} />
      <Route path="/confirmacion/:id" element={<ConfirmationPage />} />
      <Route path="/demo" element={<DemoPage />} />
      <Route path="/admin" element={<AdminPage />} />
      <Route path="/legal/:section" element={<LegalPage />} />
    </Routes>
  );
}

function DemoPage() {
  const steps = ["Crear una reserva ficticia", "Probar el registro Yape", "Simular la aprobación", "Revisar la confirmación y el PDF"];
  return <Section title="Demostración interactiva" subtitle="Conoce cómo funcionará la experiencia completa sin realizar pagos ni enviar información."><div className="demo-landing"><span className="demo-landing-icon"><Sparkles /></span><small>Entorno seguro de presentación</small><h3>Prueba la reserva de principio a fin</h3><p>Todos los datos son ficticios y permanecen únicamente en esta pestaña. No se carga ningún comprobante real, no se procesa dinero y no se envían mensajes automáticamente.</p><div className="demo-landing-steps">{steps.map((step, index) => <span key={step}><b>{index + 1}</b>{step}</span>)}</div><Link to="/reservar/1" className="demo-landing-cta"><span><small>Experiencia de muestra</small><strong>Iniciar demo de Machu Picchu</strong></span><ArrowRight /></Link></div></Section>;
}

function useTours(type?: TourType | null) {
  const fallback = type ? demoTours.filter((tour) => tour.type === type) : demoTours;
  return useQuery<Tour[]>({
    queryKey: ["tours", type],
    queryFn: async () => {
      try {
        const remoteTours = (await api.get("/tours", { params: type ? { type } : {} })).data as Tour[];
        const remoteSlugs = new Set(remoteTours.map((tour) => tour.slug));
        return [...remoteTours, ...fallback.filter((tour) => !remoteSlugs.has(tour.slug))];
      } catch {
        return fallback;
      }
    },
    placeholderData: fallback
  });
}

function Home() {
  const { data: tours = [] } = useTours();
  const featured = tours.filter((tour) => tour.isFeatured).slice(0, 4);
  const heroTours = tours.length ? tours : demoTours;

  return (
    <>
      <section
        className="hero-bg"
        onPointerMove={(event) => {
          const bounds = event.currentTarget.getBoundingClientRect();
          event.currentTarget.style.setProperty("--hero-pointer-x", `${event.clientX - bounds.left}px`);
          event.currentTarget.style.setProperty("--hero-pointer-y", `${event.clientY - bounds.top}px`);
        }}
        onPointerLeave={(event) => {
          event.currentTarget.style.removeProperty("--hero-pointer-x");
          event.currentTarget.style.removeProperty("--hero-pointer-y");
        }}
      >
        <span className="hero-pointer-glow" aria-hidden="true" />
        <span className="hero-aurora hero-aurora-one" aria-hidden="true" />
        <span className="hero-aurora hero-aurora-two" aria-hidden="true" />
        <div className="mx-auto grid min-h-[calc(100svh-80px)] max-w-7xl items-center gap-8 px-4 py-10 lg:min-h-[660px] lg:grid-cols-[1.05fr_.95fr] lg:gap-10 lg:px-6 lg:py-14">
          <div className="animate-rise max-w-3xl text-white">
            <p className="hero-eyebrow mb-4 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-bold text-cyan-100 ring-1 ring-white/20"><Sparkles size={17} /> Viaja seguro · Vive extraordinario</p>
            <h1 className="hero-title text-4xl font-black leading-[1.04] sm:text-5xl md:text-7xl">Descubre experiencias inolvidables con <span>JohnToursPerú</span></h1>
            <p className="mt-6 max-w-2xl text-base leading-8 text-slate-100 md:text-xl">Tours nacionales e internacionales diseñados para viajar seguro y vivir momentos extraordinarios.</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link to="/tours" className="btn-gold primary-action"><span className="button-emblem"><Plane size={18} /></span><span className="button-copy"><small>Descubre destinos</small><strong>Explorar tours</strong></span><ArrowRight className="button-arrow" size={18} /></Link>
              <a href={buildWhatsAppUrl(whatsappMessages.general)} className="whatsapp-cta primary-action"><span className="button-brand-stage"><img src="/whatsapp-logo.svg" alt="" /></span><span className="button-copy"><small>Atención personalizada</small><strong>Reservar por WhatsApp</strong></span><ArrowRight className="button-arrow" size={18} /></a>
            </div>
            <div className="mt-6 flex flex-wrap gap-2 text-xs font-bold text-slate-100">
              <span className="trust-pill rounded-full bg-white/10 px-3 py-2 ring-1 ring-white/20">Reservas online</span>
              <span className="trust-pill rounded-full bg-white/10 px-3 py-2 ring-1 ring-white/20">Pago por Yape</span>
              <span className="trust-pill rounded-full bg-white/10 px-3 py-2 ring-1 ring-white/20">Atención personalizada</span>
              <span className="trust-pill rounded-full bg-white/10 px-3 py-2 ring-1 ring-white/20">Comprobante PDF</span>
              <span className="trust-pill rounded-full bg-white/10 px-3 py-2 ring-1 ring-white/20">Itinerarios incluidos</span>
            </div>
            <div className="mt-8 grid max-w-2xl grid-cols-3 gap-2 sm:gap-3">
              <MiniTrust icon={<ShieldCheck />} value="Reserva segura" label="Yape, código único y comprobante" />
              <MiniTrust icon={<Clock3 />} value="Respuesta clara" label="Atención por WhatsApp" />
              <MiniTrust icon={<HeartHandshake />} value="Viaje acompañado" label="Antes, durante y después" />
            </div>
          </div>
          <div className="space-y-4 lg:pl-2">
            <LogoShowcase />
            <div className="hidden lg:block"><HeroVisualCarousel tours={heroTours} /></div>
            <SearchBox />
          </div>
        </div>
        <a href="#destinos" className="hero-scroll-cue"><span>Descubre los destinos</span><i><ChevronDown size={17} /></i></a>
      </section>
      <DestinationCarousel tours={tours.length ? tours : demoTours} />
      <TravelArchiveShowcase />
      <ExperienceProofSection />
      <Section title="Tours destacados" subtitle="Paquetes elegidos para viajar con confianza y asistencia desde la primera cotización.">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">{featured.map((tour) => <TourCard key={tour.id} tour={tour} />)}</div>
      </Section>
      <AirlineGuideSection />
      <HowItWorksSection />
      <ExclusiveReservationExperience />
      <OurStory />
      <PromotionsShowcase tours={tours.length ? tours : demoTours} />
      <SocialSpotlight />
      <FrequentlyAskedQuestions />
      <section id="contacto" className="formal-cta px-4 py-20 text-white">
        <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-6 lg:flex-row lg:items-center">
          <div className="max-w-3xl"><span className="text-sm font-black uppercase tracking-[0.2em] text-amber-300">El mundo te espera</span><h2 className="mt-3 text-4xl font-black md:text-5xl">Tu próxima aventura empieza hoy</h2><p className="mt-4 text-lg text-slate-200">Reserva con JohnToursPerú y vive una experiencia diseñada para sorprenderte.</p></div>
          <div className="flex flex-col gap-3 sm:flex-row"><a href={buildWhatsAppUrl(whatsappMessages.general)} className="whatsapp-cta primary-action"><span className="button-brand-stage"><img src="/whatsapp-logo.svg" alt="" /></span><span className="button-copy"><small>Asesoría directa</small><strong>Hablar por WhatsApp</strong></span><ArrowRight className="button-arrow" size={18} /></a><Link to="/tours" className="formal-secondary-action"><span className="button-emblem"><Plane size={17} /></span><span>Ver paquetes</span><ArrowRight className="button-arrow" size={17} /></Link></div>
        </div>
      </section>
    </>
  );
}

function MiniTrust({ icon, value, label }: { icon: React.ReactNode; value: string; label: string }) {
  return (
    <div className="mini-trust-card rounded-lg bg-white/12 p-2 ring-1 ring-white/20 backdrop-blur sm:p-3 lg:p-4">
      <span className="mini-trust-icon mb-2 grid h-8 w-8 place-items-center rounded-lg bg-amber-300 text-[#082447] sm:h-9 sm:w-9">{icon}</span>
      <strong className="block text-xs leading-snug sm:text-sm">{value}</strong>
      <span className="mt-1 block text-[11px] leading-snug text-slate-200 sm:text-xs">{label}</span>
    </div>
  );
}

function HeroVisualCarousel({ tours }: { tours: Tour[] }) {
  if (!tours.length) return null;

  return (
    <div className="hero-tour-browser" aria-label="Selector de todos los tours">
      <div className="hero-tour-browser-bar"><span><Sparkles size={14} /> Explora {tours.length} destinos</span><strong>Elige y abre tu paquete</strong></div>
      <div id="heroExperienceCarousel" className="carousel slide hero-mini-carousel overflow-hidden rounded-lg shadow-2xl" data-bs-interval="false">
        <div className="carousel-inner">
          {tours.map((tour, index) => (
            <div key={tour.id} className={`carousel-item ${index === 0 ? "active" : ""}`}>
              <Link to={`/tours/${tour.id}`} className="hero-carousel-link" aria-label={`Ver el paquete ${tour.title}`}>
                <img src={tour.imageUrl} decoding="async" className="d-block h-[250px] w-100 object-cover" alt={tour.title} />
                <div className="hero-mini-caption">
                  <span>{tour.duration}</span>
                  <strong>{tour.title}</strong>
                  <small>{tour.destination}</small>
                  <em>Ver paquete <ArrowRight size={14} /></em>
                </div>
              </Link>
            </div>
          ))}
        </div>
        <button className="carousel-control-prev" type="button" data-bs-target="#heroExperienceCarousel" data-bs-slide="prev" aria-label="Tour anterior"><ChevronDown className="hero-arrow-left" /></button>
        <button className="carousel-control-next" type="button" data-bs-target="#heroExperienceCarousel" data-bs-slide="next" aria-label="Tour siguiente"><ChevronDown className="hero-arrow-right" /></button>
        <div className="carousel-indicators hero-tour-picker" aria-label="Elegir destino">
          {tours.map((tour, index) => <button key={tour.id} type="button" data-bs-target="#heroExperienceCarousel" data-bs-slide-to={index} className={index === 0 ? "active" : ""} aria-current={index === 0 ? "true" : undefined} aria-label={`Mostrar ${tour.title}`}><span>{tour.type === "NACIONAL" ? "Perú" : "Internacional"}</span><strong>{tour.title}</strong></button>)}
        </div>
      </div>
    </div>
  );
}

function LogoShowcase() {
  return (
    <div className="logo-stage" aria-label="JohnToursPerú">
      <div className="logo-orbit" aria-hidden="true" />
      <img src="/john-tours-logo-cropped.png" alt="Logo oficial de JohnToursPerú" />
      <span>Agencia de Viajes y Turismo</span>
    </div>
  );
}

function OurStory() {
  const values = [["Misión", "Crear viajes claros, seguros y memorables."], ["Visión", "Ser una agencia cercana y confiable para cada viajero."], ["Compromiso", "Cumplir lo coordinado con transparencia."], ["Atención", "Acompañar antes, durante y después del viaje."]];
  return <section id="nosotros" className="story-section px-4 py-20 lg:px-6"><div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[.85fr_1.15fr] lg:items-center"><div className="story-logo"><img src="/john-tours-logo-cropped.png" alt="JohnToursPerú" /></div><div><span className="section-kicker">Nuestra historia</span><h2 className="mt-4 text-4xl font-black text-[#073b83] md:text-5xl">Más que una agencia, somos tus aliados de viaje</h2><p className="mt-5 text-lg leading-8 text-slate-600">JohnToursPerú nace con la convicción de que viajar debe sentirse cercano, claro y bien acompañado. Conectamos a familias, colegios, grupos y viajeros con experiencias nacionales e internacionales diseñadas con responsabilidad.</p><p className="mt-4 leading-8 text-slate-600">Escuchamos primero, explicamos cada detalle y mantenemos un contacto humano en cada etapa. Esa cercanía convierte una reserva en confianza y un destino en un recuerdo extraordinario.</p><div className="story-values">{values.map(([title, text]) => <article key={title}><span><HeartHandshake size={19} /></span><div><strong>{title}</strong><p>{text}</p></div></article>)}</div></div></div></section>;
}

function SocialSpotlight() {
  const networks = [
    { name: "TikTok", href: socialLinks.tiktok, logo: "/tiktok-logo.png", className: "social-tiktok", description: "Videos, destinos y consejos" },
    { name: "Instagram", href: socialLinks.instagram, logo: "/instagram-logo.png", className: "social-instagram", description: "Promociones y experiencias" }
  ];
  return (
    <section className="social-section px-4 py-16 text-white lg:px-6" aria-labelledby="social-title">
      <div className="social-shell mx-auto max-w-7xl">
        <div className="social-copy">
          <span className="social-kicker"><Sparkles size={16} /> Comunidad JohnToursPerú</span>
          <h2 id="social-title">Inspírate para tu próximo viaje</h2>
          <p>Síguenos en nuestros canales oficiales y descubre promociones, nuevas salidas y experiencias de viajeros.</p>
          <span className="social-official"><ShieldCheck size={17} /> Perfiles oficiales de JohnToursPerú</span>
        </div>
        <div className="social-cards">
          {networks.map((network) => (
            <a key={network.name} href={network.href} target="_blank" rel="noreferrer" className={`social-button ${network.className}`} aria-label={`Abrir el perfil oficial de JohnToursPerú en ${network.name}`}>
              <span className={`social-logo-stage social-logo-stage-${network.name.toLowerCase()}`}>
                <img src={network.logo} alt="" />
              </span>
              <span className="social-platform">
                <small>Canal oficial</small>
                <strong>{network.name}</strong>
                <span>{network.description}</span>
                <b>@johntoursperu</b>
              </span>
              <span className="social-open">Ver perfil <ArrowRight size={17} /></span>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

function ExclusiveReservationExperience() {
  const benefits = [
    [<Sparkles key="sparkles" />, "Guía privada del destino", "Después de confirmar la reserva recibes una guía visual vinculada al viaje elegido."],
    [<Award key="award" />, "Extras seleccionados", "Accedes a opciones complementarias pensadas para ese destino, sin saturar el paquete principal."],
    [<HeartHandshake key="support" />, "Coordinación personal", "Un asesor revisa contigo fechas, disponibilidad y condiciones antes de agregar cualquier servicio."],
    [<FileText key="file" />, "Información para conservar", "Descarga un PDF con el logo de JohnToursPerú, imagen referencial y detalles útiles para tu viaje."]
  ];
  return (
    <section className="exclusive-section px-4 py-16 text-white lg:px-6 lg:py-20">
      <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[.82fr_1.18fr] lg:items-center">
        <div>
          <span className="exclusive-badge"><Star size={16} fill="currentColor" /> Beneficio exclusivo para viajeros</span>
          <h2 className="mt-5 text-4xl font-black leading-tight md:text-5xl">Tu reserva abre una experiencia más personal</h2>
          <p className="mt-5 text-lg leading-8 text-slate-200">El catálogo te ayuda a elegir. Después de confirmar tu reserva, desbloqueamos información y opciones específicas para complementar el destino que realmente vas a disfrutar.</p>
          <div className="mt-7 flex flex-col gap-3 sm:flex-row"><Link to="/tours" className="btn-gold primary-action"><span className="button-emblem"><Plane size={17} /></span><span className="button-copy"><small>Explora opciones</small><strong>Elegir mi destino</strong></span><ArrowRight className="button-arrow" size={17} /></Link><a href={buildWhatsAppUrl("Hola JohnToursPerú, quiero conocer los beneficios que se desbloquean al reservar un tour.")} className="formal-secondary-action"><span className="button-emblem"><MessageCircle size={17} /></span><span>Consultar beneficios</span><ArrowRight className="button-arrow" size={17} /></a></div>
        </div>
        <div className="exclusive-grid grid gap-4 sm:grid-cols-2">{benefits.map(([icon, title, text]) => <article key={String(title)} className="exclusive-card rounded-2xl border border-white/15 bg-white/10 p-5 backdrop-blur"><span>{icon}</span><strong className="mt-4 block text-lg">{title}</strong><p className="mt-2 text-sm leading-6 text-slate-200">{text}</p></article>)}</div>
      </div>
    </section>
  );
}

function FrequentlyAskedQuestions() {
  const questions = [
    ["¿Cómo puedo reservar un tour?", "Elige una experiencia, completa tus datos y revisa la información de pago. También puedes escribirnos por WhatsApp antes de reservar."],
    ["¿Puedo solicitar un viaje personalizado?", "Sí. Cuéntanos destino, fechas, cantidad de viajeros y estilo de viaje para orientarte con una propuesta acorde a tus necesidades."],
    ["¿Cómo pago la reserva?", "Inicia tu reserva con S/ 200 por Yape. El sistema genera un código único y permite registrar el comprobante para su validación."],
    ["¿Cuándo se confirma mi reserva?", "La reserva se confirma después de validar el monto, el titular y el código único incluido en tu comprobante."],
    ["¿Tendré asistencia durante el viaje?", "Sí. Nuestro enfoque incluye orientación previa y un canal de contacto directo para acompañarte durante tu experiencia."],
    ["¿Dónde reviso lo que incluye cada paquete?", "En el detalle de cada tour encontrarás itinerario, servicios incluidos, exclusiones, duración y precio."],
    ["¿Los precios incluyen vuelos?", "Cada paquete indica con claridad sus inclusiones. Si el vuelo no está incluido, puedes comparar opciones desde nuestros enlaces oficiales de aerolíneas."],
    ["¿Puedo descargar un comprobante?", "Sí. Después de completar el flujo de demostración o registrar una reserva válida podrás generar una constancia PDF con el resumen y el itinerario."]
  ];
  return (
    <section className="faq-section px-4 py-16 lg:px-6 lg:py-20">
      <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[.75fr_1.25fr]">
        <div><span className="section-kicker">Resolvemos tus dudas</span><h2 className="mt-4 text-4xl font-black text-[#082447] md:text-5xl">Preguntas frecuentes</h2><p className="mt-4 text-lg leading-8 text-slate-600">Queremos que decidas con información clara. Si necesitas una respuesta personal, estamos a un mensaje de distancia.</p><a href={buildWhatsAppUrl("Hola JohnToursPerú, tengo una consulta sobre sus viajes.")} className="whatsapp-cta primary-action mt-7"><span className="button-brand-stage"><img src="/whatsapp-logo.svg" alt="" /></span><span className="button-copy"><small>Respuesta personalizada</small><strong>Consultar por WhatsApp</strong></span><ArrowRight className="button-arrow" size={17} /></a></div>
        <div className="grid gap-3">{questions.map(([question, answer], index) => <details key={question} className="faq-item group rounded-2xl border border-slate-200 bg-white"><summary className="flex cursor-pointer list-none items-center justify-between gap-4 p-5 font-bold text-[#082447]"><span>{question}</span><span className="faq-plus grid h-8 w-8 shrink-0 place-items-center rounded-full">+</span></summary><div className="px-5 pb-5 pr-16 text-sm leading-7 text-slate-600">{answer}</div>{index === 0 && <span className="sr-only">Abre para ver la respuesta</span>}</details>)}</div>
      </div>
    </section>
  );
}

function SearchBox() {
  const navigate = useNavigate();
  const [destination, setDestination] = useState("");
  const [type, setType] = useState("");
  return (
    <div className="glass search-panel rounded-2xl p-5 shadow-2xl lg:p-6">
      <p className="mb-2 text-xs font-black uppercase tracking-widest text-[#0f7a4f]">Cotización rápida</p>
      <h2 className="text-xl font-black text-[#082447] lg:text-2xl">Diseña tu próxima experiencia</h2>
      <p className="mt-1 text-sm leading-6 text-slate-600">Filtra por destino, fecha y tipo de viaje. Luego un asesor puede ayudarte por WhatsApp.</p>
      <div className="mt-5 grid gap-3 lg:grid-cols-2">
        <input className="rounded-lg border border-slate-200 px-4 py-3" placeholder="Destino" value={destination} onChange={(e) => setDestination(e.target.value)} />
        <input className="rounded-lg border border-slate-200 px-4 py-3" type="date" />
        <select className="rounded-lg border border-slate-200 px-4 py-3" value={type} onChange={(e) => setType(e.target.value)}>
          <option value="">Tipo de viaje</option><option value="NACIONAL">Nacional</option><option value="INTERNACIONAL">Internacional</option>
        </select>
        <input className="rounded-lg border border-slate-200 px-4 py-3" type="number" min="1" placeholder="Personas" />
        <button className="search-submit lg:col-span-2" onClick={() => navigate(`/tours?${new URLSearchParams({ ...(type && { type }), ...(destination && { destination }) }).toString()}`)}><span className="button-emblem"><Search size={18} /></span><span className="button-copy"><small>Aplicar preferencias</small><strong>Buscar experiencia</strong></span><span className="button-terminal"><ArrowRight size={17} /></span></button>
      </div>
    </div>
  );
}

const normalizeCatalogSearch = (value: string) => value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();

function Tours() {
  const [params, setParams] = useSearchParams();
  const navigate = useNavigate();
  const initialType = params.get("type") as TourType | null;
  const { data: tours = [], isLoading } = useTours();
  const [destination, setDestination] = useState(params.get("destination") ?? "");
  const [maxPrice, setMaxPrice] = useState(3000);
  const normalizedDestination = normalizeCatalogSearch(destination);
  const bestMatch = useMemo(() => {
    if (!normalizedDestination) return undefined;
    return [...tours]
      .map((tour) => {
        const fields = [tour.title, tour.destination, tour.slug].map(normalizeCatalogSearch);
        const score = fields.some((field) => field === normalizedDestination) ? 0 : fields.some((field) => field.startsWith(normalizedDestination)) ? 1 : fields.some((field) => field.includes(normalizedDestination)) ? 2 : 99;
        return { tour, score };
      })
      .filter(({ score }) => score < 99)
      .sort((left, right) => left.score - right.score || left.tour.title.localeCompare(right.tour.title))[0]?.tour;
  }, [normalizedDestination, tours]);
  const filtered = useMemo(() => tours.filter((tour) => {
    const searchable = normalizeCatalogSearch(`${tour.title} ${tour.destination} ${tour.slug}`);
    const matchesSearch = !normalizedDestination || searchable.includes(normalizedDestination);
    const matchesType = normalizedDestination ? true : !initialType || tour.type === initialType;
    return matchesSearch && matchesType && Number(tour.price) <= maxPrice;
  }), [tours, normalizedDestination, initialType, maxPrice]);

  const openBestMatch = (event: React.FormEvent) => {
    event.preventDefault();
    if (bestMatch) navigate(`/tours/${bestMatch.id}`);
  };

  return (
    <Section title="Catálogo de tours" subtitle="Filtra paquetes nacionales e internacionales por destino, precio y estilo.">
      <div className="catalog-filters mb-6 grid gap-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm lg:grid-cols-4">
        <select className="rounded-lg border px-4 py-3" aria-label="Tipo de tour" value={initialType ?? ""} onChange={(e) => setParams(e.target.value ? { type: e.target.value } : {})}><option value="">Todos los tours</option><option value="NACIONAL">Nacionales</option><option value="INTERNACIONAL">Internacionales</option></select>
        <form className="catalog-search-control" onSubmit={openBestMatch}>
          <label><Search size={18} /><input list="catalog-tour-options" aria-label="Buscar paquete o destino" placeholder="Buscar paquete o destino" value={destination} onChange={(e) => setDestination(e.target.value)} /></label>
          <button type="submit" disabled={!bestMatch} aria-label={bestMatch ? `Abrir el paquete ${bestMatch.title}` : "Escribe un destino disponible"}><span>{bestMatch ? "Abrir" : "Buscar"}</span><ArrowRight size={17} /></button>
          <datalist id="catalog-tour-options">{tours.map((tour) => <option key={tour.id} value={tour.title}>{tour.destination}</option>)}</datalist>
        </form>
        <label className="catalog-budget"><span className="catalog-budget-icon"><Filter size={17} /></span><span><small>Presupuesto máximo</small><strong>Hasta {maxPrice.toLocaleString("es-PE")} · S/ o USD</strong></span><input aria-label="Presupuesto máximo por persona" type="range" min="100" max="3000" step="50" value={maxPrice} onChange={(e) => setMaxPrice(Number(e.target.value))} /></label>
        <a href={buildWhatsAppUrl(whatsappMessages.general)} className="catalog-advisor"><span className="button-brand-stage"><img src="/whatsapp-logo.svg" alt="" /></span><span className="button-copy"><small>Ayuda personalizada</small><strong>Solicitar orientación</strong></span><ArrowRight className="button-arrow" size={17} /></a>
      </div>
      {isLoading ? <p>Cargando tours...</p> : filtered.length ? <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">{filtered.map((tour) => <TourCard key={tour.id} tour={tour} />)}</div> : <div className="catalog-empty"><Search /><strong>No encontramos ese paquete</strong><span>Prueba con el nombre del destino o solicita orientación por WhatsApp.</span></div>}
      <ItineraryLibrary />
    </Section>
  );
}

function ItineraryLibrary() {
  return <section className="itinerary-library" aria-labelledby="itinerary-library-title">
    <div className="itinerary-library-heading">
      <div><span className="section-kicker"><FileText size={15} /> Programas revisados</span><h2 id="itinerary-library-title">Más formas de vivir cada destino</h2><p>Revisamos el archivo operativo y agrupamos las propuestas útiles, sin repetir versiones del mismo documento. Aquí mostramos solo la ruta principal; el detalle se habilita al reservar.</p></div>
      <span className="itinerary-library-count"><strong>{itineraryCatalog.length}</strong><small>modalidades consolidadas</small></span>
    </div>
    <div className="itinerary-library-track">
      {itineraryCatalog.map((variant) => <article className="itinerary-program-card" key={variant.id}>
        <div className="itinerary-program-meta"><span><MapPin size={14} />{variant.region}</span><span><CalendarDays size={14} />{variant.duration}</span></div>
        <h3>{variant.title}</h3>
        <ul>{variant.publicHighlights.slice(0, 4).map((highlight) => <li key={highlight}><CheckCircle2 size={14} />{highlight}</li>)}</ul>
        {variant.packageSlug
          ? <Link to={`/tours/${demoTours.find((tour) => tour.slug === variant.packageSlug)?.id ?? 1}`}><span>Ver paquete relacionado</span><ArrowRight size={16} /></Link>
          : <a href={buildWhatsAppUrl(`Hola JohnToursPerú, deseo información sobre el programa ${variant.title} (${variant.duration}).`)} target="_blank" rel="noreferrer"><span>Consultar este programa</span><ArrowRight size={16} /></a>}
      </article>)}
    </div>
    <p className="itinerary-library-disclaimer"><ShieldCheck size={16} /> Programas referenciales organizados a partir del archivo proporcionado. Precios, vuelos, accesos, vigencia y orden de actividades se confirman antes de contratar.</p>
  </section>;
}

function PublicItineraryOptions({ variants }: { variants: ItineraryVariant[] }) {
  if (!variants.length) return null;
  return <section className="public-itinerary-options">
    <div><span className="section-kicker"><Sparkles size={14} /> Alternativas del destino</span><h3>Elige la duración que mejor se adapte a ti</h3><p>Estas son las modalidades principales encontradas para este destino. Los horarios y datos operativos permanecen privados hasta confirmar la reserva.</p></div>
    <div className="public-itinerary-options-grid">{variants.map((variant) => <article key={variant.id}><span>{variant.duration}</span><h4>{variant.title}</h4><ul>{variant.publicHighlights.map((highlight) => <li key={highlight}><CheckCircle2 size={14} />{highlight}</li>)}</ul></article>)}</div>
  </section>;
}

const seasonByDestination = [
  { terms: ["cusco", "machu"], months: "mayo a septiembre", reason: "Temporada seca, cielos más despejados y mejores condiciones para caminatas." },
  { terms: ["guayaquil", "ecuador"], months: "junio a noviembre", reason: "Ambiente más fresco y condiciones agradables para recorridos urbanos y costeros." },
  { terms: ["oxapampa", "pozuzo"], months: "mayo a octubre", reason: "Menos lluvias para cataratas, rutas y actividades al aire libre." },
  { terms: ["ica", "huacachina"], months: "abril a noviembre", reason: "Días soleados y temperaturas cómodas para dunas y bodegas." },
  { terms: ["tarapoto", "martín"], months: "mayo a septiembre", reason: "Menor frecuencia de lluvias para recorridos naturales y actividades al aire libre." },
  { terms: ["italia", "florencia", "venecia"], months: "abril a junio y septiembre a octubre", reason: "Temperaturas agradables para recorridos culturales, sujetas a condiciones y demanda de cada ciudad." },
  { terms: ["españa y portugal", "barcelona", "lisboa"], months: "abril a junio y septiembre a octubre", reason: "Temporadas intermedias recomendables para recorrer ciudades con temperaturas más suaves." },
  { terms: ["europa esencial", "parís"], months: "abril a junio y septiembre a octubre", reason: "Clima moderado y buenas condiciones para recorridos urbanos; la disponibilidad se confirma antes de reservar." },
  { terms: ["mancora", "punta sal", "tumbes"], months: "mayo a diciembre", reason: "Temporada generalmente favorable para disfrutar la costa norte; el estado del mar se confirma antes de cada actividad." },
  { terms: ["cartagena", "colombia"], months: "diciembre a abril", reason: "Periodo habitualmente más seco para recorridos urbanos y experiencias insulares." },
  { terms: ["río de janeiro", "brasil"], months: "abril a junio y agosto a octubre", reason: "Temperaturas agradables para ciudad, miradores y recorridos al aire libre." },
  { terms: ["iguazú", "argentina"], months: "marzo a mayo y agosto a octubre", reason: "Clima más moderado para recorrer las pasarelas; el caudal y accesos dependen de las condiciones locales." },
  { terms: ["punta cana", "dominicana"], months: "diciembre a abril", reason: "Meses habitualmente más secos para playa y navegación, sujetos al clima del Caribe." },
  { terms: ["orlando", "disney", "estados unidos"], months: "enero a mayo y septiembre a noviembre", reason: "Temperaturas más cómodas; entradas, aforo y eventos se verifican con cada parque." }
];

const featuredTourVideos: Record<string, { src: string; poster: string; title: string }> = {
  "machu-picchu": {
    src: "/media/machu-picchu-reel.mp4",
    poster: "/media/machu-picchu-reel-poster.webp",
    title: "Machu Picchu, una experiencia inolvidable"
  },
  "tarapoto-naturaleza": {
    src: "/media/tarapoto-naturaleza.mp4",
    poster: "/destinations/tarapoto.webp",
    title: "Navegación entre paisajes amazónicos"
  }
};

const tourSeason = (tour: Tour) => {
  const value = `${tour.title} ${tour.destination}`.toLowerCase();
  return seasonByDestination.find((item) => item.terms.some((term) => value.includes(term))) ?? { months: "según disponibilidad", reason: "Un asesor confirmará clima, demanda y condiciones antes de reservar." };
};
const departureDate = (value: string) => new Date(`${value.slice(0, 10)}T12:00:00`);
const departureUrgency = (departure: TourDeparture) => {
  const days = Math.ceil((departureDate(departure.startDate).getTime() - Date.now()) / 86_400_000);
  if (days >= 0 && days <= 14) return { label: "Salida próxima", tone: "soon" };
  return null;
};

function DepartureCalendar({ tour, selectedId, onSelect }: { tour: Tour; selectedId?: number; onSelect?: (departure: TourDeparture) => void }) {
  const departures = (tour.departures ?? []).filter((departure) => departure.status === "ACTIVO" && departure.availableSlots > 0);
  if (!departures.length) return <div className="departure-empty"><CalendarDays /><span><strong>Fechas por confirmar</strong><small>Solicita la próxima salida programada a un asesor.</small></span></div>;
  return <div className="departure-calendar">{departures.map((departure) => {
    const urgency = departureUrgency(departure);
    return <button key={departure.id} type="button" className={selectedId === departure.id ? "selected" : ""} onClick={() => onSelect?.(departure)} disabled={!onSelect}>
      <span className="departure-month">{new Intl.DateTimeFormat("es-PE", { month: "short" }).format(departureDate(departure.startDate))}</span>
      <strong>{new Intl.DateTimeFormat("es-PE", { day: "2-digit" }).format(departureDate(departure.startDate))}</strong>
      <small>Salida programada</small>
      {urgency && <em data-tone={urgency.tone}>{urgency.label}</em>}
    </button>;
  })}</div>;
}

function TourDetail() {
  const { id = "" } = useParams();
  const { data: tour, isLoading } = useQuery<Tour>({
    queryKey: ["tour", id],
    queryFn: async () => {
      try {
        return (await api.get(`/tours/${id}`)).data;
      } catch {
        return demoTours.find((item) => item.id === Number(id)) ?? demoTours[0];
      }
    },
    placeholderData: demoTours.find((item) => item.id === Number(id)) ?? demoTours[0]
  });
  if (isLoading || !tour) return <Section title="Cargando tour" subtitle="Preparando detalles..." />;
  const itinerary = tour.itinerary ?? ["Recepción y orientación", "Experiencia principal", "Actividades libres", "Retorno"];
  const publicRoute = tour.slug === "machu-picchu"
    ? ["Cusco y complejos arqueológicos", "Valle Sagrado de los Incas", "Machu Picchu con ingreso programado", "Maras, Moray y Salineras", "Retorno coordinado"]
    : itinerary.slice(0, 4).map((item) => item.replace(/^Día\s+\d+:\s*/i, "").split(/[.;]/)[0]);
  const season = tourSeason(tour);
  const featuredVideo = featuredTourVideos[tour.slug];
  const itineraryOptions = itineraryVariantsFor(tour.slug);
  const externalImageCredit = tour.imageCredit && !/(archivo propio|fotograf[ií]a propia|fotograma de archivo propio)/i.test(tour.imageCredit) ? tour.imageCredit : undefined;
  return (
    <Section title={tour.title} subtitle={`${tour.destination} · ${tour.duration}`}>
      <div className="grid gap-8 lg:grid-cols-[1.2fr_.8fr]">
        <div className="space-y-4">
          <div className="tour-detail-image"><img src={tour.imageUrl} alt={tour.title} className="h-[440px] w-full rounded-lg object-cover shadow-xl" /></div>
          {externalImageCredit && <p className="tour-image-attribution">Crédito de la imagen: {externalImageCredit}</p>}
          {featuredVideo && <div className="overflow-hidden rounded-lg border border-cyan-100 bg-[#061f3f] shadow-lg">
            <div className="flex items-center gap-3 px-4 py-3 text-white"><PlayCircle className="text-cyan-300" /><span><small className="block text-[10px] font-black uppercase tracking-[.14em] text-cyan-200">Video de la experiencia</small><strong>{featuredVideo.title}</strong></span></div>
            <video className="aspect-video w-full bg-black object-cover" controls playsInline preload="none" poster={featuredVideo.poster} aria-label={`Video de ${tour.title}`}>
              <source src={featuredVideo.src} type="video/mp4" />
              Tu navegador no puede reproducir este video.
            </video>
          </div>}
        </div>
        <aside className="booking-aside rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-bold uppercase text-[#0f7a4f]">{tour.type}</p>
          <p className="mt-3 text-4xl font-black text-[#082447]">{tourMoney(tour)}</p>
          {tour.priceIsEstimated && <p className="mt-2 rounded-lg bg-amber-50 px-3 py-2 text-xs font-bold leading-5 text-amber-800">Precio referencial de demostración. Confirma la tarifa final antes de reservar.</p>}
          <div className="mt-5 space-y-3 text-sm text-slate-600">
            <p className="flex items-center gap-2"><ShieldCheck className="text-[#0f7a4f]" size={18} /> Reserva con datos protegidos</p>
            <p className="flex items-center gap-2"><Clock3 className="text-[#0f4c81]" size={18} /> Confirmación y seguimiento</p>
            <p className="flex items-center gap-2"><UsersRound className="text-amber-600" size={18} /> Asesoría para tu grupo</p>
          </div>
          <Link to={`/reservar/${tour.id}`} className="btn-gold primary-action mt-6"><span className="button-emblem"><CalendarDays size={18} /></span><span className="button-copy"><small>Inicia con S/ 200</small><strong>Reservar este tour</strong></span><ArrowRight className="button-arrow" size={18} /></Link>
          <a href={buildWhatsAppUrl(whatsappMessages.tour(tour))} className="whatsapp-cta primary-action mt-3"><span className="button-brand-stage"><img src="/whatsapp-logo.svg" alt="" /></span><span className="button-copy"><small>Consulta sin compromiso</small><strong>Cotizar por WhatsApp</strong></span><ArrowRight className="button-arrow" size={18} /></a>
        </aside>
      </div>
      <section className="scheduled-departures">
        <div className="scheduled-heading">
          <span><CalendarDays /></span>
          <div><small>Salidas programadas</small><h3>Fechas referenciales para viajar</h3><p>Elige una fecha y solicita la confirmación final del paquete con un asesor.</p></div>
          <div className="best-season"><strong>Mejor época</strong><span>{season.months}</span><small>{season.reason}</small></div>
        </div>
        <DepartureCalendar tour={tour} />
      </section>
      <div className="mt-10 grid gap-6 lg:grid-cols-3">
        <Info title="Descripción" items={[tour.description ?? "Experiencia seleccionada por JohnToursPerú."]} />
        <Info title="Ruta principal" items={publicRoute} ordered />
        <Info title="Servicios principales" items={["Alojamiento y traslados según la propuesta", "Guiado en los recorridos confirmados", "Asistencia de JohnToursPerú durante el viaje"]} />
      </div>
      <PublicItineraryOptions variants={itineraryOptions} />
      <p className="public-itinerary-note"><ShieldCheck size={17} /> Por seguridad y claridad comercial, el itinerario detallado —horarios, traslados, paradas y condiciones— se habilita después de confirmar la reserva.</p>
    </Section>
  );
}

const reservationSchema = z.object({
  fullName: z.string().min(3), email: z.string().email(), phone: z.string().min(6), documentNumber: z.string().min(6), travelDate: z.string().min(1), peopleCount: z.coerce.number().min(1)
});
type ReservationForm = z.input<typeof reservationSchema>;

type AdminTourForm = {
  id?: number;
  title: string;
  destination: string;
  description: string;
  price: string;
  currency: "PEN" | "USD";
  paymentMode: "FULL" | "DEPOSIT";
  depositPercent: string;
  duration: string;
  type: TourType;
  availableSlots: string;
  imageUrl: string;
  imageCredit: string;
  isFeatured: boolean;
  status: TourStatus;
  itineraryText: string;
  includesText: string;
  excludesText: string;
};

const emptyAdminTourForm: AdminTourForm = {
  title: "",
  destination: "",
  description: "",
  price: "",
  currency: "PEN",
  paymentMode: "FULL",
  depositPercent: "",
  duration: "",
  type: "NACIONAL",
  availableSlots: "10",
  imageUrl: "",
  imageCredit: "",
  isFeatured: false,
  status: "ACTIVO",
  itineraryText: "Llegada y bienvenida\nTour principal guiado\nExperiencias locales\nRetorno",
  includesText: "Alojamiento\nTraslados\nGuía especializada\nAsistencia JohnToursPerú",
  excludesText: "Gastos personales\nPropinas\nServicios no mencionados"
};

const listFromText = (value: string) => value.split("\n").map((item) => item.trim()).filter(Boolean);
const textFromList = (value?: string[]) => (value ?? []).join("\n");

function ReservationPage() {
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const [reservationError, setReservationError] = useState("");
  const [selectedDeparture, setSelectedDeparture] = useState<TourDeparture>();
  const { data: tour } = useQuery<Tour>({
    queryKey: ["tour", id],
    queryFn: async () => {
      try {
        return (await api.get(`/tours/${id}`)).data;
      } catch {
        return demoTours.find((item) => item.id === Number(id)) ?? demoTours[0];
      }
    },
    placeholderData: demoTours.find((item) => item.id === Number(id)) ?? demoTours[0]
  });
  const form = useForm<ReservationForm>({ resolver: zodResolver(reservationSchema), defaultValues: { peopleCount: 1 } });
  useEffect(() => {
    const first = tour?.departures?.find((departure) => departure.status === "ACTIVO" && departure.availableSlots > 0);
    if (first && !selectedDeparture) {
      setSelectedDeparture(first);
      form.setValue("travelDate", first.startDate.slice(0, 10));
    }
  }, [tour, selectedDeparture, form]);
  const mutation = useMutation({
    mutationFn: async (values: ReservationForm) => (await api.post("/reservations", { ...reservationSchema.parse(values), tourId: Number(id), departureId: selectedDeparture?.id })).data,
    onSuccess: (reservation: Reservation) => {
      sessionStorage.setItem(`john-reservation-${reservation.id}`, JSON.stringify(reservation));
      navigate(`/pago/${reservation.id}`);
    },
    onError: () => {
      if (!tour) return;
      if (!isDemoMode) {
        setReservationError("No pudimos conectar con el sistema de reservas. Intenta nuevamente o solicita ayuda por WhatsApp.");
        return;
      }
      const values = form.getValues();
      const localId = Date.now();
      const localReservation: Reservation = { id: localId, isDemo: true, travelDate: values.travelDate, peopleCount: Number(values.peopleCount), totalAmount: reservationAmount, status: "PENDIENTE", slotsHeld: true, holdExpiresAt: new Date(Date.now() + 30 * 60_000).toISOString(), departure: selectedDeparture, customer: { fullName: values.fullName, email: values.email, phone: values.phone }, tour };
      sessionStorage.setItem(`john-reservation-${localId}`, JSON.stringify(localReservation));
      navigate(`/pago/${localId}`);
    }
  });
  return (
    <Section title="Reserva tu viaje" subtitle={tour ? `${tour.title} · Inicia tu reserva con S/ ${reservationAmount}` : "Completa tus datos"}>
      <form onSubmit={form.handleSubmit((v) => mutation.mutate(v))} className="mx-auto grid max-w-3xl gap-4 rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        {isDemoMode && <div className="demo-mode-banner"><Sparkles size={18} /><span><strong>Demostración interactiva</strong><small>Podrás recorrer la reserva, Yape, estados, PDF y panel sin realizar pagos ni guardar datos en una base real.</small></span></div>}
        {tour && <div className="reservation-tour-summary"><img src={tour.imageUrl} alt={tour.title} /><div><small>Experiencia seleccionada</small><strong>{tour.title}</strong><span><MapPin size={14} /> {tour.destination} · {tour.duration}</span></div><b>S/ {reservationAmount}<small>reserva</small></b></div>}
        {["fullName", "email", "phone", "documentNumber"].map((name) => <input key={name} className="rounded-lg border px-4 py-3" placeholder={{ fullName: "Nombre completo", email: "Correo", phone: "Teléfono", documentNumber: "Documento" }[name]} {...form.register(name as never)} />)}
        {tour && <div className="reservation-departures"><strong>Selecciona tu salida</strong><DepartureCalendar tour={tour} selectedId={selectedDeparture?.id} onSelect={(departure) => { setSelectedDeparture(departure); form.setValue("travelDate", departure.startDate.slice(0, 10)); }} /></div>}
        <div className="grid gap-4 sm:grid-cols-2"><input className="rounded-lg border px-4 py-3" type="date" readOnly={Boolean(tour?.departures?.length)} {...form.register("travelDate")} /><input className="rounded-lg border px-4 py-3" type="number" min="1" max={selectedDeparture?.availableSlots ?? tour?.availableSlots ?? 20} {...form.register("peopleCount")} /></div>
        <div className="hold-notice"><Clock3 /><span><strong>Solicitud protegida durante 30 minutos</strong><small>JohnToursPerú mantendrá activa tu solicitud mientras recibe y valida el comprobante Yape.</small></span></div>
        {reservationError && <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">{reservationError}</p>}
        <button className="reservation-submit" disabled={mutation.isPending}><span className="button-emblem"><ShieldCheck size={18} /></span><span className="button-copy"><small>Solicitud protegida</small><strong>{mutation.isPending ? "Creando reserva..." : "Continuar con la reserva"}</strong></span><span className="button-terminal"><ArrowRight size={17} /></span></button>
      </form>
    </Section>
  );
}

const reservationSteps = [
  "Reserva creada",
  "Pago Yape pendiente / enviado",
  "Comprobante generado",
  "Validación pendiente",
  "Reserva confirmada"
];

function ReservationProgress({ currentStep }: { currentStep: number }) {
  return (
    <ol className="reservation-progress" aria-label="Estado de la reserva">
      {reservationSteps.map((label, index) => {
        const state = index < currentStep ? "complete" : index === currentStep ? "current" : "pending";
        return <li key={label} data-state={state} aria-current={state === "current" ? "step" : undefined}><span>{index + 1}</span><strong>{label}</strong></li>;
      })}
    </ol>
  );
}

function YapeReservationPage() {
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);
  const [proofRegistered, setProofRegistered] = useState(false);
  const [proofFile, setProofFile] = useState<File>();
  const [proofError, setProofError] = useState("");
  const [proofPending, setProofPending] = useState(false);
  const [referenceCode, setReferenceCode] = useState("");
  const [paidAt, setPaidAt] = useState(() => {
    const now = new Date(Date.now() - new Date().getTimezoneOffset() * 60_000);
    return now.toISOString().slice(0, 16);
  });
  const { data: reservation } = useQuery<Reservation>({
    queryKey: ["reservation", id],
    queryFn: async () => {
      try { return (await api.get(`/reservations/${id}`)).data; }
      catch {
        const saved = sessionStorage.getItem(`john-reservation-${id}`);
        if (!saved) throw new Error("Reserva no encontrada");
        return JSON.parse(saved) as Reservation;
      }
    }
  });
  const paymentCode = useMemo(() => reservationCode(id), [id]);
  if (!reservation) return <Section title="Preparando tu reserva" subtitle="Estamos generando tu código seguro de pago." />;
  const message = [
    "COMPROBANTE DE SEPARACIÓN - JOHNTOURSPERÚ",
    "",
    `Estimados, soy ${reservation.customer.fullName}. Solicito validar el pago Yape correspondiente a mi reserva.`,
    `Código de separación: ${paymentCode}`,
    `Reserva: #${id}`,
    `Paquete: ${reservation.tour.title}`,
    `Destino: ${reservation.tour.destination}`,
    `Fecha de viaje: ${reservation.travelDate}`,
    `Viajeros: ${reservation.peopleCount}`,
    `Monto enviado: S/ ${reservationAmount}.00`,
    "",
    "Adjuntaré la captura o constancia de Yape en este chat. Agradezco confirmar la recepción, la validación del pago y los siguientes pasos del paquete."
  ].join("\n");
  const simulatePayment = () => {
    sessionStorage.setItem(`john-reservation-${id}`, JSON.stringify({ ...reservation, status: "PAGADA" }));
    navigate(`/confirmacion/${id}?demo=1`);
  };
  const registerProof = async () => {
    setProofError("");
    if (isDemoMode && !proofFile) {
      setReferenceCode("75709508");
      setProofFile(new File(["Comprobante ficticio para demostración"], "comprobante-yape-demo.png", { type: "image/png" }));
      setProofRegistered(true);
      return;
    }
    if (!proofFile) return setProofError("Adjunta una imagen o PDF del comprobante.");
    if (!["image/jpeg", "image/png", "image/webp", "application/pdf"].includes(proofFile.type) || proofFile.size > 5 * 1024 * 1024) return setProofError("Usa JPG, PNG, WebP o PDF de hasta 5 MB.");
    if (referenceCode.trim().length < 6) return setProofError("Ingresa el código de operación mostrado por Yape.");
    setProofPending(true);
    try {
      if (reservation.publicToken) {
        const data = new FormData();
        data.append("reservationId", String(reservation.id));
        data.append("reservationToken", reservation.publicToken);
        data.append("referenceCode", referenceCode.trim());
        data.append("amount", String(reservationAmount));
        data.append("paidAt", new Date(paidAt).toISOString());
        data.append("proof", proofFile);
        await api.post("/payments/yape", data);
      } else if (!isDemoMode) {
        throw new Error("Reserva sin token");
      }
      setProofRegistered(true);
    } catch {
      setProofError(isDemoMode ? "" : "No se pudo registrar el comprobante. Verifica que la reserva siga vigente.");
      if (isDemoMode) setProofRegistered(true);
    } finally {
      setProofPending(false);
    }
  };
  return <Section title="Inicia tu reserva con Yape" subtitle="Paga S/ 200 y registra tu constancia para mantener activa la solicitud mientras un trabajador la valida."><div className="mx-auto max-w-6xl"><ReservationProgress currentStep={proofRegistered ? 3 : 1} /><div className="grid gap-6 lg:grid-cols-[.9fr_1.1fr]"><article className="yape-card"><div className="yape-brand"><img src="/yape-logo.png" alt="Yape" /><span>Reserva con Yape</span></div><span className="yape-label">Solicitud reservada temporalmente</span><h3>{reservation.tour.title}</h3><p>{reservation.customer.fullName} · {reservation.peopleCount} viajero(s)</p><div className="reservation-price"><small>Monto de separación</small><strong>S/ {reservationAmount}.00</strong></div><div className="payment-code"><div><small>Código único de reserva</small><strong>{paymentCode}</strong></div><button onClick={() => { navigator.clipboard.writeText(paymentCode); setCopied(true); }} aria-label="Copiar código"><Copy size={18} /> {copied ? "Copiado" : "Copiar"}</button></div><div className="secure-note"><ShieldCheck /> <span>La solicitud se mantiene activa por 30 minutos. La confirmación final requiere validar monto, fecha, código y archivo.</span></div>{isDemoMode && proofRegistered && <button type="button" onClick={simulatePayment} className="demo-payment"><Sparkles /><span><strong>Demostración para presentación</strong><small>Simular la aprobación del trabajador</small></span><ArrowRight /></button>}</article><article className="qr-card proof-upload-card"><div className="yape-qr-heading"><img src="/yape-logo.png" alt="Yape" /><span><strong>Registra tu comprobante</strong><small>Proceso seguro y verificable</small></span></div><div className="proof-fields"><label>Código de operación<input value={referenceCode} onChange={(event) => setReferenceCode(event.target.value)} placeholder="Ej. 75709508" /></label><label>Fecha y hora del pago<input type="datetime-local" max={paidAt} value={paidAt} onChange={(event) => setPaidAt(event.target.value)} /></label><label className="proof-file"><FileText /><span><strong>{proofFile?.name ?? "Adjuntar captura o PDF"}</strong><small>JPG, PNG, WebP o PDF · máximo 5 MB</small></span><input type="file" accept=".jpg,.jpeg,.png,.webp,.pdf,image/jpeg,image/png,image/webp,application/pdf" onChange={(event) => setProofFile(event.target.files?.[0])} /></label></div>{proofError && <p className="proof-error">{proofError}</p>}<button type="button" onClick={registerProof} className="proof-submit" disabled={proofPending || proofRegistered}><ShieldCheck /> {isDemoMode && !proofRegistered && !proofPending ? "Probar registro demo" : proofPending ? "Registrando..." : proofRegistered ? "Comprobante registrado" : "Registrar para validación"}</button>{proofRegistered && !isDemoMode && <a href={buildWhatsAppUrl(message)} target="_blank" rel="noreferrer" className="whatsapp-cta"><MessageCircle /> Avisar a un asesor por WhatsApp</a>}{isDemoMode && <p className="demo-message-note"><Sparkles size={16} /> Prueba segura: se usa un comprobante ficticio, no se sube información ni se envían mensajes.</p>}<small>El archivo se valida por contenido y tamaño. Solo el personal autorizado puede visualizarlo.</small></article></div></div></Section>;
}

function appointmentSeparationCode(reservationId: string) {
  return `JT-SEP-${reservationId.slice(-6).toUpperCase()}-${new Date().getFullYear()}`;
}

function buildAppointmentMessage(reservation: Reservation, date: string, time: string, channel: string, subject: string) {
  const formattedDate = date ? new Intl.DateTimeFormat("es-PE", { dateStyle: "long", timeZone: "UTC" }).format(new Date(`${date}T12:00:00Z`)) : "por coordinar";
  return [
    "SOLICITUD DE CITA - JOHNTOURSPERÚ",
    "",
    `Estimados, mi nombre es ${reservation.customer.fullName}. Solicito coordinar una cita para revisar formalmente el paquete ${reservation.tour.title}.`,
    "",
    `Código de separación: ${appointmentSeparationCode(String(reservation.id))}`,
    `Reserva: #${reservation.id}`,
    `Destino: ${reservation.tour.destination}`,
    `Viajeros: ${reservation.peopleCount}`,
    `Fecha de viaje: ${reservation.travelDate || "por confirmar"}`,
    `Monto de separación validado: S/ ${reservationAmount}.00`,
    `Cita solicitada: ${formattedDate} a las ${time || "hora por coordinar"}`,
    `Modalidad: ${channel}`,
    `Tema principal: ${subject}`,
    "",
    "Adjuntaré la boleta o comprobante de separación en este chat para su verificación. Agradezco confirmar la disponibilidad del asesor y las condiciones finales del paquete.",
    "",
    "Quedo atento(a). Muchas gracias."
  ].join("\n");
}

function ReceiptDownload({ reservation }: { reservation: Reservation }) {
  const [generating, setGenerating] = useState(false);
  const isDemo = Boolean(reservation.isDemo);
  const generate = async () => {
    setGenerating(true);
    try {
      await downloadReservationReceipt(reservation, guideForTour(reservation.tour).extras);
    } finally {
      setGenerating(false);
    }
  };
  return (
    <button type="button" onClick={generate} disabled={generating} className="receipt-download mt-7">
      <FileText />
      <span><strong>{generating ? "Generando constancia..." : isDemo ? "Descargar constancia demostrativa" : "Descargar constancia de reserva"}</strong><small>{isDemo ? "PDF de prueba: sin cobro y sin valor tributario" : "PDF con código, resumen económico e itinerario detallado"}</small></span>
      <Download />
    </button>
  );
}

function AppointmentPlanner({ reservation, isDemo }: { reservation: Reservation; isDemo: boolean }) {
  const tomorrow = new Date(Date.now() + 86400000).toISOString().slice(0, 10);
  const [date, setDate] = useState(tomorrow);
  const [time, setTime] = useState("10:00");
  const [channel, setChannel] = useState("Videollamada por WhatsApp");
  const [subject, setSubject] = useState("Revisión del paquete, itinerario y saldo pendiente");
  const [copied, setCopied] = useState(false);
  const message = buildAppointmentMessage(reservation, date, time, channel, subject);
  const copyMessage = async () => { await navigator.clipboard.writeText(message); setCopied(true); };

  return (
    <>
    <ReceiptDownload reservation={reservation} />
    <section className="appointment-planner mt-4 text-left">
      <div className="appointment-heading"><span><CalendarDays /></span><div><small>Siguiente paso después de separar</small><h4>Agenda una cita sobre tu paquete</h4><p>Preparamos un mensaje formal con tu código de separación. En la demostración no se envía nada.</p></div></div>
      <div className="appointment-layout">
        <div className="appointment-fields">
          <label>Fecha preferida<input type="date" min={tomorrow} value={date} onChange={(event) => setDate(event.target.value)} /></label>
          <label>Hora preferida<input type="time" value={time} onChange={(event) => setTime(event.target.value)} /></label>
          <label>Modalidad<select value={channel} onChange={(event) => setChannel(event.target.value)}><option>Videollamada por WhatsApp</option><option>Llamada telefónica</option><option>Atención presencial coordinada</option></select></label>
          <label>Tema de la cita<select value={subject} onChange={(event) => setSubject(event.target.value)}><option>Revisión del paquete, itinerario y saldo pendiente</option><option>Servicios adicionales y personalización</option><option>Documentos, equipaje y recomendaciones</option><option>Coordinación para grupo o familia</option></select></label>
          <div className="appointment-code"><small>Código de separación</small><strong>{appointmentSeparationCode(String(reservation.id))}</strong><span>Inclúyelo junto con la boleta o comprobante.</span></div>
        </div>
        <div className="appointment-preview"><div className="appointment-preview-bar"><img src="/whatsapp-logo.svg" alt="" /><span><strong>Mensaje preparado</strong><small>{isDemo ? "Vista de prueba · no se enviará" : "Revísalo antes de abrir WhatsApp"}</small></span></div><pre>{message}</pre><div className="appointment-actions"><button type="button" onClick={copyMessage}><Copy size={17} /> {copied ? "Mensaje copiado" : "Copiar mensaje"}</button>{!isDemo && <a href={buildWhatsAppUrl(message)} target="_blank" rel="noreferrer"><img src="/whatsapp-logo.svg" alt="" /> Abrir WhatsApp con el mensaje</a>}</div>{isDemo && <p className="demo-message-note"><ShieldCheck size={16} /> Prueba segura: el mensaje solo se visualiza y puede copiarse; no se abre WhatsApp ni se envía automáticamente.</p>}</div>
      </div>
    </section>
    </>
  );
}

function ConfirmationPage() {
  const { id = "" } = useParams();
  const [searchParams] = useSearchParams();
  const isDemo = searchParams.get("demo") === "1";
  const { data: reservation } = useQuery<Reservation>({ queryKey: ["reservation", id], queryFn: async () => { const saved = sessionStorage.getItem(`john-reservation-${id}`); if (!saved) throw new Error("Reserva no encontrada en esta sesión"); return JSON.parse(saved) as Reservation; } });
  const guide = reservation ? guideForTour(reservation.tour) : null;
  return <Section title={isDemo ? "Demostración: reserva confirmada" : "Reserva confirmada"} subtitle={`${isDemo ? "Simulación de presentación · " : ""}Código de reserva #${id}`}>{reservation && guide && <div className="mx-auto max-w-5xl rounded-2xl border bg-white p-6 text-center shadow-sm sm:p-8">{isDemo && <div className="mb-6 rounded-xl border border-cyan-200 bg-cyan-50 p-4 text-sm font-bold text-[#087db8]">Modo demostración: no se realizó ningún cobro ni se registró una operación bancaria. La constancia descargable no es una boleta tributaria.</div>}<CheckCircle2 className="mx-auto text-[#09a889]" size={64} /><h3 className="mt-4 text-2xl font-black text-[#073b83]">{reservation.tour.title}</h3><p className="mt-2 text-slate-600">{isDemo ? `Esta vista simula la aprobación de la separación para ${reservation.customer.fullName}.` : `Gracias, ${reservation.customer.fullName}. La separación de S/ 200 ha sido validada y tu solicitud de reserva quedó registrada.`}</p><PostReservationItinerary tour={reservation.tour} isDemo={isDemo} /><div className="post-payment-guide mx-auto mt-7 overflow-hidden rounded-2xl border border-slate-200 bg-[#f3f9fd] text-left"><img src={guide.imageUrl} alt={`Imagen referencial de ${guide.label}`} className="h-60 w-full object-cover md:h-auto" /><div className="p-5"><span className="text-xs font-black uppercase tracking-widest text-[#087db8]">{isDemo ? "Vista previa del contenido posterior al pago" : "Contenido desbloqueado después del pago"}</span><h4 className="mt-2 text-xl font-black text-[#073b83]">Extras disponibles para {guide.label}</h4><p className="mt-2 text-sm leading-6 text-slate-600">Estas opciones no aparecen en el catálogo principal. Se muestran ahora porque tu reserva confirma el interés en adquirir el paquete.</p><div className="mt-4 grid gap-2 sm:grid-cols-2">{guide.extras.map((extra) => <span key={extra} className="flex items-center gap-2 rounded-lg bg-white px-3 py-2 text-sm font-bold text-[#34536b]"><CheckCircle2 size={16} className="text-[#09a889]" />{extra}</span>)}</div><a href={guide.key === "general" ? "/servicios-adicionales-john-tours.pdf" : `/guia-extras-${guide.key}-john-tours.pdf`} download className="download-guide mt-5"><FileText /><span><strong>Descargar guía PDF de {guide.label}</strong><small>Incluye logo, imagen referencial y detalles de cada extra</small></span><Download /></a></div></div><AppointmentPlanner reservation={reservation} isDemo={isDemo} /><div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row"><Link className="rounded-lg bg-[#073b83] px-5 py-3 font-bold text-white" to="/">Volver al inicio</Link><Link className="rounded-lg bg-[#09a889] px-5 py-3 font-bold text-white" to="/tours">Ver otros paquetes</Link></div></div>}</Section>;
}

function PostReservationItinerary({ tour, isDemo }: { tour: Tour; isDemo: boolean }) {
  const variants = itineraryVariantsFor(tour.slug);
  const [selectedId, setSelectedId] = useState(variants[0]?.id ?? "");
  const selected = variants.find((variant) => variant.id === selectedId) ?? variants[0];
  const itinerary = selected?.days ?? (tour.itinerary?.length ? tour.itinerary : ["El asesor completará el programa final según la fecha confirmada."]);
  return <section className="unlocked-itinerary"><div className="unlocked-itinerary-heading"><span><FileText /></span><div><small>{isDemo ? "Vista demo del contenido reservado" : "Contenido privado de tu reserva"}</small><h4>Itinerarios detallados desbloqueados</h4><p>Programas consolidados desde los documentos operativos de JohnToursPerú. Los horarios, servicios y orden final se reconfirman con el asesor.</p></div></div>{variants.length > 1 && <div className="itinerary-variant-picker" role="tablist" aria-label="Modalidades de itinerario">{variants.map((variant) => <button key={variant.id} type="button" role="tab" aria-selected={selected?.id === variant.id} onClick={() => setSelectedId(variant.id)}><span>{variant.duration}</span><strong>{variant.title}</strong></button>)}</div>} {selected && <div className="selected-itinerary-title"><MapPin size={17} /><span><small>{selected.region} · {selected.sourceGroup}</small><strong>{selected.title}</strong></span></div>}<ol>{itinerary.map((item, index) => <li key={`${index}-${item}`}><b>{index + 1}</b><span>{item}</span></li>)}</ol><div className="unlocked-service-grid"><article><strong>Incluye</strong>{(tour.includes ?? []).map((item) => <span key={item}><CheckCircle2 size={15} />{item}</span>)}</article><article><strong>No incluye</strong>{(tour.excludes ?? []).map((item) => <span key={item}><ShieldCheck size={15} />{item}</span>)}</article></div></section>;
}

function AdminPage() {
  const [token, setToken] = useState(sessionStorage.getItem("adminToken"));
  const [staffRole, setStaffRole] = useState<"ADMIN" | "WORKER">((sessionStorage.getItem("staffRole") as "ADMIN" | "WORKER") || "ADMIN");
  const [tourForm, setTourForm] = useState<AdminTourForm>(emptyAdminTourForm);
  const form = useForm<{ email: string; password: string }>({ defaultValues: { email: "", password: "" } });
  const queryClient = useQueryClient();
  const login = useMutation({
    mutationFn: async (values: { email: string; password: string }) => {
      try {
        return (await api.post("/auth/login", values)).data;
      } catch (error) {
        if (!isDemoMode) throw error;
        const account = demoStaffAccounts.find((candidate) => candidate.email === values.email.trim().toLowerCase() && candidate.password === values.password);
        if (!account) throw error;
        return { token: `demo-${account.role.toLowerCase()}-session`, user: { id: account.role === "ADMIN" ? 1 : 2, name: account.role === "ADMIN" ? "Administrador demo" : "Trabajador demo", email: account.email, role: account.role } };
      }
    },
    onSuccess: (data) => {
      sessionStorage.setItem("adminToken", data.token);
      sessionStorage.setItem("staffRole", data.user.role);
      setToken(data.token);
      setStaffRole(data.user.role);
      queryClient.invalidateQueries();
    }
  });
  const tours = useQuery<Tour[]>({
    enabled: Boolean(token),
    queryKey: ["adminTours", token],
    queryFn: async () => {
      try {
        return (await api.get("/tours")).data;
      } catch {
        return demoTours;
      }
    }
  });
  const reservations = useQuery<Reservation[]>({
    enabled: Boolean(token),
    queryKey: ["adminReservations", token],
    queryFn: async () => {
      try {
        return (await api.get("/reservations")).data;
      } catch {
        return token?.startsWith("demo-") ? [demoReservation] : [];
      }
    }
  });
  const payments = useQuery<Payment[]>({
    enabled: Boolean(token),
    queryKey: ["adminPayments", token],
    queryFn: async () => {
      try {
        return (await api.get("/payments")).data;
      } catch {
        return token?.startsWith("demo-") ? [demoPayment] : [];
      }
    }
  });
  const resetTourForm = () => setTourForm(emptyAdminTourForm);
  const startEditTour = (tour: Tour) => setTourForm({
    id: tour.id,
    title: tour.title,
    destination: tour.destination,
    description: tour.description ?? "",
    price: String(tour.price),
    currency: tour.currency ?? tourCurrency(tour),
    paymentMode: tour.paymentMode ?? "FULL",
    depositPercent: String(tour.depositPercent ?? ""),
    duration: tour.duration ?? "",
    type: tour.type,
    availableSlots: String(tour.availableSlots),
    imageUrl: tour.imageUrl ?? "",
    imageCredit: tour.imageCredit ?? "",
    isFeatured: tour.isFeatured,
    status: tour.status,
    itineraryText: textFromList(tour.itinerary),
    includesText: textFromList(tour.includes),
    excludesText: textFromList(tour.excludes)
  });
  const saveTour = useMutation({
    mutationFn: async () => {
      const payload = {
        title: tourForm.title,
        destination: tourForm.destination,
        description: tourForm.description,
        price: Number(tourForm.price),
        currency: tourForm.currency,
        paymentMode: tourForm.paymentMode,
        depositPercent: tourForm.paymentMode === "DEPOSIT" ? Number(tourForm.depositPercent) : null,
        duration: tourForm.duration,
        type: tourForm.type,
        availableSlots: Number(tourForm.availableSlots),
        imageUrl: tourForm.imageUrl || null,
        imageCredit: tourForm.imageCredit || null,
        isFeatured: tourForm.isFeatured,
        status: tourForm.status,
        itinerary: listFromText(tourForm.itineraryText),
        includes: listFromText(tourForm.includesText),
        excludes: listFromText(tourForm.excludesText)
      };
      try {
        return tourForm.id ? (await api.put(`/tours/${tourForm.id}`, payload)).data : (await api.post("/tours", payload)).data;
      } catch {
        return {
          ...payload,
          id: tourForm.id ?? Date.now(),
          slug: tourForm.title.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")
        };
      }
    },
    onSuccess: (savedTour: Tour) => {
      queryClient.setQueryData<Tour[]>(["adminTours", token], (current = demoTours) => {
        const exists = current.some((tour) => tour.id === savedTour.id);
        return exists ? current.map((tour) => tour.id === savedTour.id ? savedTour : tour) : [savedTour, ...current];
      });
      queryClient.setQueryData<Tour[]>(["tours", undefined], (current = demoTours) => {
        const exists = current.some((tour) => tour.id === savedTour.id);
        return exists ? current.map((tour) => tour.id === savedTour.id ? savedTour : tour) : [savedTour, ...current];
      });
      resetTourForm();
    }
  });
  const deleteTour = useMutation({
    mutationFn: async (id: number) => {
      try {
        await api.delete(`/tours/${id}`);
      } catch {
        // Demo mode on Vercel: update local query cache when the API is unavailable.
      }
      return id;
    },
    onSuccess: (id) => {
      queryClient.setQueryData<Tour[]>(["adminTours", token], (current = demoTours) => current.filter((tour) => tour.id !== id));
      queryClient.setQueryData<Tour[]>(["tours", undefined], (current = demoTours) => current.filter((tour) => tour.id !== id));
    }
  });
  if (!token) return <Section title="Acceso interno" subtitle="Inicio de sesión exclusivo para administradores y trabajadores de JohnToursPerú."><div className="internal-login-layout"><aside><span><ShieldCheck /></span><small>Panel protegido</small><h3>Operación organizada y con permisos</h3><p>Los administradores gestionan tours y configuración. Los trabajadores revisan reservas y validan comprobantes Yape.</p><ul><li>Sesión privada y temporal</li><li>Permisos separados por rol</li><li>Acciones de pago registradas</li></ul></aside><form onSubmit={form.handleSubmit((v) => login.mutate(v))}><div className="internal-login-heading"><strong>Iniciar sesión</strong><small>Usa la cuenta asignada por JohnToursPerú</small></div>{isDemoMode && <div className="demo-mode-banner"><Sparkles size={18} /><span><strong>Panel de demostración</strong><small>Las cuentas de prueba solo controlan datos ficticios de esta presentación.</small></span></div>}<label>Correo corporativo<input placeholder="nombre@johntours.pe" autoComplete="username" {...form.register("email")} /></label><label>Contraseña<input type="password" placeholder="••••••••••••" autoComplete="current-password" {...form.register("password")} /></label>{login.isError && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm font-bold text-red-700">Credenciales inválidas o servicio no disponible.</p>}<button disabled={login.isPending}>{login.isPending ? "Verificando acceso..." : "Ingresar al panel"}</button><Link to="/" className="internal-login-back">Volver a la web pública</Link></form></div></Section>;
  if (staffRole === "WORKER") return <Section title="Panel de operaciones" subtitle="Validación de reservas, salidas y comprobantes Yape."><button onClick={() => { sessionStorage.removeItem("adminToken"); sessionStorage.removeItem("staffRole"); setToken(null); }} className="mb-5 inline-flex items-center gap-2 rounded-lg border bg-white px-4 py-2 font-bold"><LogOut size={18} /> Salir</button><div className="mb-6 grid gap-4 md:grid-cols-3"><AdminMetric label="Reservas" value={String(reservations.data?.length ?? 0)} /><AdminMetric label="Pagos" value={String(payments.data?.length ?? 0)} /><AdminMetric label="Rol" value="Asesor" /></div><DepartureOperations tours={tours.data ?? []} token={token} canCreate={false} /><div className="grid gap-6 lg:grid-cols-2"><ReservationsQueue reservations={reservations.data ?? []} token={token} /><PaymentsQueue payments={payments.data ?? []} token={token} /></div></Section>;
  return (
    <Section title="Panel administrativo" subtitle="Gestion de reservas, pagos y operaciones.">
      <button onClick={() => { sessionStorage.removeItem("adminToken"); sessionStorage.removeItem("staffRole"); setToken(null); }} className="mb-5 inline-flex items-center gap-2 rounded-lg border bg-white px-4 py-2 font-bold"><LogOut size={18} /> Salir</button>
      <div className="mb-6 grid gap-4 md:grid-cols-4">
        <AdminMetric label="Tours activos" value={String(tours.data?.length ?? 0)} />
        <AdminMetric label="Reservas" value={String(reservations.data?.length ?? 0)} />
        <AdminMetric label="Pagos" value={String(payments.data?.length ?? 0)} />
        <AdminMetric label="Modo reserva" value="Yape + validación" />
      </div>
      <DepartureOperations tours={tours.data ?? []} token={token} canCreate />
      <BusinessSettingsPanel />
      <div className="mb-6 grid gap-6 xl:grid-cols-[.95fr_1.05fr]">
        <form onSubmit={(event) => { event.preventDefault(); saveTour.mutate(); }} className="rounded-lg border bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center justify-between gap-3">
            <h3 className="text-xl font-black text-[#082447]">{tourForm.id ? "Editar tour" : "Crear tour"}</h3>
            {tourForm.id && <button type="button" onClick={resetTourForm} className="rounded-lg border px-3 py-2 text-sm font-bold">Nuevo</button>}
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <AdminField label="Titulo" value={tourForm.title} onChange={(value) => setTourForm({ ...tourForm, title: value })} required />
            <AdminField label="Destino" value={tourForm.destination} onChange={(value) => setTourForm({ ...tourForm, destination: value })} required />
            <AdminField label={`Precio (${tourForm.type === "NACIONAL" ? "soles" : "USD"})`} type="number" value={tourForm.price} onChange={(value) => setTourForm({ ...tourForm, price: value })} required />
            <label className="grid gap-1 text-sm font-bold text-slate-700">Moneda<select className="rounded-lg border px-3 py-3" value={tourForm.currency} onChange={(event) => setTourForm({ ...tourForm, currency: event.target.value as "PEN" | "USD" })}><option value="PEN">Soles (PEN)</option><option value="USD">Dolares (USD)</option></select></label>
            <label className="grid gap-1 text-sm font-bold text-slate-700">Modalidad de pago<select className="rounded-lg border px-3 py-3" value={tourForm.paymentMode} onChange={(event) => setTourForm({ ...tourForm, paymentMode: event.target.value as "FULL" | "DEPOSIT" })}><option value="FULL">Pago total</option><option value="DEPOSIT">Adelanto</option></select></label>
            {tourForm.paymentMode === "DEPOSIT" && <AdminField label="Adelanto (%)" type="number" value={tourForm.depositPercent} onChange={(value) => setTourForm({ ...tourForm, depositPercent: value })} required />}
            <AdminField label="Duración" value={tourForm.duration} onChange={(value) => setTourForm({ ...tourForm, duration: value })} />
            <AdminField label="Capacidad interna" type="number" value={tourForm.availableSlots} onChange={(value) => setTourForm({ ...tourForm, availableSlots: value })} />
            <label className="grid gap-1 text-sm font-bold text-slate-700">Tipo<select className="rounded-lg border px-3 py-3" value={tourForm.type} onChange={(event) => setTourForm({ ...tourForm, type: event.target.value as TourType })}><option value="NACIONAL">Nacional</option><option value="INTERNACIONAL">Internacional</option></select></label>
            <label className="grid gap-1 text-sm font-bold text-slate-700">Estado<select className="rounded-lg border px-3 py-3" value={tourForm.status} onChange={(event) => setTourForm({ ...tourForm, status: event.target.value as TourStatus })}><option value="ACTIVO">Activo</option><option value="INACTIVO">Inactivo</option></select></label>
            <label className="flex items-center gap-2 rounded-lg border px-3 py-3 text-sm font-bold text-slate-700"><input type="checkbox" checked={tourForm.isFeatured} onChange={(event) => setTourForm({ ...tourForm, isFeatured: event.target.checked })} /> Destacado</label>
          </div>
          <AdminField label="Imagen URL" value={tourForm.imageUrl} onChange={(value) => setTourForm({ ...tourForm, imageUrl: value })} />
          <AdminField label="Credito o licencia de imagen" value={tourForm.imageCredit} onChange={(value) => setTourForm({ ...tourForm, imageCredit: value })} />
          <label className="mt-3 grid gap-1 text-sm font-bold text-slate-700">Descripción<textarea className="min-h-24 rounded-lg border px-3 py-3" value={tourForm.description} onChange={(event) => setTourForm({ ...tourForm, description: event.target.value })} /></label>
          <div className="mt-3 grid gap-3 md:grid-cols-3">
            <AdminTextArea label="Itinerario" value={tourForm.itineraryText} onChange={(value) => setTourForm({ ...tourForm, itineraryText: value })} />
            <AdminTextArea label="Incluye" value={tourForm.includesText} onChange={(value) => setTourForm({ ...tourForm, includesText: value })} />
            <AdminTextArea label="No incluye" value={tourForm.excludesText} onChange={(value) => setTourForm({ ...tourForm, excludesText: value })} />
          </div>
          <button className="mt-5 w-full rounded-lg bg-[#082447] px-5 py-3 font-black text-white" disabled={saveTour.isPending}>{saveTour.isPending ? "Guardando..." : tourForm.id ? "Actualizar tour" : "Crear tour"}</button>
        </form>
        <div className="rounded-lg border bg-white p-6 shadow-sm">
          <h3 className="mb-4 text-xl font-black text-[#082447]">Tours administrables</h3>
          <div className="grid max-h-[720px] gap-3 overflow-y-auto pr-1">
            {(tours.data ?? []).map((tour) => (
              <article key={tour.id} className="grid gap-3 rounded-lg border p-3 sm:grid-cols-[110px_1fr_auto]">
                <img src={tour.imageUrl} alt={tour.title} className="h-24 w-full rounded-lg object-cover sm:w-28" />
                <div>
                  <strong className="text-[#082447]">{tour.title}</strong>
                  <p className="text-sm text-slate-600">{tour.destination} · {tour.duration}</p>
                  <p className="text-sm font-bold text-[#0f7a4f]">{tourMoney(tour)} · {tour.type} · {tour.status}</p>
                </div>
                <div className="flex gap-2 sm:flex-col">
                  <button type="button" onClick={() => startEditTour(tour)} className="rounded-lg border px-3 py-2 text-sm font-bold">Editar</button>
                  <button type="button" onClick={() => deleteTour.mutate(tour.id)} className="rounded-lg bg-red-50 px-3 py-2 text-sm font-bold text-red-700" disabled={deleteTour.isPending}>Desactivar</button>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <ReservationsQueue reservations={reservations.data ?? []} token={token} />
        <PaymentsQueue payments={payments.data ?? []} token={token} />
      </div>
      <div className="mt-6 rounded-lg border bg-white p-6 shadow-sm"><h3 className="mb-3 flex items-center gap-2 text-xl font-black text-[#082447]"><LayoutDashboard /> Operación lista</h3><p className="text-slate-600">El panel ya usa POST, PUT y DELETE protegidos con JWT para manejar tours desde la interfaz.</p></div>
    </Section>
  );
}

function DepartureOperations({ tours, token, canCreate }: { tours: Tour[]; token: string; canCreate: boolean }) {
  const queryClient = useQueryClient();
  const [tourId, setTourId] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [capacity, setCapacity] = useState("12");
  const alerts = tours.flatMap((tour) => (tour.departures ?? []).map((departure) => ({ tour, departure, urgency: departureUrgency(departure) }))).filter((item) => item.urgency);
  const create = useMutation({
    mutationFn: async () => {
      const payload = { startDate, endDate: endDate || null, capacity: Number(capacity), status: "ACTIVO" };
      if (!token.startsWith("demo-")) return (await api.post(`/tours/${tourId}/departures`, payload)).data as TourDeparture;
      return { id: Date.now(), startDate, endDate, capacity: Number(capacity), availableSlots: Number(capacity), status: "ACTIVO" } as TourDeparture;
    },
    onSuccess: (departure) => {
      queryClient.setQueryData<Tour[]>(["adminTours", token], (current = []) => current.map((tour) => tour.id === Number(tourId) ? { ...tour, departures: [...(tour.departures ?? []), departure].sort((a, b) => a.startDate.localeCompare(b.startDate)) } : tour));
      setStartDate(""); setEndDate(""); setCapacity("12");
    }
  });
  return <section className="departure-operations">
    <div className="departure-alerts"><div><small>Alertas operativas</small><h3>Salidas próximas</h3></div><span>{alerts.length}</span></div>
    <div className="departure-alert-list">{alerts.slice(0, 6).map(({ tour, departure, urgency }) => <article key={`${tour.id}-${departure.id}`}><CalendarDays /><div><strong>{tour.title}</strong><small>{new Intl.DateTimeFormat("es-PE", { dateStyle: "medium" }).format(departureDate(departure.startDate))}</small></div><em data-tone={urgency?.tone}>{urgency?.label}</em></article>)}{!alerts.length && <p>Sin alertas activas.</p>}</div>
    {canCreate && <form onSubmit={(event) => { event.preventDefault(); create.mutate(); }}>
      <label>Tour<select required value={tourId} onChange={(event) => setTourId(event.target.value)}><option value="">Seleccionar</option>{tours.map((tour) => <option key={tour.id} value={tour.id}>{tour.title}</option>)}</select></label>
      <label>Inicio<input type="date" required value={startDate} onChange={(event) => setStartDate(event.target.value)} /></label>
      <label>Fin<input type="date" min={startDate} value={endDate} onChange={(event) => setEndDate(event.target.value)} /></label>
      <label>Capacidad<input type="number" min="1" required value={capacity} onChange={(event) => setCapacity(event.target.value)} /></label>
      <button disabled={create.isPending}>{create.isPending ? "Guardando..." : "Programar salida"}</button>
    </form>}
  </section>;
}

function AdminMetric({ label, value }: { label: string; value: string }) {
  return <div className="rounded-lg border bg-white p-5 shadow-sm"><span className="text-sm font-bold uppercase text-slate-500">{label}</span><strong className="mt-2 block text-2xl text-[#082447]">{value}</strong></div>;
}

function ReservationsQueue({ reservations, token }: { reservations: Reservation[]; token: string }) {
  const queryClient = useQueryClient();
  const cancel = useMutation({
    mutationFn: async (id: number) => token.startsWith("demo-") ? { id } : (await api.patch(`/reservations/${id}/cancel`, {}, { headers: { Authorization: `Bearer ${token}` } })).data,
    onSuccess: (_data, id) => {
      if (token.startsWith("demo-")) {
        queryClient.setQueryData<Reservation[]>(["adminReservations", token], (current = []) => current.map((reservation) => reservation.id === id ? { ...reservation, status: "CANCELADA" } : reservation));
        return;
      }
      queryClient.invalidateQueries({ queryKey: ["adminReservations"] });
    }
  });
  return (
    <section className="admin-queue">
      <h3>Reservas</h3>
      <div>
        {reservations.map((reservation) => <article key={reservation.id}><div><span className={`status-badge status-${reservation.status.toLowerCase()}`}>{reservation.status}</span><strong>#{reservation.id} · {reservation.customer.fullName}</strong><p>{reservation.tour.title} · {reservation.peopleCount} viajero(s) · {tourMoney(reservation.tour, reservation.totalAmount)}</p></div>{reservation.status !== "CANCELADA" && <button type="button" onClick={() => cancel.mutate(reservation.id)} disabled={cancel.isPending}>Cancelar</button>}</article>)}
        {!reservations.length && <p className="admin-empty">Aún no hay reservas registradas.</p>}
      </div>
    </section>
  );
}

function PaymentsQueue({ payments, token }: { payments: Payment[]; token: string }) {
  const queryClient = useQueryClient();
  const decide = useMutation({
    mutationFn: async ({ id, decision }: { id: number; decision: "confirm" | "reject" }) => token.startsWith("demo-") ? { id, decision } : (await api.patch(`/payments/${id}/${decision}`, {}, { headers: { Authorization: `Bearer ${token}` } })).data,
    onSuccess: (_data, variables) => {
      if (token.startsWith("demo-")) {
        const paid = variables.decision === "confirm";
        queryClient.setQueryData<Payment[]>(["adminPayments", token], (current = []) => current.map((payment) => payment.id === variables.id ? { ...payment, status: paid ? "EXITOSO" : "RECHAZADO", validatedAt: new Date().toISOString(), validatedBy: { name: "Trabajador demo", email: "trabajador.demo@johntours.pe" }, audits: [...(payment.audits ?? []), { id: Date.now(), action: paid ? "APPROVED" : "REJECTED", createdAt: new Date().toISOString(), actor: { name: "Trabajador demo", email: "trabajador.demo@johntours.pe" } }] } : payment));
        queryClient.setQueryData<Reservation[]>(["adminReservations", token], (current = []) => current.map((reservation) => reservation.id === demoReservation.id ? { ...reservation, status: paid ? "PAGADA" : "RECHAZADA" } : reservation));
        return;
      }
      queryClient.invalidateQueries({ queryKey: ["adminPayments"] });
      queryClient.invalidateQueries({ queryKey: ["adminReservations"] });
      queryClient.invalidateQueries({ queryKey: ["adminTours"] });
    }
  });
  const openProof = async (payment: Payment) => {
    if (token.startsWith("demo-")) return;
    const response = await api.get(`/payments/${payment.id}/proof`, { responseType: "blob" });
    const url = URL.createObjectURL(response.data);
    window.open(url, "_blank", "noopener,noreferrer");
    window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
  };
  return (
    <section className="admin-queue">
      <h3>Validación de pagos Yape</h3>
      <div>
        {payments.map((payment) => <article key={payment.id} className="payment-review"><div><span className={`status-badge status-${payment.status.toLowerCase()}`}>{payment.status}</span><strong>Pago #{payment.id} · {payment.externalReference ?? "Sin referencia"}</strong><p>{payment.reservation?.customer.fullName} · {paymentMoney(payment)} · {payment.paidAt ? new Intl.DateTimeFormat("es-PE", { dateStyle: "short", timeStyle: "short" }).format(new Date(payment.paidAt)) : "Fecha no registrada"}</p>{payment.validatedBy && <p>Validado por {payment.validatedBy.name}</p>}<div className="payment-history">{payment.audits?.map((audit) => <small key={audit.id}>{({ SUBMITTED: "Enviado", APPROVED: "Aprobado", REJECTED: "Rechazado", CANCELLED: "Cancelado", HOLD_EXPIRED: "Bloqueo vencido" } as const)[audit.action]} · {new Intl.DateTimeFormat("es-PE", { dateStyle: "short", timeStyle: "short" }).format(new Date(audit.createdAt))}{audit.actor ? ` · ${audit.actor.name}` : ""}</small>)}</div></div><div className="admin-actions">{payment.proof && <button type="button" onClick={() => openProof(payment)}>Ver archivo</button>}{payment.status === "PENDIENTE" && <><button type="button" onClick={() => decide.mutate({ id: payment.id, decision: "confirm" })} disabled={decide.isPending}>Confirmar</button><button type="button" onClick={() => decide.mutate({ id: payment.id, decision: "reject" })} disabled={decide.isPending}>Rechazar</button></>}</div></article>)}
        {!payments.length && <p className="admin-empty">No hay comprobantes pendientes.</p>}
      </div>
    </section>
  );
}

const blankSettings: BusinessSettings = { tradeName: "JohnToursPerú", policiesPublished: false };

function BusinessSettingsPanel() {
  const [settings, setSettings] = useState<BusinessSettings>(blankSettings);
  const query = useQuery<BusinessSettings>({ queryKey: ["businessSettings"], queryFn: async () => (await api.get("/settings")).data });
  useEffect(() => { if (query.data) setSettings(query.data); }, [query.data]);
  const save = useMutation({ mutationFn: async () => (await api.put("/settings", settings)).data, onSuccess: setSettings });
  const field = (key: keyof BusinessSettings, label: string, type = "input") => (
    <label className="grid gap-1 text-sm font-bold text-slate-700">{label}{type === "textarea"
      ? <textarea className="min-h-28 rounded-lg border px-3 py-3" value={String(settings[key] ?? "")} onChange={(event) => setSettings({ ...settings, [key]: event.target.value })} />
      : <input className="rounded-lg border px-3 py-3" value={String(settings[key] ?? "")} onChange={(event) => setSettings({ ...settings, [key]: event.target.value })} />}</label>
  );
  return <form onSubmit={(event) => { event.preventDefault(); save.mutate(); }} className="mb-6 rounded-lg border bg-white p-6 shadow-sm">
    <h3 className="text-xl font-black text-[#082447]">Datos reales y documentos legales</h3>
    <p className="mb-5 mt-2 text-sm text-slate-600">Guarda borradores libremente. La web solo los muestra al activar “Publicar políticas”, y validará que estén completos.</p>
    <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">{field("tradeName", "Nombre comercial")}{field("legalName", "Razón social")}{field("taxId", "RUC / identificación fiscal")}{field("address", "Dirección")}{field("supportEmail", "Correo de atención")}{field("whatsappNumber", "WhatsApp")}{field("domain", "Dominio (https://...)")}{field("complaintsBookUrl", "URL del Libro de Reclamaciones")}</div>
    <div className="mt-4 grid gap-3 md:grid-cols-2">{field("cancellationPolicy", "Política de cancelación y cambios", "textarea")}{field("refundPolicy", "Política de reembolsos", "textarea")}{field("terms", "Términos y condiciones", "textarea")}{field("privacyPolicy", "Política de privacidad", "textarea")}{field("cookiePolicy", "Política de cookies", "textarea")}</div>
    <label className="mt-4 flex items-center gap-2 font-bold"><input type="checkbox" checked={settings.policiesPublished} onChange={(event) => setSettings({ ...settings, policiesPublished: event.target.checked })} /> Publicar políticas validadas</label>
    {save.isError && <p className="mt-3 rounded-lg bg-red-50 p-3 text-sm font-bold text-red-700">No se pudo guardar. Si intentas publicar, completa todos los campos obligatorios.</p>}
    {save.isSuccess && <p className="mt-3 text-sm font-bold text-emerald-700">Configuración guardada.</p>}
    <button className="mt-4 rounded-lg bg-[#082447] px-5 py-3 font-black text-white" disabled={save.isPending}>Guardar configuración</button>
  </form>;
}

function AdminField({ label, value, onChange, type = "text", required = false }: { label: string; value: string; onChange: (value: string) => void; type?: string; required?: boolean }) {
  return <label className="grid gap-1 text-sm font-bold text-slate-700">{label}<input className="rounded-lg border px-3 py-3" type={type} value={value} onChange={(event) => onChange(event.target.value)} required={required} /></label>;
}

function AdminTextArea({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return <label className="grid gap-1 text-sm font-bold text-slate-700">{label}<textarea className="min-h-32 rounded-lg border px-3 py-3" value={value} onChange={(event) => onChange(event.target.value)} /></label>;
}

function Section({ title, subtitle, children }: { title: string; subtitle: string; children?: React.ReactNode }) {
  return <section className="section-pro px-4 py-14 lg:px-6"><div className="mx-auto max-w-7xl"><div className="mb-8 max-w-3xl"><p className="mb-2 inline-flex items-center gap-2 rounded-lg bg-emerald-50 px-3 py-1 text-sm font-bold text-[#0f7a4f]"><ShieldCheck size={16} /> JohnToursPerú</p><h2 className="text-3xl font-black text-[#082447] md:text-4xl">{title}</h2><p className="mt-3 leading-7 text-slate-600">{subtitle}</p></div>{children}</div></section>;
}

function Info({ title, items, ordered = false }: { title: string; items: string[]; ordered?: boolean }) {
  const List = ordered ? "ol" : "ul";
  return <div className="rounded-lg border bg-white p-6 shadow-sm"><h3 className="mb-4 text-xl font-black text-[#082447]">{title}</h3><List className="space-y-3 text-slate-600">{items.map((item) => <li key={item} className="leading-7">{item}</li>)}</List></div>;
}

function LegalPage() {
  const { section = "terms" } = useParams();
  const { data } = useQuery<BusinessSettings>({ queryKey: ["publicSettings"], queryFn: async () => (await api.get("/settings/public")).data });
  const content: Record<string, [string, keyof BusinessSettings]> = {
    terminos: ["Términos y condiciones", "terms"], privacidad: ["Política de privacidad", "privacyPolicy"],
    cookies: ["Política de cookies", "cookiePolicy"], cancelaciones: ["Cancelaciones y cambios", "cancellationPolicy"],
    reembolsos: ["Política de reembolsos", "refundPolicy"]
  };
  const [title, key] = content[section] ?? content.terminos;
  if (!data?.policiesPublished) return <Section title={title} subtitle="Documento pendiente de validación empresarial"><div className="rounded-lg border border-amber-200 bg-amber-50 p-5 text-amber-900">Esta política aún no ha sido publicada. Comunícate con la agencia para recibir las condiciones aplicables antes de reservar.</div></Section>;
  return <Section title={title} subtitle={`Información oficial de ${data.tradeName}`}><article className="whitespace-pre-wrap rounded-lg border bg-white p-6 leading-8 text-slate-700 shadow-sm">{String(data[key] ?? "")}</article></Section>;
}

export default TourApplication;
