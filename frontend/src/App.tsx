import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowRight, Award, CalendarDays, Camera, CheckCircle2, Clock3, CreditCard, Filter, Globe2, HeartHandshake, Hotel, LayoutDashboard, LogOut, MapPin, Menu, MessageCircle, Plane, Search, ShieldCheck, Sparkles, Star, UsersRound, WalletCards, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { api } from "./api/client";
import { Link, NavLink, Route, Routes, useNavigate, useParams, useSearchParams } from "./routing";
import type { Payment, Reservation, Tour, TourStatus, TourType } from "./types";

declare global {
  interface Window {
    CulqiCheckout?: new (publicKey: string, config: unknown) => { open: () => void };
    Culqi?: {
      publicKey?: string;
      token?: { id: string };
      error?: { user_message?: string; merchant_message?: string };
      settings?: (settings: unknown) => void;
      options?: (options: unknown) => void;
      open?: () => void;
      close?: () => void;
    };
    culqi?: () => void;
  }
}

const money = (value: string | number, currency: "PEN" | "USD" = "USD") =>
  new Intl.NumberFormat("es-PE", { currency, maximumFractionDigits: 0, style: "currency" }).format(Number(value));
const tourCurrency = (tour: Pick<Tour, "type">) => tour.type === "NACIONAL" ? "PEN" : "USD";
const tourMoney = (tour: Pick<Tour, "price" | "type">, value: string | number = tour.price) => money(value, tourCurrency(tour));
const paymentMoney = (payment: Payment) => payment.reservation?.tour ? tourMoney(payment.reservation.tour, payment.amount) : money(payment.amount);
const whatsapp = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "51945342536";
const whatsappDisplay = "+51 945 342 536";
const culqiPublicKey = process.env.NEXT_PUBLIC_CULQI_PUBLIC_KEY ?? "pk_test_xxxxxxxxxxxxxxxxx";
const isCulqiKeyConfigured = /^pk_(test|live)_[A-Za-z0-9]+/.test(culqiPublicKey) && !culqiPublicKey.includes("xxxxxxxx");

const destinationImage = (id: string) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=1400&q=85`;

const buildWhatsAppUrl = (message: string) => `https://wa.me/${whatsapp}?text=${encodeURIComponent(message)}`;
const whatsappMessages = {
  general: "Hola Jhon Tours, deseo informacion para cotizar un viaje.",
  tour: (tour: Tour) => `Hola Jhon Tours, deseo cotizar el tour ${tour.title} para ${tour.destination}.`,
  reservation: (reservation: Reservation) => `Hola Jhon Tours, deseo confirmar mi reserva #${reservation.id} para ${reservation.tour.title}.`
};

function createPaymentSeed(reservationId: string) {
  const random = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `JHON-${reservationId || "DEMO"}-${Date.now().toString(36).toUpperCase()}-${random}`;
}

