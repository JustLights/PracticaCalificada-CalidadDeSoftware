const express = require("express");
const tasksRouter = require("./routes/tasks.routes");

/**
 * Fabrica de la aplicacion Express.
 * Recibe el `pool` de Postgres como parametro (inyeccion de dependencias)
 * para que las pruebas de integracion puedan crear su propia instancia
 * de la app apuntando a una base de datos de pruebas.
 */
function createApp(pool) {
  const app = express();
  app.use(express.json());
  app.locals.pool = pool;

  app.get("/health", (req, res) => res.json({ status: "ok" }));
  app.use("/tasks", tasksRouter);

  // Manejador de errores centralizado
  // eslint-disable-next-line no-unused-vars
  app.use((err, req, res, next) => {
    const status = err.status || 500;
    res.status(status).json({ error: err.message || "Error interno" });
  });

  return app;
}

module.exports = { createApp };
