import { demoTours } from "../features/tours/config/sampleCatalog";

export const tourTitles: Record<string, string> = Object.fromEntries(demoTours.map((tour) => [String(tour.id), tour.title]));
export const sampleTourIds = demoTours.map((tour) => String(tour.id));
