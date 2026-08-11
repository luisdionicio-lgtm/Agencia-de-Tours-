import bcrypt from "bcryptjs";
import { Currency, PrismaClient, Role, TourStatus, TourType } from "@prisma/client";

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
      price: 0,
      currency: Currency.PEN,
      duration: "4 dias / 3 noches",
      type: TourType.NACIONAL,
      categoryId: 3,
      imageUrl: "/destinations/machu-picchu.webp",
      description: "Explora la ciudadela inca, el Valle Sagrado y la magia cultural de Cusco con guias expertos.",
      availableSlots: 0,
      isFeatured: true
    },
    {
      title: "Guayaquil y costa ecuatoriana",
      slug: "guayaquil-costa-ecuador",
      destination: "Guayaquil, Ecuador",
      price: 0,
      currency: Currency.USD,
      duration: "5 dias / 4 noches",
      type: TourType.INTERNACIONAL,
      categoryId: 4,
      imageUrl: "/destinations/ecuador-costa.webp",
      description: "Descubre Guayaquil y la costa ecuatoriana con recorridos urbanos, paisajes frente al mar y actividades coordinadas.",
      availableSlots: 0,
      isFeatured: true
    },
    {
      title: "Oxapampa y Pozuzo",
      slug: "oxapampa-pozuzo",
      destination: "Pasco, Peru",
      price: 0,
      currency: Currency.PEN,
      duration: "4 dias / 3 noches",
      type: TourType.NACIONAL,
      categoryId: 1,
      imageUrl: "/destinations/oxapampa-pozuzo.webp",
      description: "Naturaleza, cataratas, cafe y tradicion austroalemana en una ruta por Oxapampa y Pozuzo.",
      availableSlots: 0,
      isFeatured: true
    },
    {
      title: "Ica y Huacachina",
      slug: "ica-y-huacachina",
      destination: "Ica, Peru",
      price: 0,
      currency: Currency.PEN,
      duration: "2 dias / 1 noche",
      type: TourType.NACIONAL,
      categoryId: 1,
      imageUrl: "/destinations/ica-huacachina.webp",
      description: "Dunas, tubulares, sandboard, bodegas pisqueras y atardeceres inolvidables en el oasis.",
      availableSlots: 0,
      isFeatured: true
    },
    {
      title: "Tarapoto y naturaleza amazonica",
      slug: "tarapoto-naturaleza",
      destination: "San Martin, Peru",
      price: 0,
      currency: Currency.PEN,
      duration: "4 dias / 3 noches",
      type: TourType.NACIONAL,
      categoryId: 1,
      imageUrl: "/destinations/tarapoto.webp",
      description: "Paisajes amazonicos, recorridos acuaticos y experiencias de naturaleza en una ruta coordinada desde Tarapoto.",
      availableSlots: 0,
      isFeatured: true,
      itinerary: ["Llegada asistida a Tarapoto", "Recorrido natural coordinado", "Experiencia acuatica segun disponibilidad", "Retorno con seguimiento del asesor"],
      includes: ["Alojamiento seleccionado", "Traslados programados", "Coordinacion de actividades", "Asistencia JohnToursPerú"],
      excludes: ["Vuelos hasta Tarapoto", "Gastos personales", "Servicios no mencionados"]
    },
    {
      title: "Europa esencial: Madrid, Paris y Roma",
      slug: "europa-esencial-madrid-paris-roma",
      destination: "Espana, Francia e Italia",
      price: 0,
      currency: Currency.USD,
      duration: "11 dias / 10 noches",
      type: TourType.INTERNACIONAL,
      categoryId: 3,
      imageUrl: "/destinations/europa-esencial.webp",
      description: "Ruta demostrativa por Madrid, Paris y Roma con patrimonio, arte y recorridos urbanos coordinados.",
      availableSlots: 0,
      isFeatured: false,
      itinerary: ["Llegada y orientacion en Madrid", "Experiencias culturales en Madrid", "Conexion y recorridos en Paris", "Traslado a Roma", "Roma historica y Vaticano segun disponibilidad", "Retorno coordinado"],
      includes: ["Alojamiento seleccionado", "Conexiones internas indicadas", "Recorridos confirmados", "Asistencia JohnToursPerú"],
      excludes: ["Vuelos internacionales salvo indicacion expresa", "Entradas no detalladas", "Visados, seguros y gastos personales"]
    },
    {
      title: "Italia clasica: Roma, Florencia y Venecia",
      slug: "italia-clasica-roma-florencia-venecia",
      destination: "Italia",
      price: 0,
      currency: Currency.USD,
      duration: "9 dias / 8 noches",
      type: TourType.INTERNACIONAL,
      categoryId: 3,
      imageUrl: "/destinations/italia-clasica.webp",
      description: "Propuesta cultural por Roma, Florencia y Venecia con conexiones y recorridos planificados.",
      availableSlots: 0,
      isFeatured: false,
      itinerary: ["Llegada y orientacion en Roma", "Roma historica y Vaticano segun disponibilidad", "Conexion a Florencia", "Recorrido cultural en Florencia", "Conexion a Venecia", "Canales y barrios historicos", "Retorno coordinado"],
      includes: ["Alojamiento seleccionado", "Conexiones internas indicadas", "Recorridos confirmados", "Asistencia JohnToursPerú"],
      excludes: ["Vuelos internacionales", "Entradas no detalladas", "Tasas, seguros y gastos personales"]
    },
    {
      title: "Espana y Portugal: Madrid, Barcelona y Lisboa",
      slug: "espana-portugal-madrid-barcelona-lisboa",
      destination: "Espana y Portugal",
      price: 0,
      currency: Currency.USD,
      duration: "10 dias / 9 noches",
      type: TourType.INTERNACIONAL,
      categoryId: 3,
      imageUrl: "/destinations/espana-portugal.webp",
      description: "Circuito demostrativo por ciudades ibericas con arquitectura, cultura y recorridos urbanos coordinados.",
      availableSlots: 0,
      isFeatured: false,
      itinerary: ["Llegada y recorridos en Madrid", "Conexion a Barcelona", "Experiencias urbanas en Barcelona", "Conexion a Lisboa", "Barrios historicos y miradores", "Retorno coordinado"],
      includes: ["Alojamiento seleccionado", "Conexiones internas indicadas", "Recorridos confirmados", "Asistencia JohnToursPerú"],
      excludes: ["Vuelos internacionales", "Entradas no detalladas", "Visados, seguros y gastos personales"]
    }
  ];

  await prisma.tour.updateMany({
    where: { slug: { in: ["disney-orlando", "egipto", "oxapampa"] } },
    data: { status: TourStatus.INACTIVO, isFeatured: false }
  });

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
    "guayaquil-costa-ecuador": [{ days: 28, capacity: 20 }, { days: 61, capacity: 20 }],
    "oxapampa-pozuzo": [{ days: 30, capacity: 20 }, { days: 65, capacity: 20 }],
    "ica-y-huacachina": [{ days: 6, capacity: 20 }, { days: 20, capacity: 22 }, { days: 43, capacity: 24 }],
    "tarapoto-naturaleza": [{ days: 35, capacity: 20 }, { days: 77, capacity: 20 }],
    "europa-esencial-madrid-paris-roma": [{ days: 245, capacity: 20 }, { days: 301, capacity: 20 }],
    "italia-clasica-roma-florencia-venecia": [{ days: 266, capacity: 20 }, { days: 399, capacity: 20 }],
    "espana-portugal-madrid-barcelona-lisboa": [{ days: 252, capacity: 20 }, { days: 420, capacity: 20 }]
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
