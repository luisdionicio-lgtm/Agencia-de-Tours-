import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowRight, CalendarDays, CheckCircle2, CreditCard, Filter, Globe2, LayoutDashboard, LogOut, MapPin, Menu, MessageCircle, Plane, Search, ShieldCheck, Star, WalletCards, X } from "lucide-react";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { Link, NavLink, Route, Routes, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { z } from "zod";
import { api } from "./api/client";
import type { Payment, Reservation, Tour, TourType } from "./types";

const money = (value: string | number) => `$${Number(value).toFixed(2)}`;
const whatsapp = import.meta.env.VITE_WHATSAPP_NUMBER ?? "51999999999";

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
    <div className="min-h-screen bg-slate-50">
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 lg:px-6">
          <Link to="/" className="flex items-center gap-3">
            <span className="grid h-11 w-11 place-items-center rounded-lg bg-[#082447] text-amber-300"><Plane size={23} /></span>
            <span>
              <strong className="block text-lg leading-tight text-[#082447]">Jhon Tours</strong>
              <small className="text-xs font-semibold uppercase tracking-widest text-slate-500">Agencia de Turismo</small>
            </span>
          </Link>
          <nav className="hidden items-center gap-6 text-sm font-semibold text-slate-700 lg:flex">
            {links.map(([label, to]) => <NavLink key={label} to={to} className="hover:text-[#0f4c81]">{label}</NavLink>)}
          </nav>
          <div className="hidden items-center gap-3 lg:flex">
            <Link to="/admin" className="rounded-lg border border-slate-200 px-4 py-2 text-sm font700 text-slate-700">Admin</Link>
            <Link to="/tours" className="rounded-lg bg-[#f7b731] px-5 py-2.5 text-sm font-bold text-[#082447] shadow-sm">Reservar ahora</Link>
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
  return useQuery<Tour[]>({
    queryKey: ["tours", type],
    queryFn: async () => (await api.get("/tours", { params: type ? { type } : {} })).data
  });
}