function pseudoQrSvg(seed: string) {
  const size = 29;
  const cell = 7;
  const quiet = 3;
  const total = (size + quiet * 2) * cell;
  let hash = 2166136261;
  for (const char of seed) {
    hash ^= char.charCodeAt(0);
    hash = Math.imul(hash, 16777619);
  }
  const isDark = (x: number, y: number) => {
    const finder = (fx: number, fy: number) => x >= fx && x < fx + 7 && y >= fy && y < fy + 7;
    if (finder(0, 0) || finder(size - 7, 0) || finder(0, size - 7)) {
      const localX = x % (size - 7) % 7;
      const localY = y % (size - 7) % 7;
      return localX === 0 || localX === 6 || localY === 0 || localY === 6 || (localX >= 2 && localX <= 4 && localY >= 2 && localY <= 4);
    }
    const value = Math.imul(x + 11, 1103515245) ^ Math.imul(y + 17, 12345) ^ hash;
    return ((value >>> ((x + y) % 13)) & 1) === 1;
  };
  const blocks = Array.from({ length: size }, (_, y) =>
    Array.from({ length: size }, (_, x) =>
      isDark(x, y) ? `<rect x="${(x + quiet) * cell}" y="${(y + quiet) * cell}" width="${cell}" height="${cell}" rx="1" />` : ""
    ).join("")
  ).join("");
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${total}" height="${total}" viewBox="0 0 ${total} ${total}"><rect width="100%" height="100%" fill="#fff"/><g fill="#082447">${blocks}</g></svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

const demoTours: Tour[] = [
  {
    id: 1,
    title: "Machu Picchu",
    slug: "machu-picchu",
    destination: "Cusco, Peru",
    description: "Explora la ciudadela inca, el Valle Sagrado y la magia cultural de Cusco con guias expertos y asistencia permanente.",
    price: 1550,
    duration: "4 dias / 3 noches",
    type: "NACIONAL",
    availableSlots: 18,
    imageUrl: destinationImage("photo-1587595431973-160d0d94add1"),
    isFeatured: true,
    status: "ACTIVO",
    itinerary: ["Recepcion en Cusco y aclimatacion", "Valle Sagrado con guia local", "Ingreso a Machu Picchu", "Retorno asistido a Lima"],
    includes: ["Hotel seleccionado", "Traslados", "Guiado profesional", "Asistencia Jhon Tours"],
    excludes: ["Gastos personales", "Servicios no mencionados"]
  },
  {
    id: 2,
    title: "Disney Orlando",
    slug: "disney-orlando",
    destination: "Orlando, Estados Unidos",
    description: "Vive parques tematicos, compras y experiencias familiares con una ruta clara, segura y organizada.",
    price: 1890,
    duration: "7 dias / 6 noches",
    type: "INTERNACIONAL",
    availableSlots: 12,
    imageUrl: destinationImage("photo-1597466599360-3b9775841aec"),
    isFeatured: true,
    status: "ACTIVO"
  },
  {
    id: 3,
    title: "Oxapampa",
    slug: "oxapampa",
    destination: "Pasco, Peru",
    description: "Naturaleza, cataratas, cafe y tradiciones locales en una escapada de aire puro.",
    price: 950,
    duration: "3 dias / 2 noches",
    type: "NACIONAL",
    availableSlots: 20,
    imageUrl: "https://inforegion.pe/wp-content/uploads/2025/01/baf433a5-dji_20241114093018_0090_d-2.jpg",
    isFeatured: false,
    status: "ACTIVO"
  },
  {
    id: 4,
    title: "Ica y Huacachina",
    slug: "ica-y-huacachina",
    destination: "Ica, Peru",
    description: "Dunas, tubulares, sandboard, bodegas pisqueras y atardeceres inolvidables en el oasis.",
    price: 650,
    duration: "2 dias / 1 noche",
    type: "NACIONAL",
    availableSlots: 25,
    imageUrl: "https://www.stampbystamptravel.com/wp-content/uploads/2025/02/laguna-huacachina-ica.jpg.webp",
    isFeatured: true,
    status: "ACTIVO"
  },
  {
    id: 5,
    title: "Egipto",
    slug: "egipto",
    destination: "El Cairo, Egipto",
    description: "Piramides de Giza, El Cairo historico y crucero por el Nilo con itinerario claro, hoteles seleccionados y acompanamiento en cada etapa.",
    price: 2700,
    duration: "8 dias / 7 noches",
    type: "INTERNACIONAL",
    availableSlots: 10,
    imageUrl: "https://www.barcelo.com/guia-turismo/wp-content/uploads/2022/05/el-cairo1.jpg",
    isFeatured: true,
    status: "ACTIVO",
    itinerary: ["Llegada asistida a El Cairo", "Piramides de Giza y Esfinge con guia", "Museo Egipcio y barrio historico", "Crucero por el Nilo y templos principales", "Retorno con seguimiento del asesor"],
    includes: ["Hoteles seleccionados", "Traslados programados", "Guia especializado en espanol", "Asistencia Jhon Tours por WhatsApp"],
    excludes: ["Vuelos internacionales", "Gastos personales", "Propinas y servicios no mencionados"]
  }
];

const demoTestimonials = [
  { name: "Maria Fernandez", location: "Lima", comment: "La reserva fue rapida, los precios fueron claros y el viaje a Cusco estuvo muy bien organizado.", rating: 5 },
  { name: "Carlos Medina", location: "Trujillo", comment: "Me atendieron por WhatsApp con paciencia y todo el itinerario estuvo explicado antes de pagar.", rating: 5 },
  { name: "Rosa Salazar", location: "Arequipa", comment: "El paquete familiar a Orlando supero nuestras expectativas. Se sintio seguro de inicio a fin.", rating: 5 }
];

function Shell() {
  const [open, setOpen] = useState(false);
  const links = [
    ["Inicio", "/"],
    ["Tours Nacionales", "/tours?type=NACIONAL"],
    ["Tours Internacionales", "/tours?type=INTERNACIONAL"],
    ["Paquetes", "/tours"],
    ["Nosotros", "/#nosotros"],
    ["Contacto", "/#contacto"]
  ];

  return (
    <div className="site-shell min-h-screen">
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 shadow-sm backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 lg:px-6">
          <Link to="/" className="flex items-center gap-3">
            <span className="brand-mark grid h-11 w-11 shrink-0 place-items-center rounded-lg bg-[#082447] text-amber-300"><Plane size={23} /></span>
            <span>
              <strong className="block text-lg leading-tight text-[#082447]">Jhon Tours</strong>
              <small className="text-xs font-semibold uppercase tracking-widest text-slate-500">Agencia de Turismo</small>
            </span>
          </Link>
          <nav className="hidden items-center gap-6 text-sm font-semibold text-slate-700 lg:flex">
            {links.map(([label, to]) => <NavLink key={label} to={to} className="hover:text-[#0f4c81]">{label}</NavLink>)}
          </nav>
          <div className="hidden items-center gap-3 lg:flex">
            <Link to="/admin" className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-bold text-slate-700">Admin</Link>
            <Link to="/tours" className="btn-gold rounded-lg px-5 py-2.5 text-sm font-bold shadow-sm">Reservar ahora</Link>
          </div>
          <button className="rounded-lg border border-slate-200 p-2 lg:hidden" onClick={() => setOpen(!open)} aria-label="Menu">
            {open ? <X /> : <Menu />}
          </button>
        </div>
        {open && (
          <div className="border-t border-slate-200 bg-white px-4 py-4 lg:hidden">
            {links.map(([label, to]) => <Link key={label} to={to} onClick={() => setOpen(false)} className="block rounded-lg px-3 py-3 font-semibold text-slate-700">{label}</Link>)}
            <Link to="/admin" className="mt-2 block rounded-lg bg-slate-100 px-3 py-3 font-semibold">Panel admin</Link>
          </div>
        )}
      </header>
      <main><RoutesView /></main>
      <Footer />
    </div>
  );
}

function RoutesView() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/tours" element={<Tours />} />
      <Route path="/tours/:id" element={<TourDetail />} />
      <Route path="/reservar/:id" element={<ReservationPage />} />
      <Route path="/pago/:id" element={<PaymentPage />} />
      <Route path="/confirmacion/:id" element={<ConfirmationPage />} />
      <Route path="/admin" element={<AdminPage />} />
    </Routes>
  );
}

function useTours(type?: TourType | null) {
  const fallback = type ? demoTours.filter((tour) => tour.type === type) : demoTours;
  return useQuery<Tour[]>({
    queryKey: ["tours", type],
    queryFn: async () => {
      try {
        return (await api.get("/tours", { params: type ? { type } : {} })).data;
      } catch {
        return fallback;
      }
    },
    placeholderData: fallback
  });
}

