import { app } from "./app";
import { env, validateProductionConfig } from "./config/env";

validateProductionConfig();

app.listen(env.PORT, () => {
  console.log(`JhonToursPerú API disponible en http://localhost:${env.PORT}/api`);
});
