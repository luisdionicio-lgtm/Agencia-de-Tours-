import { ArrowRight, CalendarDays, CreditCard, LockKeyhole, Menu, ShieldCheck, X } from "lucide-react";
import { type ReactNode, useEffect, useState } from "react";
import { Link, NavLink, usePathname } from "../../../core/routing";
import { buildWhatsAppUrl, socialLinks, whatsappDisplay } from "../config/contact";

const navigationLinks = [
  ["Inicio", "/"],
  ["Tours Nacionales", "/tours?type=NACIONAL"],
  ["Tours Internacionales", "/tours?type=INTERNACIONAL"],
  ["Paquetes", "/tours"],
  ["Nosotros", "/#nosotros"],
  ["Contacto", "/#contacto"]
] as const;

const advisorMessages = [
  "Cuéntanos tu presupuesto",
  "Buscamos opciones para ti",
  "Cotiza sin compromiso"
];

const budgetOrientationMessage = "Hola JohnToursPerú, deseo orientación según mi presupuesto para elegir un viaje. Mi presupuesto aproximado es: [indicar monto]. Viajaríamos: [cantidad de personas]. Fechas estimadas: [indicar fechas]. Destino de interés: [indicar destino o solicitar recomendación].";

export function SiteShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const updateProgress = () => {
      const available = document.documentElement.scrollHeight - window.innerHeight;
      setScrollProgress(available > 0 ? Math.min((window.scrollY / available) * 100, 100) : 0);
    };
    const revealObserver = new IntersectionObserver(
      (entries) => entries.forEach((entry) => entry.isIntersecting && entry.target.classList.add("is-visible")),
      { rootMargin: "0px 0px -6%", threshold: 0.01 }
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
  }, [pathname]);

  return (
    <div className="site-shell min-h-screen">
      <a href="#main-content" className="skip-navigation">Saltar al contenido principal</a>
      <PublicHeader menuOpen={menuOpen} scrollProgress={scrollProgress} onToggleMenu={() => setMenuOpen((current) => !current)} onCloseMenu={() => setMenuOpen(false)} />
      <main id="main-content" className="overflow-hidden" tabIndex={-1}>{children}</main>
      <PublicFooter />
      {pathname !== "/admin" && <FloatingWhatsApp />}
    </div>
  );
}

function PublicHeader({ menuOpen, scrollProgress, onToggleMenu, onCloseMenu }: { menuOpen: boolean; scrollProgress: number; onToggleMenu: () => void; onCloseMenu: () => void }) {
  return (
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
        <Link to="/" className="brand-lockup flex items-center gap-3" aria-label="JohnToursPerú, inicio">
          <span className="header-brand-stage">
            <span className="header-brand-glow" aria-hidden="true" />
            <img src="/john-tours-logo-cropped.png" alt="JohnToursPerú" className="header-logo" />
          </span>
        </Link>

        <nav className="primary-nav hidden items-center gap-6 text-sm font-semibold text-slate-700 lg:flex" aria-label="Navegación principal">
          {navigationLinks.map(([label, to]) => <NavLink key={label} to={to}>{label}</NavLink>)}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          <Link to="/tours" className="btn-gold header-reserve-button">
            <span className="button-emblem"><CalendarDays size={16} /></span>
            <span>Reservar ahora</span>
            <ArrowRight className="button-arrow" size={16} />
          </Link>
        </div>

        <button className="menu-button rounded-xl border border-slate-200 p-2 lg:hidden" onClick={onToggleMenu} aria-label={menuOpen ? "Cerrar menú" : "Abrir menú"} aria-expanded={menuOpen}>
          {menuOpen ? <X /> : <Menu />}
        </button>
      </div>

      {menuOpen && (
        <nav className="mobile-menu border-t border-slate-200 bg-white/95 px-4 py-4 backdrop-blur-xl lg:hidden" aria-label="Navegación móvil">
          {navigationLinks.map(([label, to]) => <Link key={label} to={to} onClick={onCloseMenu} className="block rounded-lg px-3 py-3 font-semibold text-slate-700">{label}</Link>)}
        </nav>
      )}
    </header>
  );
}

