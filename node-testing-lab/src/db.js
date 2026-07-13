const { Pool } = require("pg");

/**
 * Crea un pool de conexiones a Postgres.
 * Se recibe la connectionString como parametro para poder
 * inyectar distintas bases de datos (dev, test, e2e) sin
 * cambiar el codigo de la aplicacion.
 */
function createPool(connectionString = process.env.DATABASE_URL) {
  if (!connectionString) {
    throw new Error("DATABASE_URL no esta definida");
  }
  return new Pool({ connectionString });
}

module.exports = { createPool };
