const tasksService = require("../services/tasks.service");

function getPool(req) {
  return req.app.locals.pool;
}

async function list(req, res, next) {
  try {
    const tasks = await tasksService.listTasks(getPool(req));
    res.json(tasks);
  } catch (err) {
    next(err);
  }
}

async function getOne(req, res, next) {
  try {
    const task = await tasksService.getTaskById(getPool(req), req.params.id);
    if (!task) return res.status(404).json({ error: "Tarea no encontrada" });
    res.json(task);
  } catch (err) {
    next(err);
  }
}

async function create(req, res, next) {
  try {
    const task = await tasksService.createTask(getPool(req), req.body);
    res.status(201).json(task);
  } catch (err) {
    next(err);
  }
}

async function update(req, res, next) {
  try {
    const task = await tasksService.updateTask(
      getPool(req),
      req.params.id,
      req.body
    );
    if (!task) return res.status(404).json({ error: "Tarea no encontrada" });
    res.json(task);
  } catch (err) {
    next(err);
  }
}

async function remove(req, res, next) {
  try {
    const deleted = await tasksService.deleteTask(getPool(req), req.params.id);
    if (!deleted) return res.status(404).json({ error: "Tarea no encontrada" });
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

module.exports = { list, getOne, create, update, remove };
