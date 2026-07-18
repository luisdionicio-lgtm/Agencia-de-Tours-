import { app } from "./app";
import { env, validateProductionConfig } from "./config/env";

validateProductionConfig();

app.listen(env.PORT, () => {
  console.log(`John Tours API disponible en http://localhost:${env.PORT}/api`);
});