function TourCard({ tour }: { tour: Tour }) {
  return (
    <article className="tour-card overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl">
      <div className="relative">
        <img src={tour.imageUrl} alt={tour.title} className="h-56 w-full object-cover" />
        <span className="absolute left-4 top-4 rounded-lg bg-white/95 px-3 py-1 text-xs font-black uppercase text-[#082447] shadow-sm">{tour.type}</span>
        <span className="absolute bottom-4 right-4 rounded-lg bg-[#1fa463] px-3 py-1 text-xs font-black text-white">{tour.availableSlots} cupos</span>
      </div>
      <div className="space-y-4 p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="flex items-center gap-1 text-sm font-semibold text-[#0f7a4f]"><MapPin size={16} /> {tour.destination}</p>
            <h3 className="mt-1 text-xl font-bold text-[#082447]">{tour.title}</h3>
          </div>
          <span className="rounded-lg bg-amber-100 px-3 py-1 text-sm font-bold text-amber-700">Top</span>
        </div>
        <p className="line-clamp-2 text-sm leading-6 text-slate-600">{tour.description}</p>
        <div className="grid grid-cols-3 gap-2 text-center text-xs font-bold text-slate-600">
          <span className="rounded-lg bg-slate-50 px-2 py-2"><ShieldCheck className="mx-auto mb-1 text-[#0f7a4f]" size={16} />Seguro</span>
          <span className="rounded-lg bg-slate-50 px-2 py-2"><Hotel className="mx-auto mb-1 text-[#0f4c81]" size={16} />Hotel</span>
          <span className="rounded-lg bg-slate-50 px-2 py-2"><UsersRound className="mx-auto mb-1 text-amber-600" size={16} />Guia</span>
        </div>
        <div className="flex items-center justify-between border-t border-slate-100 pt-4">
          <span className="text-2xl font-black text-[#082447]">{tourMoney(tour)}</span>
          <span className="flex items-center gap-1 text-sm text-slate-500"><CalendarDays size={16} /> {tour.duration}</span>
        </div>
        <Link to={`/tours/${tour.id}`} className="flex items-center justify-center gap-2 rounded-lg bg-[#082447] px-4 py-3 font-bold text-white">Ver detalles <ArrowRight size={18} /></Link>
      </div>
    </article>
  );
}

function Home() {
  const { data: tours = [] } = useTours();
  const featured = tours.filter((tour) => tour.isFeatured).slice(0, 4);
  const types = [
    ["Aventura", "Rutas activas con energia y naturaleza"],
    ["Playa", "Descanso, sol y hoteles seleccionados"],
    ["Cultural", "Historia, guias locales y entradas claras"],
    ["Familiar", "Itinerarios comodos para todas las edades"],
    ["Romantico", "Escapadas cuidadas para dos"],
    ["Lujo", "Experiencias premium y asistencia privada"]
  ];

  return (
    <>
      <section className="hero-bg">
        <div className="mx-auto grid min-h-[calc(100svh-80px)] max-w-7xl items-center gap-8 px-4 py-10 lg:min-h-[660px] lg:grid-cols-[1.05fr_.95fr] lg:gap-10 lg:px-6 lg:py-14">
          <div className="animate-rise max-w-3xl text-white">
            <p className="mb-4 inline-flex items-center gap-2 rounded-lg bg-white/15 px-4 py-2 text-sm font-bold text-amber-100 ring-1 ring-white/20"><Sparkles size={17} /> Viajes organizados con calma y respaldo</p>
            <h1 className="text-3xl font-black leading-tight sm:text-4xl md:text-6xl">Elige tu proximo viaje con confianza</h1>
            <p className="mt-5 max-w-2xl text-base leading-8 text-slate-100 md:text-lg">Tours nacionales e internacionales con itinerarios claros, precios transparentes, pagos seguros y acompanamiento humano desde la cotizacion hasta tu retorno.</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link to="/tours" className="btn-gold rounded-lg px-6 py-3 text-center font-black">Ver tours</Link>
              <a href={buildWhatsAppUrl(whatsappMessages.general)} className="rounded-lg bg-[#1fa463] px-6 py-3 text-center font-black text-white">Cotizar viaje</a>
            </div>
            <div className="mt-8 grid max-w-2xl grid-cols-3 gap-2 sm:gap-3">
              <MiniTrust icon={<ShieldCheck />} value="Pago seguro" label="Culqi, Yape y comprobante" />
              <MiniTrust icon={<Clock3 />} value="Respuesta clara" label="Atencion por WhatsApp" />
              <MiniTrust icon={<HeartHandshake />} value="Viaje acompanado" label="Antes, durante y despues" />
            </div>
          </div>
          <div className="space-y-4 lg:pl-2">
            <div className="hidden lg:block">
              <HeroVisualCarousel tours={featured.length ? featured : tours.slice(0, 4)} />
            </div>
            <SearchBox />
          </div>
        </div>
      </section>
      <TrustBar />
      <ConfidencePanel />
      <DestinationCarousel tours={featured.length ? featured : tours.slice(0, 5)} />
      <ExperienceBand />
      <Section title="Tours destacados" subtitle="Paquetes elegidos para viajar con confianza y asistencia desde la primera cotizacion.">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">{featured.map((tour) => <TourCard key={tour.id} tour={tour} />)}</div>
      </Section>
      <Section title="Tipos de viaje" subtitle="Elige el estilo de experiencia que quieres vivir.">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{types.map(([type, text]) => <div key={type} className="experience-card rounded-lg border border-slate-200 bg-white p-6 shadow-sm"><Globe2 className="mb-4 text-[#0f4c81]" /><strong className="text-lg text-[#082447]">{type}</strong><p className="mt-2 text-sm leading-6 text-slate-600">{text}</p></div>)}</div>
      </Section>
      <Testimonials />
      <section id="contacto" className="formal-cta px-4 py-14 text-white">
        <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-6 lg:flex-row lg:items-center">
          <div><h2 className="text-3xl font-black">Recibe informacion personalizada</h2><p className="mt-2 text-slate-200">Comunicate con un asesor de Jhon Tours al {whatsappDisplay}.</p></div>
          <a href={buildWhatsAppUrl(whatsappMessages.general)} className="inline-flex items-center gap-2 rounded-lg bg-[#1fa463] px-6 py-3 font-black"><MessageCircle /> Mas informacion por WhatsApp</a>
        </div>
      </section>
    </>
  );
}

function MiniTrust({ icon, value, label }: { icon: React.ReactNode; value: string; label: string }) {
  return (
    <div className="rounded-lg bg-white/12 p-2 ring-1 ring-white/20 backdrop-blur sm:p-3 lg:p-4">
      <span className="mb-2 grid h-8 w-8 place-items-center rounded-lg bg-amber-300 text-[#082447] sm:h-9 sm:w-9">{icon}</span>
      <strong className="block text-xs leading-snug sm:text-sm">{value}</strong>
      <span className="mt-1 block text-[11px] leading-snug text-slate-200 sm:text-xs">{label}</span>
    </div>
  );
}

function HeroVisualCarousel({ tours }: { tours: Tour[] }) {
  if (!tours.length) return null;
  return (
    <div id="heroExperienceCarousel" className="carousel slide hero-mini-carousel overflow-hidden rounded-lg shadow-2xl" data-bs-ride="carousel">
      <div className="carousel-inner">
        {tours.map((tour, index) => (
          <div key={tour.id} className={`carousel-item ${index === 0 ? "active" : ""}`} data-bs-interval="3600">
            <img src={tour.imageUrl} className="d-block h-[250px] w-100 object-cover" alt={tour.title} />
            <div className="hero-mini-caption">
              <span>{tour.duration}</span>
              <strong>{tour.title}</strong>
              <small>{tour.destination}</small>
            </div>
          </div>
        ))}
      </div>
      <button className="carousel-control-prev" type="button" data-bs-target="#heroExperienceCarousel" data-bs-slide="prev">
        <span className="carousel-control-prev-icon" aria-hidden="true" />
        <span className="visually-hidden">Anterior</span>
      </button>
      <button className="carousel-control-next" type="button" data-bs-target="#heroExperienceCarousel" data-bs-slide="next">
        <span className="carousel-control-next-icon" aria-hidden="true" />
        <span className="visually-hidden">Siguiente</span>
      </button>
    </div>
  );
}

function TrustBar() {
  const items = [
    ["+5", "destinos activos"],
    ["24/7", "canal de asistencia"],
    ["100%", "precios transparentes"]
  ];
  return (
    <section className="border-y border-slate-200 bg-white px-4 py-6">
      <div className="mx-auto grid max-w-7xl gap-4 md:grid-cols-3">
        {items.map(([value, label]) => (
          <div key={label} className="animate-rise rounded-lg border border-slate-100 bg-slate-50 p-5 text-center">
            <strong className="block text-3xl font-black text-[#082447]">{value}</strong>
            <span className="text-sm font-semibold uppercase tracking-widest text-slate-500">{label}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

function ConfidencePanel() {
  const promises = [
    ["Itinerario visible", "Sabes que incluye tu paquete, que no incluye y como se organiza cada dia."],
    ["Asesor humano", "Un contacto directo te acompana para resolver dudas antes de reservar."],
    ["Reserva sin presion", "Puedes cotizar por WhatsApp y revisar disponibilidad antes de pagar."]
  ];
  return (
    <section className="confidence-panel px-4 py-12 lg:px-6">
      <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[.85fr_1.15fr] lg:items-center">
        <div>
          <p className="mb-2 inline-flex items-center gap-2 rounded-lg bg-emerald-50 px-3 py-1 text-sm font-bold text-[#0f7a4f]"><ShieldCheck size={16} /> Confianza antes de reservar</p>
          <h2 className="text-3xl font-black text-[#082447] md:text-4xl">Una web pensada para que el cliente se sienta tranquilo</h2>
          <p className="mt-3 leading-7 text-slate-600">La experiencia muestra informacion concreta, contacto directo y pasos simples para que elegir Jhon Tours se sienta seguro desde el primer vistazo.</p>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {promises.map(([title, text]) => (
            <div key={title} className="trust-card rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
              <CheckCircle2 className="mb-3 text-[#0f7a4f]" />
              <strong className="text-[#082447]">{title}</strong>
              <p className="mt-2 text-sm leading-6 text-slate-600">{text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function ExperienceBand() {
  const steps = [
    ["1", "Cotiza", "Elige destino, fecha y numero de viajeros."],
    ["2", "Reserva", "Registramos tus datos y confirmamos disponibilidad."],
    ["3", "Paga seguro", "Culqi, Yape y comprobante de operacion."],
    ["4", "Viaja", "Acompanamiento y comunicacion directa."]
  ];
  return (
    <section className="journey-band px-4 py-14 text-white lg:px-6">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 max-w-3xl">
          <p className="mb-2 inline-flex items-center gap-2 rounded-lg bg-white/12 px-3 py-1 text-sm font-bold text-amber-200"><Camera size={16} /> Experiencia completa</p>
          <h2 className="text-3xl font-black md:text-4xl">De la idea del viaje a una reserva confiable</h2>
          <p className="mt-3 leading-7 text-slate-200">Una ruta simple para que el cliente entienda que hay proceso, respaldo y comunicacion clara.</p>
        </div>
        <div className="grid gap-4 md:grid-cols-4">
          {steps.map(([number, title, text]) => (
            <div key={title} className="journey-step rounded-lg p-5">
              <span className="grid h-11 w-11 place-items-center rounded-lg bg-amber-300 font-black text-[#082447]">{number}</span>
              <strong className="mt-4 block text-xl">{title}</strong>
              <p className="mt-2 text-sm leading-6 text-slate-200">{text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function DestinationCarousel({ tours }: { tours: Tour[] }) {
  if (!tours.length) return null;
  return (
    <section className="bg-[#f8fafc] px-4 py-14 lg:px-6">
      <div className="mx-auto max-w-7xl">
        <div className="mb-7 flex flex-col justify-between gap-3 md:flex-row md:items-end">
          <div>
            <p className="mb-2 inline-flex items-center gap-2 rounded-lg bg-amber-50 px-3 py-1 text-sm font-bold text-amber-700"><Award size={16} /> Seleccion profesional</p>
            <h2 className="text-3xl font-black text-[#082447] md:text-4xl">Destinos recomendados</h2>
          </div>
          <Link to="/tours" className="inline-flex items-center gap-2 font-bold text-[#0f4c81]">Ver catalogo completo <ArrowRight size={18} /></Link>
        </div>
        <div id="destinationCarousel" className="carousel slide carousel-fade overflow-hidden rounded-lg shadow-xl" data-bs-ride="carousel">
          <div className="carousel-indicators">
            {tours.map((tour, index) => <button key={tour.id} type="button" data-bs-target="#destinationCarousel" data-bs-slide-to={index} className={index === 0 ? "active" : ""} aria-label={tour.title} />)}
          </div>
          <div className="carousel-inner">
            {tours.map((tour, index) => (
              <div key={tour.id} className={`carousel-item ${index === 0 ? "active" : ""}`} data-bs-interval="4200">
                <img src={tour.imageUrl} className="d-block h-[460px] w-100 object-cover" alt={tour.title} />
                <div className="carousel-caption formal-caption text-start">
                  <span className="rounded-lg bg-white/90 px-3 py-1 text-sm font-bold text-[#082447]">{tour.type}</span>
                  <h3 className="mt-3 text-3xl font-black md:text-5xl">{tour.title}</h3>
                  <p className="mt-2 max-w-2xl text-base md:text-lg">{tour.destination} · {tour.duration} · desde {tourMoney(tour)}</p>
                  <Link to={`/tours/${tour.id}`} className="mt-4 inline-flex items-center gap-2 rounded-lg bg-[#f7b731] px-5 py-3 font-black text-[#082447]">Ver detalles <ArrowRight size={18} /></Link>
                </div>
              </div>
            ))}
          </div>
          <button className="carousel-control-prev" type="button" data-bs-target="#destinationCarousel" data-bs-slide="prev">
            <span className="carousel-control-prev-icon" aria-hidden="true" />
            <span className="visually-hidden">Anterior</span>
          </button>
          <button className="carousel-control-next" type="button" data-bs-target="#destinationCarousel" data-bs-slide="next">
            <span className="carousel-control-next-icon" aria-hidden="true" />
            <span className="visually-hidden">Siguiente</span>
          </button>
        </div>
      </div>
    </section>
  );
}

function SearchBox() {
  const navigate = useNavigate();
  const [destination, setDestination] = useState("");
  const [type, setType] = useState("");
  return (
    <div className="glass rounded-lg p-4 shadow-2xl lg:p-5">
      <h2 className="text-xl font-black text-[#082447] lg:text-2xl">Busca tu destino</h2>
      <div className="mt-5 grid gap-3 lg:grid-cols-2">
        <input className="rounded-lg border border-slate-200 px-4 py-3" placeholder="Destino" value={destination} onChange={(e) => setDestination(e.target.value)} />
        <input className="rounded-lg border border-slate-200 px-4 py-3" type="date" />
        <select className="rounded-lg border border-slate-200 px-4 py-3" value={type} onChange={(e) => setType(e.target.value)}>
          <option value="">Tipo de viaje</option><option value="NACIONAL">Nacional</option><option value="INTERNACIONAL">Internacional</option>
        </select>
        <input className="rounded-lg border border-slate-200 px-4 py-3" type="number" min="1" placeholder="Personas" />
        <button className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#082447] px-5 py-3 font-black text-white lg:col-span-2" onClick={() => navigate(`/tours?${new URLSearchParams({ ...(type && { type }), ...(destination && { destination }) }).toString()}`)}><Search /> Buscar tours</button>
      </div>
    </div>
  );
}

function Tours() {
  const [params, setParams] = useSearchParams();
  const initialType = params.get("type") as TourType | null;
  const { data: tours = [], isLoading } = useTours(initialType);
  const [destination, setDestination] = useState(params.get("destination") ?? "");
  const [maxPrice, setMaxPrice] = useState(3000);
  const filtered = useMemo(() => tours.filter((tour) => tour.destination.toLowerCase().includes(destination.toLowerCase()) && Number(tour.price) <= maxPrice), [tours, destination, maxPrice]);
  return (
    <Section title="Catalogo de tours" subtitle="Filtra paquetes nacionales e internacionales por destino, precio y estilo.">
      <div className="mb-6 grid gap-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm lg:grid-cols-4">
        <select className="rounded-lg border px-4 py-3" value={initialType ?? ""} onChange={(e) => setParams(e.target.value ? { type: e.target.value } : {})}><option value="">Todos</option><option value="NACIONAL">Nacional</option><option value="INTERNACIONAL">Internacional</option></select>
        <input className="rounded-lg border px-4 py-3" placeholder="Destino" value={destination} onChange={(e) => setDestination(e.target.value)} />
        <label className="flex items-center gap-3 rounded-lg border px-4 py-3"><Filter size={18} /> Tope por persona (S/ o US$): {maxPrice}<input type="range" min="100" max="3000" step="50" value={maxPrice} onChange={(e) => setMaxPrice(Number(e.target.value))} /></label>
        <a href={buildWhatsAppUrl(whatsappMessages.general)} className="rounded-lg bg-[#1fa463] px-4 py-3 text-center font-black text-white">Mas informacion</a>
      </div>
      <div className="mb-6 grid gap-4 md:grid-cols-3">
        <CatalogSignal icon={<ShieldCheck />} title="Operador confiable" text="Itinerarios revisados y comunicacion directa." />
        <CatalogSignal icon={<CreditCard />} title="Pagos protegidos" text="Reserva y pagos con flujo preparado para Culqi." />
        <CatalogSignal icon={<MessageCircle />} title="Asesor humano" text="Soporte por WhatsApp para cotizar y confirmar." />
      </div>
      {isLoading ? <p>Cargando tours...</p> : <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">{filtered.map((tour) => <TourCard key={tour.id} tour={tour} />)}</div>}
    </Section>
  );
}

function CatalogSignal({ icon, title, text }: { icon: React.ReactNode; title: string; text: string }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <span className="mb-3 grid h-10 w-10 place-items-center rounded-lg bg-[#082447] text-amber-300">{icon}</span>
      <strong className="text-[#082447]">{title}</strong>
      <p className="mt-1 text-sm leading-6 text-slate-600">{text}</p>
    </div>
  );
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
  const itinerary = tour.itinerary ?? ["Recepcion y briefing", "Experiencia principal", "Actividades libres", "Retorno"];
  const includes = tour.includes ?? ["Asistencia", "Traslados", "Guia"];
  const excludes = tour.excludes ?? ["Gastos personales"];
  return (
    <Section title={tour.title} subtitle={`${tour.destination} · ${tour.duration}`}>
      <div className="grid gap-8 lg:grid-cols-[1.2fr_.8fr]">
        <div className="space-y-4">
          <img src={tour.imageUrl} alt={tour.title} className="h-[440px] w-full rounded-lg object-cover shadow-xl" />
          <div className="grid gap-4 sm:grid-cols-3">
            {[tour.imageUrl, destinationImage("photo-1488646953014-85cb44e25828"), destinationImage("photo-1469854523086-cc02fe5d8800")].map((image, index) => (
              <img key={`${image}-${index}`} src={image} alt={`${tour.title} experiencia ${index + 1}`} className="h-32 w-full rounded-lg object-cover shadow-sm" />
            ))}
          </div>
        </div>
        <aside className="booking-aside rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-bold uppercase text-[#0f7a4f]">{tour.type}</p>
          <p className="mt-3 text-4xl font-black text-[#082447]">{tourMoney(tour)}</p>
          <p className="mt-2 text-slate-600">Cupos disponibles: <strong>{tour.availableSlots}</strong></p>
          <div className="mt-5 space-y-3 text-sm text-slate-600">
            <p className="flex items-center gap-2"><ShieldCheck className="text-[#0f7a4f]" size={18} /> Reserva con datos protegidos</p>
            <p className="flex items-center gap-2"><Clock3 className="text-[#0f4c81]" size={18} /> Confirmacion y seguimiento</p>
            <p className="flex items-center gap-2"><UsersRound className="text-amber-600" size={18} /> Asesoria para tu grupo</p>
          </div>
          <Link to={`/reservar/${tour.id}`} className="mt-6 flex items-center justify-center gap-2 rounded-lg bg-[#f7b731] px-5 py-3 font-black text-[#082447]">Reservar <ArrowRight /></Link>
          <a href={buildWhatsAppUrl(whatsappMessages.tour(tour))} className="mt-3 flex items-center justify-center gap-2 rounded-lg bg-[#1fa463] px-5 py-3 font-black text-white"><MessageCircle /> Cotizar por WhatsApp</a>
        </aside>
      </div>
      <div className="mt-10 grid gap-6 lg:grid-cols-3">
        <Info title="Descripcion" items={[tour.description ?? "Experiencia seleccionada por Jhon Tours."]} />
        <Info title="Itinerario" items={itinerary} ordered />
        <Info title="Incluye / No incluye" items={[...includes.map((i) => `Incluye: ${i}`), ...excludes.map((i) => `No incluye: ${i}`)]} />
      </div>
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
  duration: string;
  type: TourType;
  availableSlots: string;
  imageUrl: string;
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
  duration: "",
  type: "NACIONAL",
  availableSlots: "10",
  imageUrl: "",
  isFeatured: false,
  status: "ACTIVO",
  itineraryText: "Llegada y bienvenida\nTour principal guiado\nExperiencias locales\nRetorno",
  includesText: "Alojamiento\nTraslados\nGuia especializado\nAsistencia Jhon Tours",
  excludesText: "Gastos personales\nPropinas\nServicios no mencionados"
};

const listFromText = (value: string) => value.split("\n").map((item) => item.trim()).filter(Boolean);
const textFromList = (value?: string[]) => (value ?? []).join("\n");

function ReservationPage() {
  const { id = "" } = useParams();
  const navigate = useNavigate();
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
  const people = Number(form.watch("peopleCount") || 1);
  const mutation = useMutation({
    mutationFn: async (values: ReservationForm) => (await api.post("/reservations", { ...reservationSchema.parse(values), tourId: Number(id) })).data,
    onSuccess: (reservation: Reservation) => navigate(`/pago/${reservation.id}`)
  });
  return (
    <Section title="Reserva tu viaje" subtitle={tour ? `${tour.title} · Total estimado ${tourMoney(tour, Number(tour.price) * people)}` : "Completa tus datos"}>
      <form onSubmit={form.handleSubmit((v) => mutation.mutate(v))} className="mx-auto grid max-w-3xl gap-4 rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        {["fullName", "email", "phone", "documentNumber"].map((name) => <input key={name} className="rounded-lg border px-4 py-3" placeholder={{ fullName: "Nombre completo", email: "Correo", phone: "Telefono", documentNumber: "Documento" }[name]} {...form.register(name as never)} />)}
        <div className="grid gap-4 sm:grid-cols-2"><input className="rounded-lg border px-4 py-3" type="date" {...form.register("travelDate")} /><input className="rounded-lg border px-4 py-3" type="number" min="1" {...form.register("peopleCount")} /></div>
        <button className="rounded-lg bg-[#082447] px-5 py-3 font-black text-white" disabled={mutation.isPending}>{mutation.isPending ? "Creando reserva..." : "Crear reserva pendiente"}</button>
      </form>
    </Section>
  );
}

function PaymentPage() {
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const { data: reservation } = useQuery<Reservation>({ queryKey: ["reservation", id], queryFn: async () => (await api.get(`/reservations/${id}`)).data });
  const paymentSeed = useMemo(() => createPaymentSeed(id), [id]);
  const qrImage = useMemo(() => pseudoQrSvg(paymentSeed), [paymentSeed]);
  const [paymentError, setPaymentError] = useState("");
  const [checkoutReady, setCheckoutReady] = useState(Boolean(window.CulqiCheckout || window.Culqi));
  const mutation = useMutation({
    mutationFn: async ({ method, token }: { method: "culqi" | "yape"; token: string }) => (await api.post(`/payments/${method}`, { reservationId: Number(id), token })).data,
    onSuccess: () => navigate(`/confirmacion/${id}`),
    onError: (error) => {
      const fallback = "No se pudo procesar el pago. Revisa la configuracion de Culqi o intenta nuevamente.";
      if (error && typeof error === "object" && "response" in error) {
        const response = (error as { response?: { data?: { message?: string } } }).response;
        setPaymentError(response?.data?.message ?? fallback);
        return;
      }
      setPaymentError(fallback);
    }
  });

  useEffect(() => {
    if (!isCulqiKeyConfigured) {
      console.warn("NEXT_PUBLIC_CULQI_PUBLIC_KEY no esta configurada. En produccion Culqi Checkout no podra abrirse.");
      return;
    }

    if (window.CulqiCheckout || window.Culqi) {
      setCheckoutReady(true);
      return;
    }

    const existingScript = document.querySelector<HTMLScriptElement>('script[src="https://checkout.culqi.com/js/v4"]');
    const script = existingScript ?? document.createElement("script");
    script.src = "https://checkout.culqi.com/js/v4";
    script.async = true;
    script.onload = () => setCheckoutReady(true);
    script.onerror = () => setPaymentError("No se pudo cargar Culqi Checkout. Revisa tu conexion o la llave publica.");
    if (!existingScript) document.body.appendChild(script);
  }, []);

  const payWithToken = (method: "culqi" | "yape", token: string) => {
    setPaymentError("");
    mutation.mutate({ method, token });
  };

  const openCulqiCheckout = (method: "culqi" | "yape") => {
    if (!reservation) return;

    if (!isCulqiKeyConfigured) {
      if (process.env.NODE_ENV === "development") {
        payWithToken(method, "demo_token");
        return;
      }
      setPaymentError("Falta configurar NEXT_PUBLIC_CULQI_PUBLIC_KEY con una llave publica real de Culqi.");
      return;
    }

    const amountInCents = Math.round(Number(reservation.totalAmount) * 100);
    const paymentMethods = {
      tarjeta: method === "culqi",
      yape: method === "yape",
      bancaMovil: false,
      agente: false,
      billetera: false,
      cuotealo: false
    };

    window.culqi = () => {
      if (window.Culqi?.token?.id) {
        const token = window.Culqi.token.id;
        window.Culqi.close?.();
        payWithToken(method, token);
        return;
      }

      const message = window.Culqi?.error?.user_message ?? window.Culqi?.error?.merchant_message ?? "Culqi no pudo generar el token de pago.";
      setPaymentError(message);
    };

    if (window.CulqiCheckout) {
      const checkout = new window.CulqiCheckout(culqiPublicKey, {
        settings: {
          title: "Jhon Tours",
          currency: "PEN",
          amount: amountInCents
        },
        options: {
          lang: "es",
          installments: false,
          paymentMethods
        },
        client: {
          email: reservation.customer.email
        }
      });
      checkout.open();
      return;
    }

    if (window.Culqi?.settings && window.Culqi?.options && window.Culqi?.open) {
      window.Culqi.publicKey = culqiPublicKey;
      window.Culqi.settings({ title: "Jhon Tours", currency: "PEN", amount: amountInCents });
      window.Culqi.options({ lang: "es", installments: false, paymentMethods });
      window.Culqi.open();
      return;
    }

    setPaymentError("Culqi Checkout aun no esta listo. Intenta nuevamente en unos segundos.");
  };
  return (
    <Section title="Pago seguro" subtitle="El backend recalcula el monto desde la reserva antes de cobrar. Culqi queda listo para activar con llaves reales.">
      {reservation && <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-[1fr_.85fr]">
        <div className="rounded-lg border bg-white p-6 shadow-sm">
        <p className="text-sm font-bold uppercase text-[#0f7a4f]">Resumen de reserva</p>
        <h3 className="mt-2 text-2xl font-black text-[#082447]">{reservation.tour.title}</h3>
        <p className="mt-2 text-slate-600">{reservation.peopleCount} personas · Total: <strong>{tourMoney(reservation.tour, reservation.totalAmount)}</strong></p>
        <div className="mt-6 rounded-lg border border-dashed border-[#0f4c81]/30 bg-[#f8fbff] p-4">
          <h4 className="flex items-center gap-2 font-black text-[#082447]"><CreditCard size={19} /> Ubicacion Culqi Checkout</h4>
          <p className="mt-2 text-sm leading-6 text-slate-600">Aqui se conecta el checkout oficial usando la llave publica del frontend. El backend procesa el cargo con la llave privada.</p>
          <code className="mt-3 block overflow-x-auto rounded-lg bg-[#082447] px-3 py-2 text-xs text-amber-200">NEXT_PUBLIC_CULQI_PUBLIC_KEY={culqiPublicKey}</code>
          {!isCulqiKeyConfigured && <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm font-bold text-amber-800">Warning: configura NEXT_PUBLIC_CULQI_PUBLIC_KEY para usar pagos reales. En produccion no se enviaran pagos demo.</div>}
          <div id="culqi-checkout-slot" className="mt-4 rounded-lg border bg-white p-4 text-sm text-slate-600">{checkoutReady ? "Culqi Checkout listo para abrir." : "Cargando Culqi Checkout..."}</div>
        </div>
        {paymentError && <p className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">{paymentError}</p>}
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <button onClick={() => openCulqiCheckout("culqi")} className="flex items-center justify-center gap-2 rounded-lg bg-[#082447] px-5 py-4 font-black text-white" disabled={mutation.isPending}><CreditCard /> Pagar con tarjeta</button>
          <button onClick={() => openCulqiCheckout("yape")} className="flex items-center justify-center gap-2 rounded-lg bg-[#6d2bd9] px-5 py-4 font-black text-white" disabled={mutation.isPending}><WalletCards /> Pagar con Yape Culqi</button>
        </div>
        <p className="mt-4 text-sm text-slate-500">Los pagos demo solo funcionan en desarrollo si el backend tiene ALLOW_DEMO_PAYMENTS=true.</p>
        </div>
        <div className="rounded-lg border bg-white p-6 text-center shadow-sm">
          <p className="text-sm font-bold uppercase text-[#6d2bd9]">Referencia visual de reserva</p>
          <img src={qrImage} alt="QR demo para simular pago" className="mx-auto mt-4 h-64 w-64 rounded-lg border p-3" />
          <strong className="mt-4 block text-[#082447]">Codigo: {paymentSeed}</strong>
          <p className="mt-2 text-sm leading-6 text-slate-600">WhatsApp queda como canal de envio de comprobantes y coordinacion, no como API oficial.</p>
          <a href={buildWhatsAppUrl(whatsappMessages.reservation(reservation))} className="mt-5 inline-flex items-center justify-center gap-2 rounded-lg bg-[#1fa463] px-5 py-3 font-black text-white"><MessageCircle /> Enviar comprobante por WhatsApp</a>
        </div>
      </div>}
    </Section>
  );
}

function ConfirmationPage() {
  const { id = "" } = useParams();
  const { data: reservation } = useQuery<Reservation>({ queryKey: ["reservation", id], queryFn: async () => (await api.get(`/reservations/${id}`)).data });
  return <Section title="Reserva pagada" subtitle={`Codigo de reserva #${id}`}>{reservation && <div className="mx-auto max-w-2xl rounded-lg border bg-white p-8 text-center shadow-sm"><CheckCircle2 className="mx-auto text-[#1fa463]" size={60} /><h3 className="mt-4 text-2xl font-black text-[#082447]">{reservation.tour.title}</h3><p className="mt-2 text-slate-600">Gracias, {reservation.customer.fullName}. Te contactaremos para coordinar los detalles finales.</p><div className="mt-6 flex justify-center gap-3"><Link className="rounded-lg bg-[#082447] px-5 py-3 font-bold text-white" to="/">Volver al inicio</Link><a className="rounded-lg bg-[#1fa463] px-5 py-3 font-bold text-white" href={buildWhatsAppUrl(whatsappMessages.reservation(reservation))}>WhatsApp</a></div></div>}</Section>;
}

function AdminPage() {
  const [token, setToken] = useState(localStorage.getItem("adminToken"));
  const [tourForm, setTourForm] = useState<AdminTourForm>(emptyAdminTourForm);
  const form = useForm<{ email: string; password: string }>({ defaultValues: { email: "admin@jhontours.com", password: "Admin12345" } });
  const queryClient = useQueryClient();
  const login = useMutation({
    mutationFn: async (values: { email: string; password: string }) => {
      try {
        return (await api.post("/auth/login", values)).data;
      } catch (error) {
        if (values.email === "admin@jhontours.com" && values.password === "Admin12345") {
          return { token: "demo-admin-token", user: { email: values.email, name: "Administrador Jhon Tours", role: "ADMIN" } };
        }
        throw error;
      }
    },
    onSuccess: (data) => { localStorage.setItem("adminToken", data.token); setToken(data.token); queryClient.invalidateQueries(); }
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
        return [];
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
        return [];
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
    duration: tour.duration ?? "",
    type: tour.type,
    availableSlots: String(tour.availableSlots),
    imageUrl: tour.imageUrl ?? "",
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
        duration: tourForm.duration,
        type: tourForm.type,
        availableSlots: Number(tourForm.availableSlots),
        imageUrl: tourForm.imageUrl || null,
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
  if (!token) return <Section title="Login administrador" subtitle="Acceso al panel de gestion de Jhon Tours"><form onSubmit={form.handleSubmit((v) => login.mutate(v))} className="mx-auto grid max-w-md gap-4 rounded-lg border bg-white p-6 shadow-sm"><input className="rounded-lg border px-4 py-3" {...form.register("email")} /><input className="rounded-lg border px-4 py-3" type="password" {...form.register("password")} />{login.isError && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm font-bold text-red-700">Credenciales invalidas.</p>}<button className="rounded-lg bg-[#082447] px-5 py-3 font-black text-white" disabled={login.isPending}>{login.isPending ? "Ingresando..." : "Ingresar"}</button></form></Section>;
  return (
    <Section title="Panel administrativo" subtitle="Gestion de reservas, pagos y operaciones.">
      <button onClick={() => { localStorage.removeItem("adminToken"); setToken(null); }} className="mb-5 inline-flex items-center gap-2 rounded-lg border bg-white px-4 py-2 font-bold"><LogOut size={18} /> Salir</button>
      <div className="mb-6 grid gap-4 md:grid-cols-4">
        <AdminMetric label="Tours activos" value={String(tours.data?.length ?? 0)} />
        <AdminMetric label="Reservas" value={String(reservations.data?.length ?? 0)} />
        <AdminMetric label="Pagos" value={String(payments.data?.length ?? 0)} />
        <AdminMetric label="Modo pago" value="Demo/Culqi" />
      </div>
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
            <AdminField label="Duracion" value={tourForm.duration} onChange={(value) => setTourForm({ ...tourForm, duration: value })} />
            <AdminField label="Cupos" type="number" value={tourForm.availableSlots} onChange={(value) => setTourForm({ ...tourForm, availableSlots: value })} />
            <label className="grid gap-1 text-sm font-bold text-slate-700">Tipo<select className="rounded-lg border px-3 py-3" value={tourForm.type} onChange={(event) => setTourForm({ ...tourForm, type: event.target.value as TourType })}><option value="NACIONAL">Nacional</option><option value="INTERNACIONAL">Internacional</option></select></label>
            <label className="grid gap-1 text-sm font-bold text-slate-700">Estado<select className="rounded-lg border px-3 py-3" value={tourForm.status} onChange={(event) => setTourForm({ ...tourForm, status: event.target.value as TourStatus })}><option value="ACTIVO">Activo</option><option value="INACTIVO">Inactivo</option></select></label>
            <label className="flex items-center gap-2 rounded-lg border px-3 py-3 text-sm font-bold text-slate-700"><input type="checkbox" checked={tourForm.isFeatured} onChange={(event) => setTourForm({ ...tourForm, isFeatured: event.target.checked })} /> Destacado</label>
          </div>
          <AdminField label="Imagen URL" value={tourForm.imageUrl} onChange={(value) => setTourForm({ ...tourForm, imageUrl: value })} />
          <label className="mt-3 grid gap-1 text-sm font-bold text-slate-700">Descripcion<textarea className="min-h-24 rounded-lg border px-3 py-3" value={tourForm.description} onChange={(event) => setTourForm({ ...tourForm, description: event.target.value })} /></label>
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
        <AdminTable title="Reservas" rows={(reservations.data ?? []).map((r) => [`#${r.id}`, r.customer.fullName, r.tour.title, r.status, tourMoney(r.tour, r.totalAmount)])} />
        <AdminTable title="Pagos" rows={(payments.data ?? []).map((p) => [`#${p.id}`, p.paymentMethod, p.status, paymentMoney(p), p.culqiChargeId ?? "-"])} />
      </div>
      <div className="mt-6 rounded-lg border bg-white p-6 shadow-sm"><h3 className="mb-3 flex items-center gap-2 text-xl font-black text-[#082447]"><LayoutDashboard /> Operacion lista</h3><p className="text-slate-600">El panel ya usa POST, PUT y DELETE protegidos con JWT para manejar tours desde la interfaz.</p></div>
    </Section>
  );
}

function AdminMetric({ label, value }: { label: string; value: string }) {
  return <div className="rounded-lg border bg-white p-5 shadow-sm"><span className="text-sm font-bold uppercase text-slate-500">{label}</span><strong className="mt-2 block text-2xl text-[#082447]">{value}</strong></div>;
}

function AdminField({ label, value, onChange, type = "text", required = false }: { label: string; value: string; onChange: (value: string) => void; type?: string; required?: boolean }) {
  return <label className="grid gap-1 text-sm font-bold text-slate-700">{label}<input className="rounded-lg border px-3 py-3" type={type} value={value} onChange={(event) => onChange(event.target.value)} required={required} /></label>;
}

function AdminTextArea({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return <label className="grid gap-1 text-sm font-bold text-slate-700">{label}<textarea className="min-h-32 rounded-lg border px-3 py-3" value={value} onChange={(event) => onChange(event.target.value)} /></label>;
}

function AdminTable({ title, rows }: { title: string; rows: string[][] }) {
  return <div className="overflow-hidden rounded-lg border bg-white shadow-sm"><h3 className="border-b p-4 text-xl font-black text-[#082447]">{title}</h3><div className="overflow-x-auto"><table className="w-full text-left text-sm"><tbody>{rows.map((row, i) => <tr key={i} className="border-b last:border-0">{row.map((cell) => <td key={cell} className="px-4 py-3">{cell}</td>)}</tr>)}</tbody></table></div></div>;
}

function Testimonials() {
  const { data = demoTestimonials } = useQuery<{ name: string; location: string; comment: string; rating: number }[]>({
    queryKey: ["testimonials"],
    queryFn: async () => {
      try {
        return (await api.get("/testimonials")).data;
      } catch {
        return demoTestimonials;
      }
    },
    placeholderData: demoTestimonials
  });
  return (
    <Section title="Testimonios" subtitle="Viajeros que confiaron en Jhon Tours.">
      <div id="testimonialCarousel" className="carousel slide testimonial-carousel rounded-lg bg-white p-4 shadow-xl" data-bs-ride="carousel">
        <div className="carousel-inner">
          {data.map((item, index) => (
            <div key={item.name} className={`carousel-item ${index === 0 ? "active" : ""}`} data-bs-interval="4800">
              <div className="mx-auto max-w-3xl p-6 text-center">
                <div className="mb-4 flex justify-center text-amber-400">{Array.from({ length: item.rating }).map((_, i) => <Star key={i} size={22} fill="currentColor" />)}</div>
                <p className="text-xl font-semibold leading-9 text-slate-700">"{item.comment}"</p>
                <strong className="mt-5 block text-[#082447]">{item.name}</strong>
                <span className="text-sm text-slate-500">{item.location}</span>
              </div>
            </div>
          ))}
        </div>
        <button className="carousel-control-prev testimonial-control" type="button" data-bs-target="#testimonialCarousel" data-bs-slide="prev">
          <span className="carousel-control-prev-icon" aria-hidden="true" />
          <span className="visually-hidden">Anterior</span>
        </button>
        <button className="carousel-control-next testimonial-control" type="button" data-bs-target="#testimonialCarousel" data-bs-slide="next">
          <span className="carousel-control-next-icon" aria-hidden="true" />
          <span className="visually-hidden">Siguiente</span>
        </button>
      </div>
    </Section>
  );
}

function Section({ title, subtitle, children }: { title: string; subtitle: string; children?: React.ReactNode }) {
  return <section className="px-4 py-14 lg:px-6"><div className="mx-auto max-w-7xl"><div className="mb-8 max-w-3xl"><p className="mb-2 inline-flex items-center gap-2 rounded-lg bg-emerald-50 px-3 py-1 text-sm font-bold text-[#0f7a4f]"><ShieldCheck size={16} /> Jhon Tours</p><h2 className="text-3xl font-black text-[#082447] md:text-4xl">{title}</h2><p className="mt-3 leading-7 text-slate-600">{subtitle}</p></div>{children}</div></section>;
}

function Info({ title, items, ordered = false }: { title: string; items: string[]; ordered?: boolean }) {
  const List = ordered ? "ol" : "ul";
  return <div className="rounded-lg border bg-white p-6 shadow-sm"><h3 className="mb-4 text-xl font-black text-[#082447]">{title}</h3><List className="space-y-3 text-slate-600">{items.map((item) => <li key={item} className="leading-7">{item}</li>)}</List></div>;
}

function Footer() {
  return <footer id="nosotros" className="footer-pro border-t px-4 py-10 text-white"><div className="mx-auto grid max-w-7xl gap-6 md:grid-cols-4"><div className="md:col-span-2"><strong className="text-2xl text-amber-300">Jhon Tours</strong><p className="mt-3 max-w-xl text-slate-200">Agencia de turismo especializada en paquetes nacionales e internacionales, reservas online, pagos Culqi/Yape y acompanamiento profesional.</p></div><div><strong>Contacto</strong><p className="mt-3 text-slate-200">ventas@jhontours.com<br />WhatsApp {whatsappDisplay}</p></div><div><strong>Confianza</strong><p className="mt-3 text-slate-200">Itinerarios claros, precios transparentes y atencion personalizada.</p></div></div></footer>;
}

export default Shell;
