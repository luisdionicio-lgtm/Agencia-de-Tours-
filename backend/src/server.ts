import { app } from "./app";
import { env } from "./config/env";

app.listen(env.PORT, () => {
  console.log(`Jhon Tours API disponible en http://localhost:${env.PORT}/api`);
});

