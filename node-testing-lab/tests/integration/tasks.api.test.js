const request = require("supertest");
const { Pool } = require("pg");
const { createApp } = require("../../src/app");

const TEST_DATABASE_URL =
  process.env.TEST_DATABASE_URL ||
  "postgres://labuser:labpass@localhost:5433/tasksdb_test";

let pool;
let app;

beforeAll(() => {
  pool = new Pool({ connectionString: TEST_DATABASE_URL });
  app = createApp(pool);
});

afterAll(async () => {
  await pool.end();
});

beforeEach(async () => {
  await pool.query("TRUNCATE TABLE tasks RESTART IDENTITY");
});

describe("POST /tasks (integracion con PostgreSQL real)", () => {

  test("crea una tarea y queda guardada en la base de datos", async () => {
    // 1. ACTUAR (Act)
    const res = await request(app)
      .post("/tasks")
      .send({ title: "Estudiar para el examen" });

    // 2. VERIFICAR LA RESPUESTA HTTP
    expect(res.status).toBe(201);
    expect(res.body.title).toBe("Estudiar para el examen");

    // 3. VERIFICAR CONTRA LA BASE DE DATOS REAL
    const { rows } = await pool.query(
      "SELECT * FROM tasks WHERE id = $1",
      [res.body.id]
    );
    expect(rows).toHaveLength(1);
    expect(rows[0].title).toBe("Estudiar para el examen");
  });

  test("responde 400 si falta el titulo y no inserta nada", async () => {
    // 1. ACTUAR (Act)
    const res = await request(app).post("/tasks").send({});

    // 2. VERIFICAR
    expect(res.status).toBe(400);

    // 3. VERIFICAR CONTRA LA BD REAL QUE NO SE INSERTO NINGUNA FILA
    const { rows } = await pool.query("SELECT * FROM tasks");
    expect(rows).toHaveLength(0);
  });
});

describe("GET /tasks/:id (integracion con PostgreSQL real)", () => {

  test("devuelve 404 si la tarea no existe", async () => {
    // 1. ACTUAR (Act)
    const res = await request(app).get("/tasks/9999");

    // 2. VERIFICAR (Assert)
    expect(res.status).toBe(404);
  });
});

describe("PUT /tasks/:id (integracion con PostgreSQL real)", () => {

  test("actualiza el estado en la base de datos", async () => {
    // 1. PREPARAR (Arrange)
    const creada = await request(app)
      .post("/tasks")
      .send({ title: "Lavar el auto" });

    // 2. ACTUAR (Act)
    const res = await request(app)
      .put(`/tasks/${creada.body.id}`)
      .send({ done: true });

    // 3. VERIFICAR (Assert)
    expect(res.status).toBe(200);
    expect(res.body.done).toBe(true);

    const { rows } = await pool.query(
      "SELECT done FROM tasks WHERE id = $1",
      [creada.body.id]
    );
    expect(rows[0].done).toBe(true);
  });
});

describe("DELETE /tasks/:id (integracion con PostgreSQL real)", () => {

  test("elimina la fila de la base de datos", async () => {
    // 1. PREPARAR (Arrange)
    const creada = await request(app)
      .post("/tasks")
      .send({ title: "Tarea temporal" });

    // 2. ACTUAR (Act)
    const res = await request(app).delete(`/tasks/${creada.body.id}`);

    // 3. VERIFICAR (Assert)
    expect(res.status).toBe(204);

    const { rows } = await pool.query(
      "SELECT * FROM tasks WHERE id = $1",
      [creada.body.id]
    );
    expect(rows).toHaveLength(0);
  });
});

describe("GET /tasks (integracion con PostgreSQL real)", () => {

  test("devuelve todas las tareas ordenadas por ID ascendente", async () => {
    await request(app).post("/tasks").send({ title: "Primera" });
    await request(app).post("/tasks").send({ title: "Segunda" });
    await request(app).post("/tasks").send({ title: "Tercera" });

    const res = await request(app).get("/tasks");

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(3);
    expect(res.body[0].title).toBe("Primera");
    expect(res.body[1].title).toBe("Segunda");
    expect(res.body[2].title).toBe("Tercera");
  });
});

describe("POST /tasks con prioridad (integracion con PostgreSQL real)", () => {

  test("guarda la prioridad en la base de datos", async () => {
    const res = await request(app)
      .post("/tasks")
      .send({ title: "Urgente", priority: "alta" });

    expect(res.body.priority).toBe("alta");

    const { rows } = await pool.query(
      "SELECT priority FROM tasks WHERE id = $1",
      [res.body.id]
    );
    expect(rows[0].priority).toBe("alta");
  });
});
