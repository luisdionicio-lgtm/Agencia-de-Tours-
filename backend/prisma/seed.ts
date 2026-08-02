import bcrypt from "bcryptjs";
import { Currency, PrismaClient, Role, TourType } from "@prisma/client";

const prisma = new PrismaClient();

const image = (id: string) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=1400&q=80`;

async function main() {
  const categories = ["Aventura", "Playa", "Cultural", "Familiar", "Romantico", "Lujo"];

  for (const name of categories) {
    await prisma.category.upsert({
      where: { id: categories.indexOf(name) + 1 },
      update: { name },
      create: { name }
    });
  }

  const saltRounds = Number(process.env.BCRYPT_SALT_ROUNDS ?? 10);
  const password = await bcrypt.hash(process.env.ADMIN_PASSWORD ?? "Admin12345", saltRounds);
  await prisma.user.upsert({
    where: { email: process.env.ADMIN_EMAIL ?? "admin@johntours.com" },
    update: { password, role: Role.ADMIN },
    create: {
      name: "Administrador JohnToursPerú",
      email: process.env.ADMIN_EMAIL ?? "admin@johntours.com",
      password,
      role: Role.ADMIN
    }
  });

  if (process.env.ENABLE_DEMO_STAFF === "true") {
    const workerEmail = process.env.WORKER_EMAIL;
    const workerPassword = process.env.WORKER_PASSWORD;
    if (!workerEmail || !workerPassword || workerPassword.length < 12) {
      throw new Error("Para habilitar personal demo define WORKER_EMAIL y WORKER_PASSWORD con al menos 12 caracteres.");
    }
    const workerHash = await bcrypt.hash(workerPassword, saltRounds);
    await prisma.user.upsert({
      where: { email: workerEmail },
      update: { password: workerHash, role: Role.WORKER },
      create: {
        name: "Asesor JohnToursPerú",
        email: workerEmail,
        password: workerHash,
        role: Role.WORKER
      }
    });
  }

  const tours = [
    {
      title: "Machu Picchu",
      slug: "machu-picchu",
      destination: "Cusco, Peru",
      price: 1550,
      currency: Currency.PEN,
      duration: "4 dias / 3 noches",
      type: TourType.NACIONAL,
      categoryId: 3,
      imageUrl: image("photo-1587595431973-160d0d94add1"),
      description: "Explora la ciudadela inca, el Valle Sagrado y la magia cultural de Cusco con guias expertos.",
      availableSlots: 18,
      isFeatured: true
    },
    {
      title: "Disney Orlando",
      slug: "disney-orlando",
      destination: "Orlando, Estados Unidos",
      price: 1890,
      currency: Currency.USD,
      duration: "7 dias / 6 noches",
      type: TourType.INTERNACIONAL,
      categoryId: 4,
      imageUrl: image("photo-1597466599360-3b9775841aec"),
      description: "Vive parques tematicos, compras y experiencias familiares con asistencia durante todo el viaje.",
      availableSlots: 12,
      isFeatured: true
    },
    {
      title: "Oxapampa",
      slug: "oxapampa",
      destination: "Pasco, Peru",
      price: 950,
      currency: Currency.PEN,
      duration: "3 dias / 2 noches",
      type: TourType.NACIONAL,
      categoryId: 1,
      imageUrl: "https://inforegion.pe/wp-content/uploads/2025/01/baf433a5-dji_20241114093018_0090_d-2.jpg",
      description: "Naturaleza, cataratas, cafe y tradiciones austroalemanas en una escapada llena de aire puro.",
      availableSlots: 20,
      isFeatured: false
    },
    {
      title: "Ica y Huacachina",
      slug: "ica-y-huacachina",
      destination: "Ica, Peru",
      price: 650,
      currency: Currency.PEN,
      duration: "2 dias / 1 noche",
      type: TourType.NACIONAL,
      categoryId: 1,
      imageUrl: "https://www.stampbystamptravel.com/wp-content/uploads/2025/02/laguna-huacachina-ica.jpg.webp",
      description: "Dunas, tubulares, sandboard, bodegas pisqueras y atardeceres inolvidables en el oasis.",
      availableSlots: 25,
      isFeatured: true
    },
    {
      title: "Egipto",
      slug: "egipto",
      destination: "El Cairo, Egipto",
      price: 2700,
      currency: Currency.USD,
      duration: "8 dias / 7 noches",
      type: TourType.INTERNACIONAL,
      categoryId: 6,
      imageUrl: "https://www.barcelo.com/guia-turismo/wp-content/uploads/2022/05/el-cairo1.jpg",
      description: "Piramides de Giza, El Cairo historico y crucero por el Nilo con itinerario claro, hoteles seleccionados y acompanamiento en cada etapa.",
      availableSlots: 10,
      isFeatured: true,
      itinerary: ["Llegada asistida a El Cairo", "Piramides de Giza y Esfinge con guia", "Museo Egipcio y barrio historico", "Crucero por el Nilo y templos principales", "Retorno con seguimiento del asesor"],
      includes: ["Hoteles seleccionados", "Traslados programados", "Guía especializada en español", "Asistencia JohnToursPerú por WhatsApp"],
      excludes: ["Vuelos internacionales", "Gastos personales", "Propinas y servicios no mencionados"]
    }
  ];

  for (const tour of tours) {
    await prisma.tour.upsert({
      where: { slug: tour.slug },
      update: {
        ...tour,
        itinerary: tour.itinerary ?? ["Llegada y bienvenida", "Tour principal guiado", "Experiencias locales", "Retorno"],
        includes: tour.includes ?? ["Alojamiento", "Traslados", "Guía especializada", "Asistencia JohnToursPerú"],
        excludes: tour.excludes ?? ["Gastos personales", "Propinas", "Servicios no mencionados"]
      },
      create: {
        ...tour,
        itinerary: tour.itinerary ?? ["Llegada y bienvenida", "Tour principal guiado", "Experiencias locales", "Retorno"],
        includes: tour.includes ?? ["Alojamiento", "Traslados", "Guía especializada", "Asistencia JohnToursPerú"],
        excludes: tour.excludes ?? ["Gastos personales", "Propinas", "Servicios no mencionados"]
      }
    });
  }

  const departureOffsets: Record<string, { days: number; capacity: number }[]> = {
    "machu-picchu": [{ days: 12, capacity: 16 }, { days: 35, capacity: 18 }, { days: 68, capacity: 20 }],
    "disney-orlando": [{ days: 28, capacity: 14 }, { days: 61, capacity: 16 }, { days: 96, capacity: 18 }],
    oxapampa: [{ days: 9, capacity: 15 }, { days: 30, capacity: 18 }, { days: 58, capacity: 20 }],
    "ica-y-huacachina": [{ days: 6, capacity: 20 }, { days: 20, capacity: 22 }, { days: 43, capacity: 24 }],
    egipto: [{ days: 42, capacity: 12 }, { days: 77, capacity: 14 }, { days: 112, capacity: 16 }]
  };
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  for (const [slug, departures] of Object.entries(departureOffsets)) {
    const tour = await prisma.tour.findUniqueOrThrow({ where: { slug } });
    for (const departure of departures) {
      const startDate = new Date(today);
      startDate.setUTCDate(startDate.getUTCDate() + departure.days);
      const endDate = new Date(startDate);
      const durationDays = Number(tour.duration?.match(/\d+/)?.[0] ?? 1);
      endDate.setUTCDate(endDate.getUTCDate() + Math.max(0, durationDays - 1));
      await prisma.tourDeparture.upsert({
        where: { tourId_startDate: { tourId: tour.id, startDate } },
        update: { endDate, capacity: departure.capacity, status: "ACTIVO" },
        create: { tourId: tour.id, startDate, endDate, capacity: departure.capacity, availableSlots: departure.capacity }
      });
    }
  }

  await prisma.testimonial.deleteMany({ where: { source: "seed-demo" } });
  await prisma.testimonial.createMany({
    data: [
      { name: "Testimonio de demostracion", location: "Lima", comment: "Contenido de muestra: reemplazar por una opinion verificable antes de publicar.", rating: 5, source: "seed-demo", verified: false, published: false }
    ],
  });

  await prisma.businessSettings.upsert({
    where: { id: 1 }, update: { tradeName: "JohnToursPerú" }, create: { id: 1, tradeName: "JohnToursPerú", policiesPublished: false }
  });
}

main()
  .then(async () => prisma.$disconnect())
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
