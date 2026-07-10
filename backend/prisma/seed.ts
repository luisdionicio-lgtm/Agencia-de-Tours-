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
    where: { email: process.env.ADMIN_EMAIL ?? "admin@jhontours.com" },
    update: { password, role: Role.ADMIN },
    create: {
      name: "Administrador Jhon Tours",
      email: process.env.ADMIN_EMAIL ?? "admin@jhontours.com",
      password,
      role: Role.ADMIN
    }
  });

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
      includes: ["Hoteles seleccionados", "Traslados programados", "Guia especializado en espanol", "Asistencia Jhon Tours por WhatsApp"],
      excludes: ["Vuelos internacionales", "Gastos personales", "Propinas y servicios no mencionados"]
    }
  ];

  for (const tour of tours) {
    await prisma.tour.upsert({
      where: { slug: tour.slug },
      update: {
        ...tour,
        itinerary: tour.itinerary ?? ["Llegada y bienvenida", "Tour principal guiado", "Experiencias locales", "Retorno"],
        includes: tour.includes ?? ["Alojamiento", "Traslados", "Guia especializado", "Asistencia Jhon Tours"],
        excludes: tour.excludes ?? ["Gastos personales", "Propinas", "Servicios no mencionados"]
      },
      create: {
        ...tour,
        itinerary: tour.itinerary ?? ["Llegada y bienvenida", "Tour principal guiado", "Experiencias locales", "Retorno"],
        includes: tour.includes ?? ["Alojamiento", "Traslados", "Guia especializado", "Asistencia Jhon Tours"],
        excludes: tour.excludes ?? ["Gastos personales", "Propinas", "Servicios no mencionados"]
      }
    });
  }

  await prisma.testimonial.deleteMany({ where: { source: "seed-demo" } });
  await prisma.testimonial.createMany({
    data: [
      { name: "Testimonio de demostracion", location: "Lima", comment: "Contenido de muestra: reemplazar por una opinion verificable antes de publicar.", rating: 5, source: "seed-demo", verified: false, published: false }
    ],
  });

  await prisma.businessSettings.upsert({
    where: { id: 1 }, update: {}, create: { id: 1, tradeName: "Jhon Tours", policiesPublished: false }
  });
}

main()
  .then(async () => prisma.$disconnect())
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
