import { app } from "./app";
import { env, validateProductionConfig } from "./config/env";
import { prisma } from "./lib/prisma";

validateProductionConfig();

const server = app.listen(env.PORT, () => {
  console.log(`JohnToursPerú API disponible en http://localhost:${env.PORT}/api`);
});

let shuttingDown = false;
async function shutdown(signal: string) {
  if (shuttingDown) return;
  shuttingDown = true;
  console.log(`[shutdown] ${signal}: cerrando conexiones`);

  const forceExit = setTimeout(() => process.exit(1), 10_000);
  forceExit.unref();
  server.close(async (error) => {
    await prisma.$disconnect();
    clearTimeout(forceExit);
    process.exit(error ? 1 : 0);
  });
}

process.once("SIGTERM", () => void shutdown("SIGTERM"));
process.once("SIGINT", () => void shutdown("SIGINT"));
