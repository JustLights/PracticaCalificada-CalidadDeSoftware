const { createTask } = require("../../src/services/tasks.service");

describe("createTask (prueba unitaria)", () => {
  test("crea la tarea cuando el titulo es valido", async () => {
    // jest.fn() crea una funcion espia que registra sus llamadas.
    // mockResolvedValue programa la respuesta simulada de la BD.
    const fakePool = {
      query: jest.fn().mockResolvedValue({
        rows: [{ id: 1, title: "Estudiar", done: false }],
      }),
    };

    // 1. PREPARAR (Arrange): construimos un pool falso.
    // 2. ACTUAR (Act): invocamos la unidad bajo prueba.
    const result = await createTask(
      fakePool,
      { title: "Estudiar" }
    );

    // 3. VERIFICAR (Assert): comprobamos el resultado
    // y la interaccion con la dependencia.
    expect(result.id).toBe(1);
    expect(result.title).toBe("Estudiar");
    expect(fakePool.query).toHaveBeenCalledTimes(1);
  });
});


test("rechaza la tarea si el titulo esta vacio", async () => {

  // Pool falso sin respuesta programada: si el servicio lo llamara,
  // seria un defecto de diseno (no debe tocar la BD con datos invalidos).

  const fakePool = { query: jest.fn() };

  // Esperamos que la promesa sea RECHAZADA (que lance un error).
  await expect(
    createTask(fakePool, { title: "" })
  ).rejects.toThrow("El titulo es obligatorio");

  // Verificamos que NUNCA se intento consultar la base de datos:
  // la validacion detuvo la operacion antes.
  expect(fakePool.query).not.toHaveBeenCalled();
});

test("elimina los espacios sobrantes del titulo", async () => {
  const fakePool = {
    query: jest.fn().mockResolvedValue({
      rows: [{ id: 1, title: "Estudiar" }],
    }),
  };

  await createTask(fakePool, { title: "   Estudiar   " });

  // expect.stringContaining permite validar el SQL sin
  // acoplarse a su texto exacto.
  expect(fakePool.query).toHaveBeenCalledWith(
    expect.stringContaining("INSERT"),
    ["Estudiar"]
    // toHaveBeenCalledWith inspecciona los argumentos reales.
  );
});

const { getTaskById } = require("../../src/services/tasks.service");

test("getTaskById devuelve null cuando no hay resultados", async () => {
  // Simulamos que la BD no devolvio ninguna fila.
  const fakePool = {
    query: jest.fn().mockResolvedValue({ rows: [] }),
  };

  const result = await getTaskById(fakePool, 999);
  expect(result).toBeNull();
});


test("rechaza titulo que no es string (numero)", async () => {
    const fakePool = { query: jest.fn() };
    await expect(createTask(fakePool, { title: 42 }))
        .rejects.toThrow("El titulo es obligatorio");
    expect(fakePool.query).not.toHaveBeenCalled();
});


test("rechaza titulo que no es string (numero)", async () => {
    const fakePool = {
        query: jest.fn().mockRejectedValue(
    new Error("connection refused")
  ),
};
});