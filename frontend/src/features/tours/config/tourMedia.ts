export type TourMediaItem = {
  image: string;
  title: string;
  stage: string;
  alt: string;
};

export type TourMediaCollection = {
  introduction: string;
  items: TourMediaItem[];
};

export const tourMediaBySlug: Record<string, TourMediaCollection> = {
  "machu-picchu": {
    introduction: "Una sola propuesta conecta Cusco y Machu Picchu con el lago Titicaca en Puno y la etapa final en Arequipa.",
    items: [
      { image: "/tour-galleries/machu-picchu/cusco-centro.webp", title: "Centro histórico de Cusco", stage: "Inicio de la experiencia", alt: "Viajeros de JohnToursPerú en la Plaza de Armas de Cusco" },
      { image: "/tour-galleries/machu-picchu/machu-picchu.webp", title: "Machu Picchu", stage: "Visita principal", alt: "Grupo de viajeros frente a Machu Picchu" },
      { image: "/tour-galleries/bolivia/lago-titicaca.webp", title: "Lago Titicaca, Puno", stage: "Ruta altiplánica", alt: "Viajeros de JohnToursPerú junto al Lago Titicaca en Puno" },
      { image: "/tour-galleries/machu-picchu/valle-sagrado.webp", title: "Valle Sagrado", stage: "Circuito cultural", alt: "Equipo de JohnToursPerú durante un recorrido por el Valle Sagrado" }
    ]
  },
  "lago-titicaca-ruta-bolivia": {
    introduction: "La propuesta combina paisajes del Titicaca y una conexión terrestre coordinada hacia Bolivia, sujeta a la documentación y condiciones vigentes.",
    items: [
      { image: "/tour-galleries/bolivia/lago-titicaca.webp", title: "Lago Titicaca", stage: "Paisaje y cultura", alt: "Viajeros de JohnToursPerú junto al Lago Titicaca" },
      { image: "/tour-galleries/bolivia/frontera-bolivia.webp", title: "Conexión con Bolivia", stage: "Tramo internacional", alt: "Grupo de viajeros en el ingreso terrestre a Bolivia" }
    ]
  },
  "guayaquil-costa-ecuador": {
    introduction: "Una mirada a los espacios urbanos considerados en la experiencia: Malecón, Las Peñas y el entorno de La Perla.",
    items: [
      { image: "/tour-galleries/guayaquil/malecon.webp", title: "Malecón de Guayaquil", stage: "Recorrido urbano", alt: "Grupo de viajeros en el Malecón de Guayaquil" },
      { image: "/tour-galleries/guayaquil/las-penas.webp", title: "Las Peñas", stage: "Barrio patrimonial", alt: "Viajeros en las escalinatas coloridas de Las Peñas" },
      { image: "/tour-galleries/guayaquil/la-perla.webp", title: "La Perla", stage: "Panorama nocturno", alt: "Rueda panorámica La Perla iluminada por la noche" }
    ]
  },
  "ica-y-huacachina": {
    introduction: "La experiencia se concentra en las dunas de Huacachina, el paseo en tubular y las actividades que se confirman con el asesor.",
    items: [
      { image: "/tour-galleries/ica/dunas.webp", title: "Dunas de Huacachina", stage: "Atardecer en el desierto", alt: "Grupo de viajeros en las dunas de Huacachina" },
      { image: "/tour-galleries/ica/tubulares.webp", title: "Aventura en tubular", stage: "Actividad principal", alt: "Equipo de JohnToursPerú junto a un vehículo tubular en Ica" }
    ]
  },
  "oxapampa-pozuzo": {
    introduction: "El paquete reúne identidad local, paisajes de selva alta y experiencias culturales que se ajustan a la fecha elegida.",
    items: [
      { image: "/tour-galleries/pozuzo/portico.webp", title: "Pórtico de Pozuzo", stage: "Bienvenida al destino", alt: "Visitantes en el pórtico tradicional de Pozuzo" },
      { image: "/tour-galleries/pozuzo/catarata.webp", title: "Naturaleza de Pozuzo", stage: "Recorrido de selva alta", alt: "Grupo de viajeros junto a una catarata en Pozuzo" },
      { image: "/tour-galleries/pozuzo/comunidad-local.webp", title: "Encuentro cultural", stage: "Experiencia local", alt: "Viajeros durante una actividad cultural de la ruta a Pozuzo" }
    ]
  }
};
