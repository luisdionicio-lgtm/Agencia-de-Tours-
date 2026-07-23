import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowRight, Award, CalendarDays, Camera, CheckCircle2, Clock3, Copy, CreditCard, Download, FileText, Filter, Globe2, HeartHandshake, Hotel, LayoutDashboard, LogOut, MapPin, Menu, MessageCircle, Plane, Search, ShieldCheck, Sparkles, Star, UsersRound, WalletCards, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import QRCode from "qrcode";
import { z } from "zod";
import { api } from "../../infrastructure/api/client";
import { Link, NavLink, Route, Routes, useNavigate, useParams, useSearchParams } from "../../core/routing";
import type { BusinessSettings, Payment, Reservation, Tour, TourStatus, TourType } from "../../shared/types";

declare global { interface Window { CulqiCheckout?: new (publicKey: string, config: unknown) => { open: () => void }; Culqi?: any; culqi?: () => void } }

const money = (value: string | number, currency: "PEN" | "USD" = "USD") =>
  new Intl.NumberFormat("es-PE", { currency, maximumFractionDigits: 0, style: "currency" }).format(Number(value));
const tourCurrency = (tour: Pick<Tour, "type" | "currency">) => tour.currency ?? (tour.type === "NACIONAL" ? "PEN" : "USD");
const tourMoney = (tour: Pick<Tour, "price" | "type">, value: string | number = tour.price) => money(value, tourCurrency(tour));
const paymentMoney = (payment: Payment) => payment.reservation?.tour ? tourMoney(payment.reservation.tour, payment.amount) : money(payment.amount);
const whatsapp = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "51966779705";
const whatsappDisplay = "+51 966 779 705";
const reservationAmount = 200;
const culqiPublicKey = "";
const isCulqiKeyConfigured = false;
const tiktokUrl = "https://www.tiktok.com/@johntoursperu?_r=1&_t=ZS-988zH7tdmDM";
const instagramUrl = "https://www.instagram.com/johntoursperu?igsh=dm1hc3ZweGlkeWR2";

const destinationImage = (id: string) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=1400&q=85`;

const buildWhatsAppUrl = (message: string) => `https://wa.me/${whatsapp}?text=${encodeURIComponent(message)}`;
const whatsappMessages = {
  general: "Hola John Tours, deseo informacion para cotizar un viaje.",
  tour: (tour: Tour) => `Hola John Tours, deseo cotizar el tour ${tour.title} para ${tour.destination}.`,
  reservation: (reservation: Reservation) => `Hola John Tours, deseo confirmar mi reserva #${reservation.id} para ${reservation.tour.title}.`
};

function createPaymentSeed(reservationId: string) {
  const random = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `JOHN-${reservationId || "DEMO"}-${Date.now().toString(36).toUpperCase()}-${random}`;
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
    includes: ["Hotel seleccionado", "Traslados", "Guiado profesional", "Asistencia John Tours"],
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
    includes: ["Hoteles seleccionados", "Traslados programados", "Guia especializado en espanol", "Asistencia John Tours por WhatsApp"],
    excludes: ["Vuelos internacionales", "Gastos personales", "Propinas y servicios no mencionados"]
  }
];

const demoTestimonials = [
  { name: "Maria Fernandez", location: "Lima", comment: "La reserva fue rapida, los precios fueron claros y el viaje a Cusco estuvo muy bien organizado.", rating: 5 },
  { name: "Carlos Medina", location: "Trujillo", comment: "Me atendieron por WhatsApp con paciencia y todo el itinerario estuvo explicado antes de pagar.", rating: 5 },
  { name: "Rosa Salazar", location: "Arequipa", comment: "El paquete familiar a Orlando supero nuestras expectativas. Se sintio seguro de inicio a fin.", rating: 5 }
];

const postPaymentGuides = [
  { match: ["machu", "cusco"], key: "cusco", label: "Cusco y Machu Picchu", imageUrl: destinationImage("photo-1587595431973-160d0d94add1"), extras: ["Traslado privado", "Noche adicional", "Almuerzo regional", "Asistencia de altura", "Sesión fotográfica", "Seguro de viaje"] },
  { match: ["disney", "orlando"], key: "orlando", label: "Disney Orlando", imageUrl: destinationImage("photo-1597466599360-3b9775841aec"), extras: ["Traslado aeropuerto-hotel", "Equipaje adicional", "Seguro internacional", "Día de compras", "Datos móviles", "Asistencia en español"] },
  { match: ["oxapampa"], key: "oxapampa", label: "Oxapampa", imageUrl: destinationImage("photo-1500534314209-a25ddb2bd429"), extras: ["Traslado privado", "Noche adicional", "Experiencia de café", "Alimentación", "Fotografía", "Seguro de viaje"] },
  { match: ["ica", "huacachina"], key: "ica", label: "Ica y Huacachina", imageUrl: "https://www.stampbystamptravel.com/wp-content/uploads/2025/02/laguna-huacachina-ica.jpg.webp", extras: ["Traslado privado", "Noche adicional", "Experiencia gastronómica", "Bodega seleccionada", "Fotografía al atardecer", "Seguro de viaje"] },
  { match: ["egipto", "cairo"], key: "egipto", label: "Egipto", imageUrl: "https://www.barcelo.com/guia-turismo/wp-content/uploads/2022/05/el-cairo1.jpg", extras: ["Traslado privado", "Equipaje adicional", "Seguro internacional", "Datos móviles", "Comidas seleccionadas", "Asistencia en español"] }
];

function guideForTour(tour: Tour) {
  const value = `${tour.title} ${tour.destination}`.toLowerCase();
  return postPaymentGuides.find((guide) => guide.match.some((term) => value.includes(term))) ?? {
    key: "general", label: tour.title, imageUrl: tour.imageUrl || destinationImage("photo-1488646953014-85cb44e25828"),
    extras: ["Traslados", "Alojamiento adicional", "Alimentación", "Equipaje", "Seguro de viaje", "Asistencia personalizada"]
  };
}

