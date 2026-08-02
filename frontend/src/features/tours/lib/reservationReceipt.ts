import type { Reservation } from "../../../shared/types";
import { reservationAmount } from "../config/contact";
import { reservationCode } from "./presentation";

type ReceiptOptions = {
  optionalExtras?: string[];
  logoDataUrl?: string;
};

const money = (value: string | number) => Number(value || 0).toLocaleString("es-PE", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const formatDate = (value?: string) => {
  if (!value) return "Por confirmar";
  const date = new Date(`${value.slice(0, 10)}T12:00:00`);
  return Number.isNaN(date.getTime()) ? value : new Intl.DateTimeFormat("es-PE", { dateStyle: "long" }).format(date);
};

async function imageAsDataUrl(path: string) {
  const response = await fetch(path);
  if (!response.ok) throw new Error("No se pudo cargar el logo");
  const blob = await response.blob();
  return await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });
}

export async function createReservationReceipt(reservation: Reservation, options: ReceiptOptions = {}) {
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF({ format: "a4", unit: "mm" });
  const navy: [number, number, number] = [8, 36, 71];
  const blue: [number, number, number] = [15, 76, 129];
  const teal: [number, number, number] = [9, 168, 137];
  const gold: [number, number, number] = [247, 183, 49];
  const muted: [number, number, number] = [71, 85, 105];
  const code = reservationCode(reservation.id);
  const isDemo = Boolean(reservation.isDemo);
  const total = Number(reservation.totalAmount || 0);
  const balance = Math.max(total - reservationAmount, 0);
  let y = 0;

  const drawHeader = () => {
    doc.setFillColor(...navy);
    doc.rect(0, 0, 210, 43, "F");
    doc.setFillColor(...gold);
    doc.rect(0, 43, 210, 2, "F");
    if (options.logoDataUrl) {
      doc.addImage(options.logoDataUrl, "PNG", 14, 8, 58, 25, undefined, "FAST");
    } else {
      doc.setTextColor(255, 255, 255);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(15);
      doc.text("JHONTOURSPERÚ", 14, 23);
    }
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.text(isDemo ? "CONSTANCIA DEMOSTRATIVA" : "CONSTANCIA DE RESERVA", 196, 16, { align: "right" });
    doc.setFontSize(9);
    doc.text(`Código de reserva: ${code}`, 196, 24, { align: "right" });
    doc.setFont("helvetica", "normal");
    doc.text("JhonToursPerú - Agencia de viajes y turismo", 196, 31, { align: "right" });
    y = 54;
    if (isDemo) {
      doc.setFillColor(255, 247, 220);
      doc.setDrawColor(240, 190, 65);
      doc.roundedRect(14, 51, 182, 12, 2, 2, "FD");
      doc.setTextColor(117, 78, 5);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8.5);
      doc.text("MODO DEMO - Sin cobro real. No es boleta ni comprobante tributario.", 105, 58.5, { align: "center" });
      y = 72;
    }
  };

  const addPage = () => {
    doc.addPage();
    drawHeader();
  };

  const ensureSpace = (needed: number) => {
    if (y + needed > 270) addPage();
  };

  const sectionTitle = (title: string) => {
    ensureSpace(16);
    doc.setFillColor(239, 248, 247);
    doc.roundedRect(14, y - 5, 182, 10, 2, 2, "F");
    doc.setTextColor(...blue);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.text(title.toUpperCase(), 18, y + 1);
    y += 12;
  };

  const field = (label: string, value: string, x: number, width: number) => {
    doc.setTextColor(...muted);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.7);
    doc.text(label.toUpperCase(), x, y);
    doc.setTextColor(...navy);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9.5);
    doc.text(doc.splitTextToSize(value || "Por confirmar", width), x, y + 5);
  };

  const itemList = (items: string[], ordered = false) => {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.8);
    items.forEach((item, index) => {
      const prefix = ordered ? `Día ${index + 1}` : "-";
      const lines = doc.splitTextToSize(item, 158);
      const itemHeight = Math.max(7, lines.length * 4.4 + 1.5);
      ensureSpace(itemHeight);
      doc.setFillColor(...teal);
      doc.roundedRect(18, y - 3.8, ordered ? 18 : 4, 5.5, 1.4, 1.4, "F");
      doc.setTextColor(255, 255, 255);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(ordered ? 7 : 9);
      doc.text(prefix, ordered ? 27 : 20, y, { align: "center" });
      doc.setTextColor(...navy);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8.8);
      doc.text(lines, ordered ? 40 : 26, y);
      y += itemHeight;
    });
    y += 2;
  };

  const listHeight = (items: string[]) => items.reduce((height, item) => {
    const lines = doc.splitTextToSize(item, 158);
    return height + Math.max(7, lines.length * 4.4 + 1.5);
  }, 14);

  drawHeader();

  sectionTitle("Datos de la reserva");
  field("Cliente", reservation.customer.fullName, 18, 80);
  field("Contacto", [reservation.customer.phone, reservation.customer.email].filter(Boolean).join(" - "), 108, 80);
  y += 18;
  field("Paquete", reservation.tour.title, 18, 80);
  field("Destino", reservation.tour.destination, 108, 80);
  y += 18;
  field("Fecha de viaje", formatDate(reservation.travelDate), 18, 80);
  field("Viajeros", String(reservation.peopleCount), 108, 80);
  y += 20;

  sectionTitle("Resumen económico");
  field("Valor referencial", `S/ ${money(total)}`, 18, 52);
  field("Separación", `S/ ${money(reservationAmount)}`, 74, 52);
  field("Saldo estimado", `S/ ${money(balance)}`, 132, 56);
  y += 18;
  field("Método", "Yape", 18, 52);
  field("Estado", isDemo ? "Simulación sin cobro" : reservation.status === "PAGADA" ? "Pago validado" : "Validación pendiente", 74, 114);
  y += 20;

  sectionTitle(isDemo ? "Itinerario referencial de demostración" : "Itinerario del paquete");
  const itinerary = reservation.tour.itinerary?.length ? reservation.tour.itinerary : ["Coordinación del itinerario final con un asesor de JhonToursPerú."];
  itemList(itinerary, true);

  const includedServices = reservation.tour.includes?.length ? reservation.tour.includes : ["Asistencia y coordinación de JhonToursPerú"];
  ensureSpace(listHeight(includedServices));
  sectionTitle("Servicios incluidos");
  itemList(includedServices);

  sectionTitle("Servicios no incluidos");
  itemList(reservation.tour.excludes?.length ? reservation.tour.excludes : ["Gastos personales y servicios no indicados expresamente"]);

  if (options.optionalExtras?.length) {
    sectionTitle("Opcionales por cotizar - no incluidos en el precio");
    itemList(options.optionalExtras);
  }

  ensureSpace(24);
  doc.setFillColor(245, 248, 251);
  doc.roundedRect(14, y - 4, 182, 20, 2, 2, "F");
  doc.setTextColor(...muted);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.text(doc.splitTextToSize(isDemo
    ? "Documento generado para demostración. Las fechas, servicios, precios e itinerarios son referenciales y se reemplazarán con la información comercial definitiva antes de activar pagos reales."
    : "La reserva y el itinerario quedan sujetos a validación final de disponibilidad, proveedores y condiciones comunicadas por JhonToursPerú.", 174), 18, y + 3);

  const pageCount = doc.getNumberOfPages();
  for (let page = 1; page <= pageCount; page += 1) {
    doc.setPage(page);
    doc.setDrawColor(214, 226, 235);
    doc.line(14, 276, 196, 276);
    doc.setTextColor(...muted);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.text("Contacto: +51 966 779 705 - johntoursperu29@gmail.com", 14, 283);
    doc.text(`Página ${page} de ${pageCount}`, 196, 283, { align: "right" });
  }

  return doc;
}

export async function downloadReservationReceipt(reservation: Reservation, optionalExtras: string[] = []) {
  let logoDataUrl: string | undefined;
  try {
    logoDataUrl = await imageAsDataUrl("/john-tours-logo-cropped.png");
  } catch {
    logoDataUrl = undefined;
  }
  const doc = await createReservationReceipt(reservation, { optionalExtras, logoDataUrl });
  const prefix = reservation.isDemo ? "demo-constancia" : "constancia";
  doc.save(`${prefix}-reserva-${reservationCode(reservation.id)}.pdf`);
}
