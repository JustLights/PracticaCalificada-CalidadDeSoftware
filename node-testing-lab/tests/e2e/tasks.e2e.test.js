const BASE_URL = process.env.BASE_URL || "http://localhost:3000";

test("el servicio responde en /health", async () => {
  const res = await fetch(`${BASE_URL}/health`);
  const body = await res.json();

  expect(res.status).toBe(200);
  expect(body.status).toBe("ok");
});

describe("Flujo completo de una tarea (E2E)", () => {
  test("crear -> consultar -> completar -> eliminar", async () => {
    const resCrear = await fetch(`${BASE_URL}/tasks`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: "Preparar la practica" }),
    });
    expect(resCrear.status).toBe(201);
    const tarea = await resCrear.json();
    const id = tarea.id;

    const resConsultar = await fetch(`${BASE_URL}/tasks/${id}`);
    expect(resConsultar.status).toBe(200);
    const consultada = await resConsultar.json();
    expect(consultada.done).toBe(false);

    const resCompletar = await fetch(`${BASE_URL}/tasks/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ done: true }),
    });
    expect(resCompletar.status).toBe(200);
    const completada = await resCompletar.json();
    expect(completada.done).toBe(true);

    const resEliminar = await fetch(`${BASE_URL}/tasks/${id}`, {
      method: "DELETE",
    });
    expect(resEliminar.status).toBe(204);

    const resFinal = await fetch(`${BASE_URL}/tasks/${id}`);
    expect(resFinal.status).toBe(404);
  });
});

test("rechaza datos invalidos de extremo a extremo", async () => {
  const res = await fetch(`${BASE_URL}/tasks`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({}),
  });
  expect(res.status).toBe(400);
});

test("idempotencia del borrado", async () => {
  const resCrear = await fetch(`${BASE_URL}/tasks`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title: "Tarea a borrar" }),
  });
  const tarea = await resCrear.json();

  const resPrimera = await fetch(`${BASE_URL}/tasks/${tarea.id}`, {
    method: "DELETE",
  });
  expect(resPrimera.status).toBe(204);

  const resSegunda = await fetch(`${BASE_URL}/tasks/${tarea.id}`, {
    method: "DELETE",
  });
  expect(resSegunda.status).toBe(404);
});

test("sondeo del listado devuelve un arreglo con Content-Type json", async () => {
  const res = await fetch(`${BASE_URL}/tasks`);
  const body = await res.json();

  expect(res.status).toBe(200);
  expect(Array.isArray(body)).toBe(true);
  expect(res.headers.get("Content-Type")).toContain("application/json");
});
