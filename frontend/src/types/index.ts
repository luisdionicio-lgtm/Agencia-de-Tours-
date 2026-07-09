export type TourType = "NACIONAL" | "INTERNACIONAL";
export type TourStatus = "ACTIVO" | "INACTIVO";

export type Tour = {
  id: number;
  title: string;
  slug: string;
  destination: string;
  description?: string;
  price: string | number;
  duration?: string;
  type: TourType;
  availableSlots: number;
  imageUrl?: string;
  isFeatured: boolean;
  status: TourStatus;
  itinerary?: string[];
  includes?: string[];
  excludes?: string[];
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
};

