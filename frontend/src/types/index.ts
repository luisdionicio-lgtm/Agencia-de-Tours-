export type TourType = "NACIONAL" | "INTERNACIONAL";
export type TourStatus = "ACTIVO" | "INACTIVO";

export type Tour = {
  id: number;
  title: string;
  slug: string;
  destination: string;
  description?: string;
  price: string | number;
  currency?: "PEN" | "USD";
  paymentMode?: "FULL" | "DEPOSIT";
  depositPercent?: number;
  duration?: string;
  type: TourType;
  availableSlots: number;
  imageUrl?: string;
  imageCredit?: string;
  isFeatured: boolean;
  status: TourStatus;
  itinerary?: string[];
  includes?: string[];
  excludes?: string[];
  departures?: { id: number; startDate: string; endDate?: string; capacity: number; availableSlots: number; status: TourStatus }[];
};

export type BusinessSettings = {
  legalName?: string; tradeName: string; taxId?: string; address?: string; supportEmail?: string;
  whatsappNumber?: string; domain?: string; cancellationPolicy?: string; refundPolicy?: string;
  terms?: string; privacyPolicy?: string; cookiePolicy?: string; complaintsBookUrl?: string;
  policiesPublished: boolean;
};

export type Reservation = {
  id: number;
  travelDate: string;
  peopleCount: number;
  totalAmount: string | number;
  status: "PENDIENTE" | "PAGADA" | "RECHAZADA" | "CANCELADA";
  customer: { fullName: string; email: string; phone?: string };
  tour: Tour;
};

export type Payment = {
  id: number;
  status: "PENDIENTE" | "EXITOSO" | "RECHAZADO" | "DEVUELTO";
  paymentMethod: "CARD" | "YAPE";
  amount: string | number;
  culqiChargeId?: string;
  reservation?: Reservation;
};
