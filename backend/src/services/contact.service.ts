import { prisma } from "../lib/prisma";
import type { contactSchema } from "../validators/schemas";
import type { z } from "zod";

export const contactService = {
  create(data: z.infer<typeof contactSchema>) {
    return prisma.contactMessage.create({ data });
  },
  list() {
    return prisma.contactMessage.findMany({ orderBy: { createdAt: "desc" } });
  }
};

