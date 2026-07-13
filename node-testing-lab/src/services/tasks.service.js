/**
 * Capa de servicio (logica de negocio + acceso a datos con SQL directo).
 * Cada funcion recibe el `pool` como parametro en lugar de importarlo
 * directamente. Esto permite:
 *   - En pruebas UNITARIAS: pasar un pool falso (mock) y probar la
 *     logica sin tocar una base de datos real.
 *   - En pruebas de INTEGRACION y E2E: pasar un pool real conectado
 *     a Postgres.
 */

async function listTasks(pool) {
  const { rows } = await pool.query(
    "SELECT id, title, done, created_at FROM tasks ORDER BY id"
  );
  return rows;
}

async function getTaskById(pool, id) {
  const { rows } = await pool.query(
    "SELECT id, title, done, created_at FROM tasks WHERE id = $1",
    [id]
  );
  return rows[0] || null;
}

async function createTask(pool, { title } = {}) {
  if (!title || typeof title !== "string" || !title.trim()) {
    const err = new Error("El titulo es obligatorio");
    err.status = 400;
    throw err;
  }

  const { rows } = await pool.query(
    "INSERT INTO tasks (title, done) VALUES ($1, false) RETURNING id, title, done, created_at",
    [title.trim()]
  );
  return rows[0];
}

async function updateTask(pool, id, { title, done } = {}) {
  const existing = await getTaskById(pool, id);
  if (!existing) return null;

  const newTitle = title !== undefined ? title : existing.title;
  const newDone = done !== undefined ? done : existing.done;

  const { rows } = await pool.query(
    "UPDATE tasks SET title = $1, done = $2 WHERE id = $3 RETURNING id, title, done, created_at",
    [newTitle, newDone, id]
  );
  return rows[0];
}

async function deleteTask(pool, id) {
  const { rowCount } = await pool.query("DELETE FROM tasks WHERE id = $1", [
    id,
  ]);
  return rowCount > 0;
}

module.exports = {
  listTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
};
