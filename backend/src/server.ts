import { app } from "./app";
import { env, validateProductionConfig } from "./config/env";

validateProductionConfig();

app.listen(env.PORT, () => {
  console.log(`JohnToursPerú API disponible en http://localhost:${env.PORT}/api`);
});
