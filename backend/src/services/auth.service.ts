import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { Role } from "@prisma/client";
import { env } from "../config/env";
import { prisma } from "../lib/prisma";
import { AppError } from "../utils/AppError";

export const authService = {
  async login(email: string, password: string) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || user.role !== Role.ADMIN) throw new AppError(401, "Credenciales invalidas");

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) throw new AppError(401, "Credenciales invalidas");

    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, env.JWT_SECRET, {
      expiresIn: env.JWT_EXPIRES_IN
    } as jwt.SignOptions);

    return { token, user: { id: user.id, name: user.name, email: user.email, role: user.role } };
  }
};