function TourCard({ tour }: { tour: Tour }) {
  return (
    <article className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl">
      <img src={tour.imageUrl} alt={tour.title} className="h-56 w-full object-cover" />
      <div className="space-y-4 p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="flex items-center gap-1 text-sm font-semibold text-[#0f7a4f]"><MapPin size={16} /> {tour.destination}</p>
            <h3 className="mt-1 text-xl font-bold text-[#082447]">{tour.title}</h3>
          </div>
          <span className="rounded-lg bg-amber-100 px-3 py-1 text-sm font-bold text-amber-700">{tour.type}</span>
        </div>
        <p className="line-clamp-2 text-sm leading-6 text-slate-600">{tour.description}</p>
        <div className="flex items-center justify-between border-t border-slate-100 pt-4">
          <span className="text-2xl font-black text-[#082447]">{money(tour.price)}</span>
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
  const types = ["Aventura", "Playa", "Cultural", "Familiar", "Romantico", "Lujo"];

  return (
    <>
      <section className="hero-bg">
        <div className="mx-auto grid min-h-[660px] max-w-7xl items-center gap-10 px-4 py-14 lg:grid-cols-[1.05fr_.95fr] lg:px-6">
          <div className="max-w-3xl text-white">
            <p className="mb-4 inline-flex rounded-lg bg-white/15 px-4 py-2 text-sm font-bold text-amber-200 ring-1 ring-white/20">Tours seguros, memorables y a buen precio</p>
            <h1 className="text-4xl font-black leading-tight md:text-6xl">Descubre el mundo con Jhon Tours</h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-100">Tours nacionales e internacionales al mejor precio, con reservas online, pagos seguros y asesoria personalizada.</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link to="/tours" className="rounded-lg bg-[#f7b731] px-6 py-3 text-center font-black text-[#082447]">Ver tours</Link>
              <a href={`https://wa.me/${whatsapp}`} className="rounded-lg bg-[#1fa463] px-6 py-3 text-center font-black text-white">Cotizar viaje</a>
            </div>
          </div>
          <SearchBox />
        </div>
      </section>
      <Section title="Tours destacados" subtitle="Paquetes elegidos para viajar con confianza y asistencia desde la primera cotizacion.">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">{featured.map((tour) => <TourCard key={tour.id} tour={tour} />)}</div>
      </Section>
      <Section title="Tipos de viaje" subtitle="Elige el estilo de experiencia que quieres vivir.">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-6">{types.map((type) => <div key={type} className="rounded-lg border border-slate-200 bg-white p-5 text-center shadow-sm"><Globe2 className="mx-auto mb-3 text-[#0f4c81]" /><strong>{type}</strong></div>)}</div>
      </Section>
      <Testimonials />
      <section id="contacto" className="bg-[#082447] px-4 py-14 text-white">
        <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-6 lg:flex-row lg:items-center">
          <div><h2 className="text-3xl font-black">Listo para tu siguiente viaje?</h2><p className="mt-2 text-slate-200">Cotiza por WhatsApp y recibe una propuesta a tu medida.</p></div>
          <a href={`https://wa.me/${whatsapp}`} className="inline-flex items-center gap-2 rounded-lg bg-[#1fa463] px-6 py-3 font-black"><MessageCircle /> Hablar por WhatsApp</a>
        </div>
      </section>
    </>
  );
}

function SearchBox() {
  const navigate = useNavigate();
  const [destination, setDestination] = useState("");
  const [type, setType] = useState("");
  return (
    <div className="glass rounded-lg p-5 shadow-2xl">
      <h2 className="text-2xl font-black text-[#082447]">Busca tu destino</h2>
      <div className="mt-5 grid gap-3">
        <input className="rounded-lg border border-slate-200 px-4 py-3" placeholder="Destino" value={destination} onChange={(e) => setDestination(e.target.value)} />
        <input className="rounded-lg border border-slate-200 px-4 py-3" type="date" />
        <select className="rounded-lg border border-slate-200 px-4 py-3" value={type} onChange={(e) => setType(e.target.value)}>
          <option value="">Tipo de viaje</option><option value="NACIONAL">Nacional</option><option value="INTERNACIONAL">Internacional</option>
        </select>
        <input className="rounded-lg border border-slate-200 px-4 py-3" type="number" min="1" placeholder="Personas" />
        <button className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#082447] px-5 py-3 font-black text-white" onClick={() => navigate(`/tours?${new URLSearchParams({ ...(type && { type }), ...(destination && { destination }) }).toString()}`)}><Search /> Buscar tours</button>
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
        <label className="flex items-center gap-3 rounded-lg border px-4 py-3"><Filter size={18} /> Hasta ${maxPrice}<input type="range" min="100" max="3000" step="50" value={maxPrice} onChange={(e) => setMaxPrice(Number(e.target.value))} /></label>
        <a href={`https://wa.me/${whatsapp}`} className="rounded-lg bg-[#1fa463] px-4 py-3 text-center font-black text-white">Cotizar personalizado</a>
      </div>
      {isLoading ? <p>Cargando tours...</p> : <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">{filtered.map((tour) => <TourCard key={tour.id} tour={tour} />)}</div>}
    </Section>
  );
}

function TourDetail() {
  const { id = "" } = useParams();
  const { data: tour, isLoading } = useQuery<Tour>({ queryKey: ["tour", id], queryFn: async () => (await api.get(`/tours/${id}`)).data });
  if (isLoading || !tour) return <Section title="Cargando tour" subtitle="Preparando detalles..." />;
  const itinerary = tour.itinerary ?? ["Recepcion y briefing", "Experiencia principal", "Actividades libres", "Retorno"];
  const includes = tour.includes ?? ["Asistencia", "Traslados", "Guia"];
  const excludes = tour.excludes ?? ["Gastos personales"];
  return (
    <Section title={tour.title} subtitle={`${tour.destination} · ${tour.duration}`}>
      <div className="grid gap-8 lg:grid-cols-[1.2fr_.8fr]">
        <img src={tour.imageUrl} alt={tour.title} className="h-[440px] w-full rounded-lg object-cover shadow-xl" />
        <aside className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-bold uppercase text-[#0f7a4f]">{tour.type}</p>
          <p className="mt-3 text-4xl font-black text-[#082447]">{money(tour.price)}</p>
          <p className="mt-2 text-slate-600">Cupos disponibles: <strong>{tour.availableSlots}</strong></p>
          <Link to={`/reservar/${tour.id}`} className="mt-6 flex items-center justify-center gap-2 rounded-lg bg-[#f7b731] px-5 py-3 font-black text-[#082447]">Reservar <ArrowRight /></Link>
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

function ReservationPage() {
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const { data: tour } = useQuery<Tour>({ queryKey: ["tour", id], queryFn: async () => (await api.get(`/tours/${id}`)).data });
  const form = useForm<ReservationForm>({ resolver: zodResolver(reservationSchema), defaultValues: { peopleCount: 1 } });
  const people = Number(form.watch("peopleCount") || 1);
  const mutation = useMutation({
    mutationFn: async (values: ReservationForm) => (await api.post("/reservations", { ...reservationSchema.parse(values), tourId: Number(id) })).data,
    onSuccess: (reservation: Reservation) => navigate(`/pago/${reservation.id}`)
  });
  return (
    <Section title="Reserva tu viaje" subtitle={tour ? `${tour.title} · Total estimado ${money(Number(tour.price) * people)}` : "Completa tus datos"}>
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
  const mutation = useMutation({
    mutationFn: async (method: "culqi" | "yape") => (await api.post(`/payments/${method}`, { reservationId: Number(id), token: "demo_token" })).data,
    onSuccess: () => navigate(`/confirmacion/${id}`)
  });
  return (
    <Section title="Pago seguro" subtitle="El backend recalcula el monto desde la reserva antes de cobrar.">
      {reservation && <div className="mx-auto max-w-3xl rounded-lg border bg-white p-6 shadow-sm">
        <h3 className="text-2xl font-black text-[#082447]">{reservation.tour.title}</h3>
        <p className="mt-2 text-slate-600">{reservation.peopleCount} personas · Total: <strong>{money(reservation.totalAmount)}</strong></p>
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <button onClick={() => mutation.mutate("culqi")} className="flex items-center justify-center gap-2 rounded-lg bg-[#082447] px-5 py-4 font-black text-white"><CreditCard /> Pagar con tarjeta</button>
          <button onClick={() => mutation.mutate("yape")} className="flex items-center justify-center gap-2 rounded-lg bg-[#6d2bd9] px-5 py-4 font-black text-white"><WalletCards /> Pagar con Yape</button>
        </div>
        <p className="mt-4 text-sm text-slate-500">Modo demo activo hasta configurar las llaves reales de Culqi.</p>
      </div>}
    </Section>
  );
}

function ConfirmationPage() {
  const { id = "" } = useParams();
  const { data: reservation } = useQuery<Reservation>({ queryKey: ["reservation", id], queryFn: async () => (await api.get(`/reservations/${id}`)).data });
  return <Section title="Reserva pagada" subtitle={`Codigo de reserva #${id}`}>{reservation && <div className="mx-auto max-w-2xl rounded-lg border bg-white p-8 text-center shadow-sm"><CheckCircle2 className="mx-auto text-[#1fa463]" size={60} /><h3 className="mt-4 text-2xl font-black text-[#082447]">{reservation.tour.title}</h3><p className="mt-2 text-slate-600">Gracias, {reservation.customer.fullName}. Te contactaremos para coordinar los detalles finales.</p><div className="mt-6 flex justify-center gap-3"><Link className="rounded-lg bg-[#082447] px-5 py-3 font-bold text-white" to="/">Volver al inicio</Link><a className="rounded-lg bg-[#1fa463] px-5 py-3 font-bold text-white" href={`https://wa.me/${whatsapp}`}>WhatsApp</a></div></div>}</Section>;
}

function AdminPage() {
  const [token, setToken] = useState(localStorage.getItem("adminToken"));
  const form = useForm<{ email: string; password: string }>({ defaultValues: { email: "admin@jhontours.com", password: "Admin12345" } });
  const queryClient = useQueryClient();
  const login = useMutation({
    mutationFn: async (values: { email: string; password: string }) => (await api.post("/auth/login", values)).data,
    onSuccess: (data) => { localStorage.setItem("adminToken", data.token); setToken(data.token); queryClient.invalidateQueries(); }
  });
  const reservations = useQuery<Reservation[]>({ queryKey: ["adminReservations", token], queryFn: async () => (await api.get("/reservations")).data, enabled: Boolean(token) });
  const payments = useQuery<Payment[]>({ queryKey: ["adminPayments", token], queryFn: async () => (await api.get("/payments")).data, enabled: Boolean(token) });
  if (!token) return <Section title="Login administrador" subtitle="Acceso al panel de gestion de Jhon Tours"><form onSubmit={form.handleSubmit((v) => login.mutate(v))} className="mx-auto grid max-w-md gap-4 rounded-lg border bg-white p-6 shadow-sm"><input className="rounded-lg border px-4 py-3" {...form.register("email")} /><input className="rounded-lg border px-4 py-3" type="password" {...form.register("password")} /><button className="rounded-lg bg-[#082447] px-5 py-3 font-black text-white">Ingresar</button></form></Section>;
  return (
    <Section title="Panel administrativo" subtitle="Gestion de reservas, pagos y operaciones.">
      <button onClick={() => { localStorage.removeItem("adminToken"); setToken(null); }} className="mb-5 inline-flex items-center gap-2 rounded-lg border bg-white px-4 py-2 font-bold"><LogOut size={18} /> Salir</button>
      <div className="grid gap-6 lg:grid-cols-2">
        <AdminTable title="Reservas" rows={(reservations.data ?? []).map((r) => [`#${r.id}`, r.customer.fullName, r.tour.title, r.status, money(r.totalAmount)])} />
        <AdminTable title="Pagos" rows={(payments.data ?? []).map((p) => [`#${p.id}`, p.paymentMethod, p.status, money(p.amount), p.culqiChargeId ?? "-"])} />
      </div>
      <div className="mt-6 rounded-lg border bg-white p-6 shadow-sm"><h3 className="mb-3 flex items-center gap-2 text-xl font-black text-[#082447]"><LayoutDashboard /> CRUD de tours</h3><p className="text-slate-600">La API ya expone POST, PUT y DELETE protegidos con JWT para conectar formularios avanzados o una tabla editable.</p></div>
    </Section>
  );
}

function AdminTable({ title, rows }: { title: string; rows: string[][] }) {
  return <div className="overflow-hidden rounded-lg border bg-white shadow-sm"><h3 className="border-b p-4 text-xl font-black text-[#082447]">{title}</h3><div className="overflow-x-auto"><table className="w-full text-left text-sm"><tbody>{rows.map((row, i) => <tr key={i} className="border-b last:border-0">{row.map((cell) => <td key={cell} className="px-4 py-3">{cell}</td>)}</tr>)}</tbody></table></div></div>;
}

function Testimonials() {
  const { data = [] } = useQuery<{ name: string; location: string; comment: string; rating: number }[]>({ queryKey: ["testimonials"], queryFn: async () => (await api.get("/testimonials")).data });
  return <Section title="Testimonios" subtitle="Viajeros que confiaron en Jhon Tours."><div className="grid gap-5 md:grid-cols-3">{data.map((item) => <div key={item.name} className="rounded-lg border bg-white p-6 shadow-sm"><div className="mb-3 flex text-amber-400">{Array.from({ length: item.rating }).map((_, i) => <Star key={i} size={18} fill="currentColor" />)}</div><p className="leading-7 text-slate-600">{item.comment}</p><strong className="mt-4 block text-[#082447]">{item.name}</strong><span className="text-sm text-slate-500">{item.location}</span></div>)}</div></Section>;
}

function Section({ title, subtitle, children }: { title: string; subtitle: string; children?: React.ReactNode }) {
  return <section className="px-4 py-14 lg:px-6"><div className="mx-auto max-w-7xl"><div className="mb-8 max-w-3xl"><p className="mb-2 inline-flex items-center gap-2 rounded-lg bg-emerald-50 px-3 py-1 text-sm font-bold text-[#0f7a4f]"><ShieldCheck size={16} /> Jhon Tours</p><h2 className="text-3xl font-black text-[#082447] md:text-4xl">{title}</h2><p className="mt-3 leading-7 text-slate-600">{subtitle}</p></div>{children}</div></section>;
}

function Info({ title, items, ordered = false }: { title: string; items: string[]; ordered?: boolean }) {
  const List = ordered ? "ol" : "ul";
  return <div className="rounded-lg border bg-white p-6 shadow-sm"><h3 className="mb-4 text-xl font-black text-[#082447]">{title}</h3><List className="space-y-3 text-slate-600">{items.map((item) => <li key={item} className="leading-7">{item}</li>)}</List></div>;
}

function Footer() {
  return <footer id="nosotros" className="border-t bg-white px-4 py-10"><div className="mx-auto grid max-w-7xl gap-6 md:grid-cols-3"><div><strong className="text-xl text-[#082447]">Jhon Tours</strong><p className="mt-2 text-slate-600">Agencia de turismo especializada en paquetes nacionales e internacionales.</p></div><div><strong>Contacto</strong><p className="mt-2 text-slate-600">ventas@jhontours.com<br />WhatsApp +51 999 999 999</p></div><div><strong>Confianza</strong><p className="mt-2 text-slate-600">Reservas online, pagos Culqi/Yape y acompanamiento profesional.</p></div></div></footer>;
}

export default Shell;