function FloatingWhatsApp() {
  const [messageIndex, setMessageIndex] = useState(0);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    const messageTimer = window.setInterval(() => setMessageIndex((current) => (current + 1) % advisorMessages.length), 3800);
    return () => {
      window.clearInterval(messageTimer);
    };
  }, []);

  return (
    <div className={`floating-whatsapp-wrap ${expanded ? "is-expanded" : ""}`} onMouseEnter={() => setExpanded(true)} onMouseLeave={() => setExpanded(false)}>
      <div className="floating-whatsapp-message" role="status"><span className="advisor-status" /> <strong>Asesoría disponible</strong><small>{advisorMessages[messageIndex]}</small></div>
      <a href={buildWhatsAppUrl(budgetOrientationMessage)} className="floating-whatsapp" target="_blank" rel="noreferrer" aria-label="Recibir orientación de JohnToursPerú según mi presupuesto por WhatsApp" onFocus={() => setExpanded(true)} onBlur={() => setExpanded(false)}>
        <span className="floating-whatsapp-rings" aria-hidden="true" />
        <img src="/whatsapp-logo.svg" alt="" />
        <span className="floating-whatsapp-label"><strong>Según tu presupuesto</strong><small>Orientación por WhatsApp</small></span>
        <span className="floating-notification" aria-hidden="true">1</span>
      </a>
    </div>
  );
}

function PublicFooter() {
  return (
    <footer className="footer-pro border-t px-4 pb-8 pt-14 text-white">
      <div className="mx-auto grid max-w-7xl gap-10 sm:grid-cols-2 lg:grid-cols-6">
        <div className="sm:col-span-2">
          <img src="/john-tours-logo-cropped.png" alt="JohnToursPerú" className="h-20 w-auto rounded-xl bg-white p-2" />
          <p className="mt-5 max-w-xl leading-7 text-slate-300">Agencia de viajes y turismo para experiencias nacionales e internacionales, promociones escolares y grupos, con atención humana y reserva por Yape.</p>
        </div>
        <div>
          <strong className="text-cyan-200">Explora</strong>
          <nav className="mt-4 grid gap-3 text-sm text-slate-300" aria-label="Enlaces del sitio">
            <Link to="/">Inicio</Link><Link to="/tours">Todos los tours</Link><Link to="/#nosotros">Nuestra historia</Link>
            <a href={socialLinks.tiktok} target="_blank" rel="noreferrer" aria-label="Abrir TikTok de JohnToursPerú">TikTok</a>
            <a href={socialLinks.instagram} target="_blank" rel="noreferrer" aria-label="Abrir Instagram de JohnToursPerú">Instagram</a>
          </nav>
        </div>
        <div>
          <strong className="text-cyan-200">Destinos</strong>
          <nav className="mt-4 grid gap-3 text-sm text-slate-300" aria-label="Destinos destacados">
            <Link to="/tours?destination=Cusco">Cusco, Puno y Arequipa</Link><Link to="/tours?destination=Guayaquil">Guayaquil y costa</Link><Link to="/tours?destination=Pasco">Oxapampa y Pozuzo</Link><Link to="/tours?destination=Ica">Ica y Huacachina</Link><Link to="/tours?destination=San%20Martín">Tarapoto</Link>
          </nav>
        </div>
        <div>
          <strong className="text-cyan-200">Contacto</strong>
          <p className="mt-4 text-sm leading-7 text-slate-300">johntoursperu29@gmail.com<br />{whatsappDisplay}<br />+51 982 896 989<br />Santa Clara, Ate · Cusco</p>
          <div className="mt-4"><span className="payment-chip">Reserva Yape S/ 200</span></div>
          <div className="footer-payment-methods"><span><img src="/yape-logo.png" alt="Yape" /> Yape</span><span><CreditCard size={17} /> Transferencia</span></div>
        </div>
        <div>
          <strong className="text-cyan-200">Información legal</strong>
          <nav className="mt-4 grid gap-3 text-sm text-slate-300" aria-label="Información legal">
            <Link to="/legal/terminos">Términos</Link><Link to="/legal/privacidad">Privacidad</Link><Link to="/legal/cancelaciones">Cancelaciones</Link><Link to="/legal/reembolsos">Reembolsos</Link>
          </nav>
        </div>
      </div>
      <div className="mx-auto mt-10 flex max-w-7xl flex-col justify-between gap-3 border-t border-white/10 pt-6 text-xs text-slate-400 sm:flex-row">
        <span>© {new Date().getFullYear()} JohnToursPerú. Todos los derechos reservados.</span>
        <span className="footer-bottom-links">Viaja seguro · Vive extraordinario <a href="/demo?demo=1">Probar demo</a><Link to="/admin"><LockKeyhole size={13} /> Acceso interno</Link></span>
      </div>
    </footer>
  );
}