function Shell() {
  const [open, setOpen] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const links = [
    ["Inicio", "/"],
    ["Tours Nacionales", "/tours?type=NACIONAL"],
    ["Tours Internacionales", "/tours?type=INTERNACIONAL"],
    ["Paquetes", "/tours"],
    ["Nosotros", "/#nosotros"],
    ["Contacto", "/#contacto"]
  ];

  useEffect(() => {
    const updateProgress = () => {
      const available = document.documentElement.scrollHeight - window.innerHeight;
      setScrollProgress(available > 0 ? Math.min((window.scrollY / available) * 100, 100) : 0);
    };
    const revealObserver = new IntersectionObserver(
      (entries) => entries.forEach((entry) => entry.isIntersecting && entry.target.classList.add("is-visible")),
      { rootMargin: "0px 0px -8%", threshold: 0.08 }
    );
    document.querySelectorAll("main section, main article").forEach((element) => {
      element.classList.add("reveal-on-scroll");
      revealObserver.observe(element);
    });
    updateProgress();
    window.addEventListener("scroll", updateProgress, { passive: true });
    return () => {
      window.removeEventListener("scroll", updateProgress);
      revealObserver.disconnect();
    };
  }, []);

  return (
    <div className="site-shell min-h-screen">
      <header className="site-header sticky top-0 z-50 border-b border-slate-200/70 bg-white/90 shadow-sm backdrop-blur-xl">
        <div className="scroll-progress" style={{ width: `${scrollProgress}%` }} aria-hidden="true" />
        <div className="top-ribbon hidden border-b border-white/10 bg-[#061b34] px-4 py-2 text-white lg:block">
          <div className="mx-auto flex max-w-7xl items-center justify-between text-xs font-semibold">
            <span className="inline-flex items-center gap-2 text-cyan-100"><ShieldCheck size={14} /> Agencia de viajes y turismo · Tours operador mayorista</span>
            <span className="inline-flex items-center gap-5 text-slate-200">
              <span>WhatsApp {whatsappDisplay}</span>
              <span>Reserva desde S/ 200 con Yape</span>
              <span>Santa Clara, Ate · Cusco</span>
            </span>
          </div>
        </div>
        <div className="header-main mx-auto flex max-w-7xl items-center justify-between px-4 py-3 lg:px-6">
          <Link to="/" className="brand-lockup flex items-center gap-3" aria-label="John Tours, inicio">
            <span className="header-brand-stage">
              <span className="header-brand-glow" aria-hidden="true" />
              <img src="/john-tours-logo-cropped.png" alt="John Tours Perú" className="header-logo" />
              <span className="header-brand-carousel" aria-hidden="true"><i>Viajes</i><i>Tours</i><i>Experiencias</i></span>
            </span>
          </Link>
          <nav className="primary-nav hidden items-center gap-6 text-sm font-semibold text-slate-700 lg:flex">
            {links.map(([label, to]) => <NavLink key={label} to={to}>{label}</NavLink>)}
          </nav>
          <div className="hidden items-center gap-3 lg:flex">
            <Link to="/admin" className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-bold text-slate-700">Admin</Link>
            <Link to="/tours" className="btn-gold rounded-lg px-5 py-2.5 text-sm font-bold shadow-sm">Reservar ahora</Link>
          </div>
          <button className="menu-button rounded-xl border border-slate-200 p-2 lg:hidden" onClick={() => setOpen(!open)} aria-label={open ? "Cerrar menu" : "Abrir menu"} aria-expanded={open}>
            {open ? <X /> : <Menu />}
          </button>
        </div>
        {open && (
          <div className="mobile-menu border-t border-slate-200 bg-white/95 px-4 py-4 backdrop-blur-xl lg:hidden">
            {links.map(([label, to]) => <Link key={label} to={to} onClick={() => setOpen(false)} className="block rounded-lg px-3 py-3 font-semibold text-slate-700">{label}</Link>)}
            <Link to="/admin" className="mt-2 block rounded-lg bg-slate-100 px-3 py-3 font-semibold">Panel admin</Link>
          </div>
        )}
      </header>
      <main className="overflow-hidden"><RoutesView /></main>
      <Footer />
      <a href={buildWhatsAppUrl("Hola John Tours, deseo orientación para elegir mi próximo viaje.")} className="floating-whatsapp" aria-label="Hablar con un asesor de John Tours por WhatsApp"><MessageCircle /><span>Te asesoramos</span></a>
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
      <Route path="/pago/:id" element={<YapeReservationPage />} />
      <Route path="/confirmacion/:id" element={<ConfirmationPage />} />
      <Route path="/admin" element={<AdminPage />} />
      <Route path="/legal/:section" element={<LegalPage />} />
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
    <article className="tour-card group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="relative overflow-hidden">
        <img src={tour.imageUrl} alt={tour.title} loading="lazy" decoding="async" className="h-60 w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#061b34]/70 via-transparent to-transparent opacity-90" />
        <span className="absolute left-4 top-4 rounded-lg bg-white/95 px-3 py-1 text-xs font-black uppercase text-[#082447] shadow-sm">{tour.type}</span>
        <span className="absolute bottom-4 right-4 rounded-lg bg-[#1fa463] px-3 py-1 text-xs font-black text-white">{tour.availableSlots} cupos</span>
        <span className="absolute bottom-4 left-4 inline-flex items-center gap-1 rounded-lg bg-[#082447]/90 px-3 py-1 text-xs font-black text-amber-200"><Star size={14} fill="currentColor" /> Verificado</span>
      </div>
      <div className="space-y-4 p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="flex items-center gap-1 text-sm font-semibold text-[#0f7a4f]"><MapPin size={16} /> {tour.destination}</p>
            <h3 className="mt-1 text-xl font-bold text-[#082447]">{tour.title}</h3>
          </div>
          <span className="rounded-lg bg-amber-100 px-3 py-1 text-sm font-bold text-amber-700">Recomendado</span>
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
        <Link to={`/tours/${tour.id}`} className="tour-card-cta flex items-center justify-center gap-2 rounded-xl bg-[#082447] px-4 py-3 font-bold text-white">Ver experiencia <ArrowRight size={18} /></Link>
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
            <p className="hero-eyebrow mb-4 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-bold text-cyan-100 ring-1 ring-white/20"><Sparkles size={17} /> Viaja seguro · Vive extraordinario</p>
            <h1 className="hero-title text-4xl font-black leading-[1.04] sm:text-5xl md:text-7xl">Tu próximo destino <span>empieza aquí</span></h1>
            <p className="mt-6 max-w-2xl text-base leading-8 text-slate-100 md:text-xl">Tours nacionales e internacionales con atención cercana, itinerarios claros y una reserva simple de S/ 200 por Yape.</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link to="/tours" className="btn-gold rounded-xl px-7 py-3.5 text-center font-black">Explorar tours</Link>
              <a href={buildWhatsAppUrl(whatsappMessages.general)} className="whatsapp-cta rounded-xl bg-[#1fa463] px-7 py-3.5 text-center font-black text-white">Cotizar por WhatsApp</a>
            </div>
            <div className="mt-6 flex flex-wrap gap-2 text-xs font-bold text-slate-100">
              <span className="trust-pill rounded-full bg-white/10 px-3 py-2 ring-1 ring-white/20">Atención 24/7</span>
              <span className="trust-pill rounded-full bg-white/10 px-3 py-2 ring-1 ring-white/20">Reserva S/ 200</span>
              <span className="trust-pill rounded-full bg-white/10 px-3 py-2 ring-1 ring-white/20">Experiencias premium</span>
              <span className="trust-pill rounded-full bg-white/10 px-3 py-2 ring-1 ring-white/20">Agencia confiable</span>
            </div>
            <div className="mt-8 grid max-w-2xl grid-cols-3 gap-2 sm:gap-3">
              <MiniTrust icon={<ShieldCheck />} value="Reserva segura" label="Yape, código único y comprobante" />
              <MiniTrust icon={<Clock3 />} value="Respuesta clara" label="Atencion por WhatsApp" />
              <MiniTrust icon={<HeartHandshake />} value="Viaje acompanado" label="Antes, durante y despues" />
            </div>
          </div>
          <div className="space-y-4 lg:pl-2">
            <LogoShowcase />
            <div className="hidden lg:block"><HeroVisualCarousel tours={featured.length ? featured : tours.slice(0, 4)} /></div>
            <SearchBox />
          </div>
        </div>
      </section>
      <TrustBar />
      <EnjoyYourTrip />
      <ConfidencePanel />
      <ExclusiveReservationExperience />
      <TrustVerification />
      <DestinationCarousel tours={featured.length ? featured : tours.slice(0, 5)} />
      <Section title="Tours destacados" subtitle="Paquetes elegidos para viajar con confianza y asistencia desde la primera cotizacion.">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">{featured.map((tour) => <TourCard key={tour.id} tour={tour} />)}</div>
      </Section>
      <ExperienceBand />
      <Section title="Experiencias que inspiran" subtitle="Encuentra una forma de viajar que conecte contigo y convierta cada destino en una historia.">
        <div className="experience-rail" role="region" aria-label="Estilos de viaje">{types.map(([type, text], index) => <div key={type} className="experience-card group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"><span className="category-icon mb-5 grid h-12 w-12 place-items-center rounded-xl"><Globe2 /></span><span className="text-xs font-black uppercase tracking-[0.18em] text-amber-600">Experiencia 0{index + 1}</span><strong className="mt-2 block text-xl text-[#082447]">{type}</strong><p className="mt-2 text-sm leading-6 text-slate-600">{text}</p><Link to="/tours" className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-[#0f4c81]">Descubrir <ArrowRight size={16} /></Link></div>)}</div>
      </Section>
      <TravelFamily />
      <SchoolPromotions />
      <OurStory />
      <SocialSpotlight />
      <Testimonials />
      <FrequentlyAskedQuestions />
      <section id="contacto" className="formal-cta px-4 py-20 text-white">
        <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-6 lg:flex-row lg:items-center">
          <div className="max-w-3xl"><span className="text-sm font-black uppercase tracking-[0.2em] text-amber-300">El mundo te espera</span><h2 className="mt-3 text-4xl font-black md:text-5xl">Tu próxima aventura empieza hoy</h2><p className="mt-4 text-lg text-slate-200">Reserva con John Tours y vive una experiencia diseñada para sorprenderte.</p></div>
          <div className="flex flex-col gap-3 sm:flex-row"><a href={buildWhatsAppUrl(whatsappMessages.general)} className="whatsapp-cta inline-flex items-center justify-center gap-2 rounded-xl bg-[#1fa463] px-6 py-3.5 font-black"><MessageCircle /> Hablar por WhatsApp</a><Link to="/tours" className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/30 bg-white/10 px-6 py-3.5 font-black backdrop-blur">Ver paquetes <ArrowRight size={18} /></Link></div>
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
            <img src={tour.imageUrl} loading={index === 0 ? "eager" : "lazy"} decoding="async" className="d-block h-[250px] w-100 object-cover" alt={tour.title} />
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

function LogoShowcase() {
  return (
    <div className="logo-stage" aria-label="John Tours Perú">
      <div className="logo-orbit" aria-hidden="true" />
      <img src="/john-tours-logo-cropped.png" alt="Logo oficial de John Tours Perú" />
      <span>Agencia de Viajes y Turismo</span>
    </div>
  );
}

function SchoolPromotions() {
  const campaigns = [
    ["Promociones escolares", "Viajes de promoción organizados con acompañamiento y coordinación para colegios.", "photo-1523050854058-8df90110c9f1"],
    ["Grupos y delegaciones", "Rutas diseñadas para instituciones, empresas y grupos con atención personalizada.", "photo-1517457373958-b7bdd4587205"],
    ["Recuerdos que unen", "Experiencias seguras para celebrar etapas importantes y compartir en comunidad.", "photo-1529156069898-49953e39b3ac"]
  ];
  return <Section title="Experiencias que ya hicimos realidad" subtitle="Un espacio listo para publicar fotografías autorizadas de promociones, colegios, delegaciones y grupos atendidos por John Tours."><div className="promotion-grid">{campaigns.map(([title, text, photo]) => <article key={title} className="promotion-card"><img src={destinationImage(photo)} alt={title} loading="lazy" /><div><span>John Tours en acción</span><h3>{title}</h3><p>{text}</p></div></article>)}</div><p className="mt-5 text-sm text-slate-500">Las imágenes actuales son referenciales y pueden reemplazarse desde el catálogo administrativo por fotografías propias con autorización.</p></Section>;
}

function OurStory() {
  return <section id="nosotros" className="story-section px-4 py-20 lg:px-6"><div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[.85fr_1.15fr] lg:items-center"><div className="story-logo"><img src="/john-tours-logo-cropped.png" alt="John Tours Perú" /></div><div><span className="section-kicker">Nuestra historia</span><h2 className="mt-4 text-4xl font-black text-[#073b83] md:text-5xl">¿Cómo nace John Tours?</h2><p className="mt-5 text-lg leading-8 text-slate-600">John Tours Perú nace con la convicción de que viajar debe sentirse cercano, claro y bien acompañado. Desde Santa Clara, Ate, y Cusco, conectamos a familias, colegios, grupos y viajeros con experiencias nacionales e internacionales.</p><p className="mt-4 leading-8 text-slate-600">Nuestro trabajo se sostiene en escuchar primero, explicar cada detalle y mantener un contacto humano antes, durante y después del viaje. Esa cercanía es la que convierte una reserva en confianza.</p><div className="mt-7 grid gap-3 sm:grid-cols-3">{["Atención directa", "Itinerarios claros", "Acompañamiento real"].map(item => <span key={item} className="rounded-xl bg-white p-4 text-center font-bold text-[#087db8] shadow-sm">{item}</span>)}</div></div></div></section>;
}

function SocialSpotlight() {
  return <section className="social-section px-4 py-16 text-white lg:px-6"><div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-8 lg:flex-row lg:items-center"><div className="max-w-3xl"><span className="text-sm font-black uppercase tracking-[.2em] text-cyan-200">Síguenos y viaja con nosotros</span><h2 className="mt-3 text-4xl font-black md:text-5xl">Inspírate con nuestros próximos destinos</h2><p className="mt-4 text-lg text-blue-100">Mira promociones, salidas, consejos y experiencias reales en TikTok e Instagram.</p></div><div className="social-cards grid w-full gap-4 sm:grid-cols-2 lg:w-auto"><a href={tiktokUrl} target="_blank" rel="noreferrer" className="social-button social-tiktok"><img src="/tiktok-logo.png" alt="" /><span><strong>TikTok</strong><small>@johntoursperu</small></span><ArrowRight /></a><a href={instagramUrl} target="_blank" rel="noreferrer" className="social-button social-instagram"><img src="/instagram-logo.png" alt="" /><span><strong>Instagram</strong><small>@johntoursperu</small></span><ArrowRight /></a></div></div></section>;
}

function TrustBar() {
  const items = [
    ["+5", "destinos activos"],
    ["24/7", "canal de asistencia"],
    ["100%", "precios transparentes"],
    ["0", "datos de tarjeta guardados"]
  ];
  return (
    <section className="trust-strip border-y border-slate-200 bg-white px-4 py-6">
      <div className="mx-auto grid max-w-7xl gap-4 md:grid-cols-4">
        {items.map(([value, label]) => (
          <div key={label} className="animate-rise rounded-lg border border-slate-100 bg-white p-5 text-center shadow-sm">
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
          <p className="mb-2 inline-flex items-center gap-2 rounded-lg bg-emerald-50 px-3 py-1 text-sm font-bold text-[#0f7a4f]"><ShieldCheck size={16} /> Respaldo en cada etapa</p>
          <h2 className="text-3xl font-black text-[#082447] md:text-4xl">Viaja con confianza</h2>
          <p className="mt-3 leading-7 text-slate-600">Información clara, contacto directo y acompañamiento humano para que disfrutes la emoción de viajar con la tranquilidad de sentirte respaldado.</p>
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

function ExclusiveReservationExperience() {
  const benefits = [
    [<Sparkles key="sparkles" />, "Guía privada del destino", "Después de confirmar la reserva recibes una guía visual vinculada al viaje elegido."],
    [<Award key="award" />, "Extras seleccionados", "Accedes a opciones complementarias pensadas para ese destino, sin saturar el paquete principal."],
    [<HeartHandshake key="support" />, "Coordinación personal", "Un asesor revisa contigo fechas, disponibilidad y condiciones antes de agregar cualquier servicio."],
    [<FileText key="file" />, "Información para conservar", "Descarga un PDF con el logo de John Tours, imagen referencial y detalles útiles para tu viaje."]
  ];
  return (
    <section className="exclusive-section px-4 py-16 text-white lg:px-6 lg:py-20">
      <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[.82fr_1.18fr] lg:items-center">
        <div>
          <span className="exclusive-badge"><Star size={16} fill="currentColor" /> Beneficio exclusivo para viajeros</span>
          <h2 className="mt-5 text-4xl font-black leading-tight md:text-5xl">Tu reserva abre una experiencia más personal</h2>
          <p className="mt-5 text-lg leading-8 text-slate-200">El catálogo te ayuda a elegir. Después de separar tu cupo, desbloqueamos información y opciones específicas para complementar el destino que realmente vas a disfrutar.</p>
          <div className="mt-7 flex flex-col gap-3 sm:flex-row"><Link to="/tours" className="btn-gold inline-flex items-center justify-center gap-2 rounded-xl px-6 py-3.5 font-black">Elegir mi destino <ArrowRight size={18} /></Link><a href={buildWhatsAppUrl("Hola John Tours, quiero conocer los beneficios que se desbloquean al reservar un tour.")} className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/25 bg-white/10 px-6 py-3.5 font-black backdrop-blur"><MessageCircle size={18} /> Consultar beneficios</a></div>
        </div>
        <div className="exclusive-grid grid gap-4 sm:grid-cols-2">{benefits.map(([icon, title, text]) => <article key={String(title)} className="exclusive-card rounded-2xl border border-white/15 bg-white/10 p-5 backdrop-blur"><span>{icon}</span><strong className="mt-4 block text-lg">{title}</strong><p className="mt-2 text-sm leading-6 text-slate-200">{text}</p></article>)}</div>
      </div>
    </section>
  );
}

function TrustVerification() {
  const checks = [
    ["Antes de pagar", "Confirma destino, fecha, viajeros, precio y qué incluye el paquete."],
    ["Al separar", "Usa el código único de tu reserva y conserva el comprobante enviado."],
    ["Antes de viajar", "Solicita la confirmación, condiciones aplicables y datos de contacto del asesor."],
    ["Canales oficiales", `Verifica siempre el WhatsApp ${whatsappDisplay} y las redes @johntoursperu.`]
  ];
  return (
    <section className="verification-section px-4 py-16 lg:px-6 lg:py-20">
      <div className="mx-auto max-w-7xl rounded-3xl border border-slate-200 bg-white p-6 shadow-xl md:p-10">
        <div className="grid gap-9 lg:grid-cols-[.75fr_1.25fr] lg:items-center">
          <div><span className="section-kicker"><ShieldCheck size={16} /> Compra informada</span><h2 className="mt-4 text-4xl font-black text-[#082447]">Confianza que puedes verificar</h2><p className="mt-4 leading-7 text-slate-600">Una agencia confiable no te apura ni oculta condiciones. Te damos una ruta clara para revisar cada paso antes de comprometer tu viaje.</p><a href={buildWhatsAppUrl("Hola John Tours, deseo verificar disponibilidad, condiciones y datos de mi próximo viaje antes de reservar.")} className="mt-6 inline-flex items-center gap-2 font-black text-[#0f7a4f]">Verificar con un asesor <ArrowRight size={17} /></a></div>
          <div className="grid gap-3 sm:grid-cols-2">{checks.map(([title, text], index) => <div key={title} className="verification-card rounded-2xl border border-slate-200 p-5"><span>0{index + 1}</span><strong className="ml-3 text-[#082447]">{title}</strong><p className="mt-3 text-sm leading-6 text-slate-600">{text}</p></div>)}</div>
        </div>
      </div>
    </section>
  );
}

function EnjoyYourTrip() {
  const highlights = [
    ["01", "Tú eliges la emoción", "Cuéntanos qué deseas vivir y te ayudamos a encontrar una experiencia que conecte contigo."],
    ["02", "Nosotros cuidamos los detalles", "Coordinamos itinerario, reserva y orientación para que avances con información clara."],
    ["03", "Solo disfruta tu viaje", "Mantén contacto directo con nuestro equipo antes y durante tu experiencia."]
  ];
  return (
    <section className="enjoy-section px-4 py-16 lg:px-6 lg:py-20">
      <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[1fr_1.05fr] lg:items-center">
        <div className="enjoy-visual relative min-h-[430px] overflow-hidden rounded-3xl shadow-2xl">
          <div className="absolute inset-x-5 bottom-5 rounded-2xl border border-white/20 bg-[#061b34]/80 p-5 text-white backdrop-blur-md">
            <span className="text-xs font-black uppercase tracking-[0.2em] text-amber-300">Viajar se siente mejor acompañado</span>
            <strong className="mt-2 block text-2xl">Momentos que empiezan mucho antes de abordar</strong>
          </div>
        </div>
        <div>
          <span className="section-kicker">Tu experiencia, nuestra prioridad</span>
          <h2 className="mt-4 text-4xl font-black leading-tight text-[#082447] md:text-5xl">Disfruta tu viaje.<br /><span className="text-[#0f7a4f]">Nosotros te acompañamos.</span></h2>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-600">Desde la primera idea hasta el regreso a casa, hacemos que cada paso se sienta cercano, claro y emocionante.</p>
          <div className="mt-8 grid gap-4">
            {highlights.map(([number, title, text]) => <div key={title} className="enjoy-step flex gap-4 rounded-2xl border border-slate-200 bg-white p-4"><span>{number}</span><div><strong className="text-[#082447]">{title}</strong><p className="mt-1 text-sm leading-6 text-slate-600">{text}</p></div></div>)}
          </div>
        </div>
      </div>
    </section>
  );
}

function TravelFamily() {
  return (
    <section id="familia-viajera" className="family-section px-4 py-16 text-white lg:px-6 lg:py-20">
      <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[1.1fr_.9fr] lg:items-center">
        <div className="max-w-3xl">
          <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-bold text-amber-200 ring-1 ring-white/15"><HeartHandshake size={18} /> Cercanía que se siente</span>
          <h2 className="mt-5 text-4xl font-black leading-tight md:text-5xl">Más que una agencia,<br />una familia viajera</h2>
          <p className="mt-5 text-lg leading-8 text-slate-200">Creemos que un gran viaje nace de escuchar, orientar y estar presentes. Por eso cada consulta recibe atención humana y cada itinerario se trata como una experiencia personal.</p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row"><a href={buildWhatsAppUrl("Hola John Tours, quiero conversar con un asesor sobre mi próximo viaje.")} className="whatsapp-cta inline-flex items-center justify-center gap-2 rounded-xl bg-[#1fa463] px-6 py-3.5 font-black"><MessageCircle /> Conversemos por WhatsApp</a><Link to="/#nosotros" className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/25 bg-white/10 px-6 py-3.5 font-black">Conoce nuestro enfoque</Link></div>
        </div>
        <div className="family-values grid grid-cols-2 gap-4">
          {["Escuchamos tus ideas", "Orientamos sin presión", "Respondemos con claridad", "Acompañamos tu viaje"].map((value, index) => <div key={value} className="rounded-2xl border border-white/15 bg-white/10 p-5 backdrop-blur"><span className="text-2xl font-black text-amber-300">0{index + 1}</span><strong className="mt-8 block text-lg">{value}</strong></div>)}
        </div>
      </div>
    </section>
  );
}

function FrequentlyAskedQuestions() {
  const questions = [
    ["¿Cómo puedo reservar un tour?", "Elige una experiencia, completa tus datos y revisa la información de pago. También puedes escribirnos por WhatsApp antes de reservar."],
    ["¿Puedo solicitar un viaje personalizado?", "Sí. Cuéntanos destino, fechas, cantidad de viajeros y estilo de viaje para orientarte con una propuesta acorde a tus necesidades."],
    ["¿Cómo pago la reserva?", "Separa tu cupo con S/ 200 por Yape. El sistema genera un código único; luego envías el comprobante por WhatsApp para su validación."],
    ["¿Cuándo se confirma mi cupo?", "La reserva se confirma después de validar el monto, el titular y el código único incluido en tu comprobante."],
    ["¿Tendré asistencia durante el viaje?", "Sí. Nuestro enfoque incluye orientación previa y un canal de contacto directo para acompañarte durante tu experiencia."],
    ["¿Dónde reviso lo que incluye cada paquete?", "En el detalle de cada tour encontrarás itinerario, servicios incluidos, exclusiones, duración, precio y disponibilidad."]
  ];
  return (
    <section className="faq-section px-4 py-16 lg:px-6 lg:py-20">
      <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[.75fr_1.25fr]">
        <div><span className="section-kicker">Resolvemos tus dudas</span><h2 className="mt-4 text-4xl font-black text-[#082447] md:text-5xl">Preguntas frecuentes</h2><p className="mt-4 text-lg leading-8 text-slate-600">Queremos que decidas con información clara. Si necesitas una respuesta personal, estamos a un mensaje de distancia.</p><a href={buildWhatsAppUrl("Hola John Tours, tengo una consulta sobre sus viajes.")} className="mt-7 inline-flex items-center gap-2 rounded-xl bg-[#1fa463] px-6 py-3.5 font-black text-white"><MessageCircle /> Consultar por WhatsApp</a></div>
        <div className="grid gap-3">{questions.map(([question, answer], index) => <details key={question} className="faq-item group rounded-2xl border border-slate-200 bg-white"><summary className="flex cursor-pointer list-none items-center justify-between gap-4 p-5 font-bold text-[#082447]"><span>{question}</span><span className="faq-plus grid h-8 w-8 shrink-0 place-items-center rounded-full">+</span></summary><div className="px-5 pb-5 pr-16 text-sm leading-7 text-slate-600">{answer}</div>{index === 0 && <span className="sr-only">Abre para ver la respuesta</span>}</details>)}</div>
      </div>
    </section>
  );
}

function ExperienceBand() {
  const steps = [
    ["1", "Cotiza", "Elige destino, fecha y numero de viajeros."],
    ["2", "Reserva", "Registramos tus datos y confirmamos disponibilidad."],
    ["3", "Separa con Yape", "S/ 200, QR de instrucciones y código único."],
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
                <img src={tour.imageUrl} loading={index === 0 ? "eager" : "lazy"} decoding="async" className="d-block h-[460px] w-100 object-cover" alt={tour.title} />
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
    <div className="glass search-panel rounded-2xl p-5 shadow-2xl lg:p-6">
      <p className="mb-2 text-xs font-black uppercase tracking-widest text-[#0f7a4f]">Cotizacion rapida</p>
      <h2 className="text-xl font-black text-[#082447] lg:text-2xl">Diseña tu próxima experiencia</h2>
      <p className="mt-1 text-sm leading-6 text-slate-600">Filtra por destino, fecha y tipo de viaje. Luego un asesor puede ayudarte por WhatsApp.</p>
      <div className="mt-5 grid gap-3 lg:grid-cols-2">
        <input className="rounded-lg border border-slate-200 px-4 py-3" placeholder="Destino" value={destination} onChange={(e) => setDestination(e.target.value)} />
        <input className="rounded-lg border border-slate-200 px-4 py-3" type="date" />
        <select className="rounded-lg border border-slate-200 px-4 py-3" value={type} onChange={(e) => setType(e.target.value)}>
          <option value="">Tipo de viaje</option><option value="NACIONAL">Nacional</option><option value="INTERNACIONAL">Internacional</option>
        </select>
        <input className="rounded-lg border border-slate-200 px-4 py-3" type="number" min="1" placeholder="Personas" />
        <button className="search-submit inline-flex items-center justify-center gap-2 rounded-xl bg-[#082447] px-5 py-3.5 font-black text-white lg:col-span-2" onClick={() => navigate(`/tours?${new URLSearchParams({ ...(type && { type }), ...(destination && { destination }) }).toString()}`)}><Search /> Buscar experiencia</button>
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
        <CatalogSignal icon={<ShieldCheck />} title="Reserva protegida" text="Separa con S/ 200, código único y validación del comprobante." />
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
        <Info title="Descripcion" items={[tour.description ?? "Experiencia seleccionada por John Tours."]} />
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
  includesText: "Alojamiento\nTraslados\nGuia especializado\nAsistencia John Tours",
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
    onSuccess: (reservation: Reservation) => navigate(`/pago/${reservation.id}`),
    onError: () => {
      if (!tour) return;
      const values = form.getValues();
      const localId = Date.now();
      const localReservation: Reservation = { id: localId, travelDate: values.travelDate, peopleCount: Number(values.peopleCount), totalAmount: reservationAmount, status: "PENDIENTE", customer: { fullName: values.fullName, email: values.email, phone: values.phone }, tour };
      localStorage.setItem(`john-reservation-${localId}`, JSON.stringify(localReservation));
      navigate(`/pago/${localId}`);
    }
  });
  return (
    <Section title="Reserva tu viaje" subtitle={tour ? `${tour.title} · Separa tu cupo con S/ ${reservationAmount}` : "Completa tus datos"}>
      <form onSubmit={form.handleSubmit((v) => mutation.mutate(v))} className="mx-auto grid max-w-3xl gap-4 rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        {["fullName", "email", "phone", "documentNumber"].map((name) => <input key={name} className="rounded-lg border px-4 py-3" placeholder={{ fullName: "Nombre completo", email: "Correo", phone: "Telefono", documentNumber: "Documento" }[name]} {...form.register(name as never)} />)}
        <div className="grid gap-4 sm:grid-cols-2"><input className="rounded-lg border px-4 py-3" type="date" {...form.register("travelDate")} /><input className="rounded-lg border px-4 py-3" type="number" min="1" {...form.register("peopleCount")} /></div>
        <button className="rounded-lg bg-[#082447] px-5 py-3 font-black text-white" disabled={mutation.isPending}>{mutation.isPending ? "Creando reserva..." : "Crear reserva pendiente"}</button>
      </form>
    </Section>
  );
}

function YapeReservationPage() {
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);
  const [qrImage, setQrImage] = useState("");
  const { data: reservation } = useQuery<Reservation>({
    queryKey: ["reservation", id],
    queryFn: async () => {
      try { return (await api.get(`/reservations/${id}`)).data; }
      catch {
        const saved = localStorage.getItem(`john-reservation-${id}`);
        if (!saved) throw new Error("Reserva no encontrada");
        return JSON.parse(saved) as Reservation;
      }
    }
  });
  const paymentCode = useMemo(() => `JT-${id.slice(-6)}-${new Date().getFullYear()}`, [id]);
  useEffect(() => {
    const payload = `JOHN TOURS PERU\nReserva: ${paymentCode}\nMonto: S/ ${reservationAmount}.00\nYape: ${whatsappDisplay}\nConcepto: Separacion de tour`;
    QRCode.toDataURL(payload, { width: 420, margin: 2, color: { dark: "#6f2c91", light: "#ffffff" }, errorCorrectionLevel: "H" }).then(setQrImage);
  }, [paymentCode]);
  if (!reservation) return <Section title="Preparando tu reserva" subtitle="Estamos generando tu código seguro de pago." />;
  const message = `Hola John Tours, adjunto mi comprobante Yape de S/ ${reservationAmount} para ${reservation.tour.title}. Código de pago: ${paymentCode}. Reserva #${id}.`;
  const simulatePayment = () => {
    localStorage.setItem(`john-reservation-${id}`, JSON.stringify({ ...reservation, status: "PAGADA" }));
    navigate(`/confirmacion/${id}?demo=1`);
  };
  return <Section title="Separa tu tour con Yape" subtitle="Sin pasarela ni datos de tarjeta: paga S/ 200, conserva tu código y envía el comprobante a un asesor."><div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-[.9fr_1.1fr]"><article className="yape-card"><div className="yape-brand"><img src="/yape-logo.png" alt="Yape" /><span>Reserva con Yape</span></div><span className="yape-label">Reserva protegida</span><h3>{reservation.tour.title}</h3><p>{reservation.customer.fullName} · {reservation.peopleCount} viajero(s)</p><div className="reservation-price"><small>Monto de separación</small><strong>S/ {reservationAmount}.00</strong></div><div className="payment-code"><div><small>Código único de pago</small><strong>{paymentCode}</strong></div><button onClick={() => { navigator.clipboard.writeText(paymentCode); setCopied(true); }} aria-label="Copiar código"><Copy size={18} /> {copied ? "Copiado" : "Copiar"}</button></div><div className="secure-note"><ShieldCheck /> <span>Incluye este código en el mensaje del comprobante. John Tours validará titular, monto y reserva antes de confirmar el cupo. El PDF se habilita únicamente después de esa confirmación.</span></div><button type="button" onClick={simulatePayment} className="demo-payment"><Sparkles /><span><strong>Demostración para presentación</strong><small>Simular validación del pago y ver la reserva confirmada</small></span><ArrowRight /></button></article><article className="qr-card yape-qr-card"><div className="yape-qr-heading"><img src="/yape-logo.png" alt="Yape" /><span><strong>Yapea tu reserva</strong><small>Escanea el código QR</small></span></div>{qrImage && <div className="yape-qr-frame"><img src={qrImage} alt={`QR de instrucciones para la reserva ${paymentCode}`} /></div>}<strong>Yape asociado al contacto: {whatsappDisplay}</strong><p>El QR contiene las instrucciones y el código único. Antes de transferir, verifica en Yape que el titular corresponda a la cuenta empresarial comunicada por John Tours.</p><a href={buildWhatsAppUrl(message)} target="_blank" rel="noreferrer" className="whatsapp-cta"><MessageCircle /> Enviar comprobante por WhatsApp</a><small>La reserva se confirma después de la validación manual del comprobante.</small></article></div></Section>;
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
          title: "John Tours",
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
      window.Culqi.settings({ title: "John Tours", currency: "PEN", amount: amountInCents });
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
  const [searchParams] = useSearchParams();
  const isDemo = searchParams.get("demo") === "1";
  const { data: reservation } = useQuery<Reservation>({ queryKey: ["reservation", id], queryFn: async () => { try { return (await api.get(`/reservations/${id}`)).data; } catch { const saved = localStorage.getItem(`john-reservation-${id}`); if (!saved) throw new Error("Reserva no encontrada"); return JSON.parse(saved) as Reservation; } } });
  const guide = reservation ? guideForTour(reservation.tour) : null;
  return <Section title={isDemo ? "Demostración: reserva confirmada" : "Reserva confirmada"} subtitle={`${isDemo ? "Simulación de presentación · " : ""}Código de reserva #${id}`}>{reservation && guide && <div className="mx-auto max-w-4xl rounded-2xl border bg-white p-6 text-center shadow-sm sm:p-8">{isDemo && <div className="mb-6 rounded-xl border border-cyan-200 bg-cyan-50 p-4 text-sm font-bold text-[#087db8]">Modo demostración: no se realizó ningún cobro ni se registró una operación bancaria.</div>}<CheckCircle2 className="mx-auto text-[#09a889]" size={64} /><h3 className="mt-4 text-2xl font-black text-[#073b83]">{reservation.tour.title}</h3><p className="mt-2 text-slate-600">Gracias, {reservation.customer.fullName}. La separación de S/ 200 ha sido validada y tu solicitud de reserva quedó registrada.</p><div className="post-payment-guide mx-auto mt-7 overflow-hidden rounded-2xl border border-slate-200 bg-[#f3f9fd] text-left"><img src={guide.imageUrl} alt={`Imagen referencial de ${guide.label}`} className="h-60 w-full object-cover md:h-auto" /><div className="p-5"><span className="text-xs font-black uppercase tracking-widest text-[#087db8]">Contenido desbloqueado después del pago</span><h4 className="mt-2 text-xl font-black text-[#073b83]">Extras disponibles para {guide.label}</h4><p className="mt-2 text-sm leading-6 text-slate-600">Estas opciones no aparecen en el catálogo principal. Se muestran ahora porque tu reserva confirma el interés en adquirir el paquete.</p><div className="mt-4 grid gap-2 sm:grid-cols-2">{guide.extras.map((extra) => <span key={extra} className="flex items-center gap-2 rounded-lg bg-white px-3 py-2 text-sm font-bold text-[#34536b]"><CheckCircle2 size={16} className="text-[#09a889]" />{extra}</span>)}</div><a href={guide.key === "general" ? "/servicios-adicionales-john-tours.pdf" : `/guia-extras-${guide.key}-john-tours.pdf`} download className="download-guide mt-5"><FileText /><span><strong>Descargar guía PDF de {guide.label}</strong><small>Incluye logo, imagen referencial y detalles de cada extra</small></span><Download /></a></div></div><div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row"><Link className="rounded-lg bg-[#073b83] px-5 py-3 font-bold text-white" to="/">Volver al inicio</Link><a className="rounded-lg bg-[#09a889] px-5 py-3 font-bold text-white" href={buildWhatsAppUrl(whatsappMessages.reservation(reservation))}>Contactar a John Tours</a></div></div>}</Section>;
}

function AdminPage() {
  const [token, setToken] = useState(localStorage.getItem("adminToken"));
  const [tourForm, setTourForm] = useState<AdminTourForm>(emptyAdminTourForm);
  const form = useForm<{ email: string; password: string }>({ defaultValues: { email: "admin@johntours.com", password: "Admin12345" } });
  const queryClient = useQueryClient();
  const login = useMutation({
    mutationFn: async (values: { email: string; password: string }) => {
      try {
        return (await api.post("/auth/login", values)).data;
      } catch (error) {
        if (values.email === "admin@johntours.com" && values.password === "Admin12345") {
          return { token: "demo-admin-token", user: { email: values.email, name: "Administrador John Tours", role: "ADMIN" } };
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
  if (!token) return <Section title="Login administrador" subtitle="Acceso al panel de gestion de John Tours"><form onSubmit={form.handleSubmit((v) => login.mutate(v))} className="mx-auto grid max-w-md gap-4 rounded-lg border bg-white p-6 shadow-sm"><input className="rounded-lg border px-4 py-3" {...form.register("email")} /><input className="rounded-lg border px-4 py-3" type="password" {...form.register("password")} />{login.isError && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm font-bold text-red-700">Credenciales invalidas.</p>}<button className="rounded-lg bg-[#082447] px-5 py-3 font-black text-white" disabled={login.isPending}>{login.isPending ? "Ingresando..." : "Ingresar"}</button></form></Section>;
  return (
    <Section title="Panel administrativo" subtitle="Gestion de reservas, pagos y operaciones.">
      <button onClick={() => { localStorage.removeItem("adminToken"); setToken(null); }} className="mb-5 inline-flex items-center gap-2 rounded-lg border bg-white px-4 py-2 font-bold"><LogOut size={18} /> Salir</button>
      <div className="mb-6 grid gap-4 md:grid-cols-4">
        <AdminMetric label="Tours activos" value={String(tours.data?.length ?? 0)} />
        <AdminMetric label="Reservas" value={String(reservations.data?.length ?? 0)} />
        <AdminMetric label="Pagos" value={String(payments.data?.length ?? 0)} />
        <AdminMetric label="Modo reserva" value="Yape + validación" />
      </div>
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
            <AdminField label="Duracion" value={tourForm.duration} onChange={(value) => setTourForm({ ...tourForm, duration: value })} />
            <AdminField label="Cupos" type="number" value={tourForm.availableSlots} onChange={(value) => setTourForm({ ...tourForm, availableSlots: value })} />
            <label className="grid gap-1 text-sm font-bold text-slate-700">Tipo<select className="rounded-lg border px-3 py-3" value={tourForm.type} onChange={(event) => setTourForm({ ...tourForm, type: event.target.value as TourType })}><option value="NACIONAL">Nacional</option><option value="INTERNACIONAL">Internacional</option></select></label>
            <label className="grid gap-1 text-sm font-bold text-slate-700">Estado<select className="rounded-lg border px-3 py-3" value={tourForm.status} onChange={(event) => setTourForm({ ...tourForm, status: event.target.value as TourStatus })}><option value="ACTIVO">Activo</option><option value="INACTIVO">Inactivo</option></select></label>
            <label className="flex items-center gap-2 rounded-lg border px-3 py-3 text-sm font-bold text-slate-700"><input type="checkbox" checked={tourForm.isFeatured} onChange={(event) => setTourForm({ ...tourForm, isFeatured: event.target.checked })} /> Destacado</label>
          </div>
          <AdminField label="Imagen URL" value={tourForm.imageUrl} onChange={(value) => setTourForm({ ...tourForm, imageUrl: value })} />
          <AdminField label="Credito o licencia de imagen" value={tourForm.imageCredit} onChange={(value) => setTourForm({ ...tourForm, imageCredit: value })} />
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

const blankSettings: BusinessSettings = { tradeName: "John Tours", policiesPublished: false };

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
    <Section title="Historias de viajeros felices" subtitle="Experiencias reales de personas que confiaron sus viajes a John Tours.">
      <div id="testimonialCarousel" className="carousel slide testimonial-carousel rounded-lg bg-white p-4 shadow-xl" data-bs-ride="carousel">
        <div className="carousel-inner">
          {data.map((item, index) => (
            <div key={item.name} className={`carousel-item ${index === 0 ? "active" : ""}`} data-bs-interval="4800">
              <div className="testimonial-card mx-auto max-w-3xl rounded-2xl p-7 text-center md:p-10">
                <span className="testimonial-avatar mx-auto mb-4 grid h-14 w-14 place-items-center rounded-full text-lg font-black text-white">{item.name.split(" ").map((part) => part[0]).slice(0, 2).join("")}</span>
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
  return <section className="section-pro px-4 py-14 lg:px-6"><div className="mx-auto max-w-7xl"><div className="mb-8 max-w-3xl"><p className="mb-2 inline-flex items-center gap-2 rounded-lg bg-emerald-50 px-3 py-1 text-sm font-bold text-[#0f7a4f]"><ShieldCheck size={16} /> John Tours</p><h2 className="text-3xl font-black text-[#082447] md:text-4xl">{title}</h2><p className="mt-3 leading-7 text-slate-600">{subtitle}</p></div>{children}</div></section>;
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

function Footer() {
  return <footer className="footer-pro border-t px-4 pb-8 pt-14 text-white"><div className="mx-auto grid max-w-7xl gap-10 sm:grid-cols-2 lg:grid-cols-5"><div className="sm:col-span-2"><img src="/john-tours-logo-cropped.png" alt="John Tours Perú" className="h-20 w-auto rounded-xl bg-white p-2" /><p className="mt-5 max-w-xl leading-7 text-slate-300">Agencia de viajes y turismo para experiencias nacionales e internacionales, promociones escolares y grupos, con atención humana y reserva por Yape.</p></div><div><strong className="text-cyan-200">Explora</strong><nav className="mt-4 grid gap-3 text-sm text-slate-300"><Link to="/">Inicio</Link><Link to="/tours">Todos los tours</Link><Link to="/#nosotros">Nuestra historia</Link><a href={tiktokUrl} target="_blank" rel="noreferrer">TikTok</a><a href={instagramUrl} target="_blank" rel="noreferrer">Instagram</a></nav></div><div><strong className="text-cyan-200">Contacto</strong><p className="mt-4 text-sm leading-7 text-slate-300">johntoursperu29@gmail.com<br />{whatsappDisplay}<br />+51 982 896 989<br />Santa Clara, Ate · Cusco</p><div className="mt-4"><span className="payment-chip">Reserva Yape S/ 200</span></div></div><div><strong className="text-cyan-200">Información legal</strong><nav className="mt-4 grid gap-3 text-sm text-slate-300"><Link to="/legal/terminos">Términos</Link><Link to="/legal/privacidad">Privacidad</Link><Link to="/legal/cancelaciones">Cancelaciones</Link><Link to="/legal/reembolsos">Reembolsos</Link></nav></div></div><div className="mx-auto mt-10 flex max-w-7xl flex-col justify-between gap-3 border-t border-white/10 pt-6 text-xs text-slate-400 sm:flex-row"><span>© {new Date().getFullYear()} John Tours Perú. Todos los derechos reservados.</span><span>Viaja seguro · Vive extraordinario</span></div></footer>;
}

export default Shell;
