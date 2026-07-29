import express from 'express';
import swaggerUi from 'swagger-ui-express';
import openapiDocument from '../openapi.json' with { type: 'json' };
import { fileURLToPath } from 'node:url';

const app = express();
const port = Number(process.env.PORT || 3000);
const host = process.env.HOST || '127.0.0.1';
let server;

let nextTaskId = 4;
const tasks = [
  { id: 1, title: 'Learn Express.js', done: true },
  { id: 2, title: 'Build a To Do API', done: false },
  { id: 3, title: 'Document endpoints with Swagger', done: false }
];

app.use(express.json());
app.use('/docs', swaggerUi.serve, swaggerUi.setup(openapiDocument));

const sendSuccess = (res, statusCode, message, data) => {
  const body = { success: true, message };

  if (data !== undefined) {
    body.data = data;
  }

  return res.status(statusCode).json(body);
};

const sendError = (res, statusCode, message, details) => {
  const body = { success: false, message };

  if (details !== undefined) {
    body.details = details;
  }

  return res.status(statusCode).json(body);
};

const parseTaskId = (rawId) => {
  const id = Number(rawId);
  return Number.isInteger(id) && id > 0 ? id : null;
};

const findTaskById = (id) => tasks.find((task) => task.id === id);

const validateTitle = (title) => {
  if (typeof title !== 'string' || title.trim().length === 0) {
    return 'Title is required and must be a non-empty string.';
  }

  return null;
};

const validateDone = (done) => {
  if (typeof done !== 'boolean') {
    return 'Done is required and must be a boolean.';
  }

  return null;
};

app.get('/', (req, res) => {
  return sendSuccess(res, 200, 'Welcome to the To Do List API.', {
    name: 'To Do List API',
    version: '1.0.0',
    docs: '/docs',
    endpoints: {
      health: '/health',
      tasks: '/tasks',
      stats: '/tasks/stats'
    }
  });
});

app.get('/health', (req, res) => {
  return sendSuccess(res, 200, 'API is running.', {
    status: 'ok'
  });
});

app.get('/tasks/stats', (req, res) => {
  const done = tasks.filter((task) => task.done).length;
  const total = tasks.length;

  return sendSuccess(res, 200, 'Task statistics retrieved successfully.', {
    total,
    done,
    notDone: total - done
  });
});

app.get('/tasks', (req, res) => {
  const { done, search } = req.query;
  let result = [...tasks];

  if (done !== undefined) {
    if (done !== 'true' && done !== 'false') {
      return sendError(res, 400, 'Invalid done filter. Use true or false.');
    }

    result = result.filter((task) => task.done === (done === 'true'));
  }

  if (search !== undefined) {
    if (typeof search !== 'string' || search.trim().length === 0) {
      return sendError(res, 400, 'Search query must be a non-empty string.');
    }

    const normalizedSearch = search.trim().toLowerCase();
    result = result.filter((task) => task.title.toLowerCase().includes(normalizedSearch));
  }

  return sendSuccess(res, 200, 'Tasks retrieved successfully.', {
    count: result.length,
    tasks: result
  });
});

app.get('/tasks/:id', (req, res) => {
  const id = parseTaskId(req.params.id);

  if (id === null) {
    return sendError(res, 400, 'Task ID must be a positive integer.');
  }

  const task = findTaskById(id);

  if (!task) {
    return sendError(res, 404, `Task with ID ${id} was not found.`);
  }

  return sendSuccess(res, 200, 'Task retrieved successfully.', task);
});

app.post('/tasks', (req, res) => {
  const titleError = validateTitle(req.body?.title);

  if (titleError) {
    return sendError(res, 400, titleError);
  }

  if (req.body.done !== undefined) {
    const doneError = validateDone(req.body.done);

    if (doneError) {
      return sendError(res, 400, 'Done must be a boolean when provided.');
    }
  }

  const task = {
    id: nextTaskId,
    title: req.body.title.trim(),
    done: req.body.done ?? false
  };

  nextTaskId += 1;
  tasks.push(task);

  return sendSuccess(res, 201, 'Task created successfully.', task);
});

app.put('/tasks/:id', (req, res) => {
  const id = parseTaskId(req.params.id);

  if (id === null) {
    return sendError(res, 400, 'Task ID must be a positive integer.');
  }

  const titleError = validateTitle(req.body?.title);
  const doneError = validateDone(req.body?.done);

  if (titleError || doneError) {
    return sendError(res, 400, 'Title and done are required for a full task update.', {
      title: titleError,
      done: doneError
    });
  }

  const task = findTaskById(id);

  if (!task) {
    return sendError(res, 404, `Task with ID ${id} was not found.`);
  }

  task.title = req.body.title.trim();
  task.done = req.body.done;

  return sendSuccess(res, 200, 'Task updated successfully.', task);
});

app.patch('/tasks/:id', (req, res) => {
  const id = parseTaskId(req.params.id);

  if (id === null) {
    return sendError(res, 400, 'Task ID must be a positive integer.');
  }

  if (req.body?.title === undefined && req.body?.done === undefined) {
    return sendError(res, 400, 'Provide title, done, or both to update a task.');
  }

  if (req.body.title !== undefined) {
    const titleError = validateTitle(req.body.title);

    if (titleError) {
      return sendError(res, 400, titleError);
    }
  }

  if (req.body.done !== undefined) {
    const doneError = validateDone(req.body.done);

    if (doneError) {
      return sendError(res, 400, doneError);
    }
  }

  const task = findTaskById(id);

  if (!task) {
    return sendError(res, 404, `Task with ID ${id} was not found.`);
  }

  if (req.body.title !== undefined) {
    task.title = req.body.title.trim();
  }

  if (req.body.done !== undefined) {
    task.done = req.body.done;
  }

  return sendSuccess(res, 200, 'Task updated successfully.', task);
});

app.delete('/tasks/:id', (req, res) => {
  const id = parseTaskId(req.params.id);

  if (id === null) {
    return sendError(res, 400, 'Task ID must be a positive integer.');
  }

  const taskIndex = tasks.findIndex((task) => task.id === id);

  if (taskIndex === -1) {
    return sendError(res, 404, `Task with ID ${id} was not found.`);
  }

  const [deletedTask] = tasks.splice(taskIndex, 1);

  return sendSuccess(res, 200, 'Task deleted successfully.', deletedTask);
});

app.use((req, res) => {
  return sendError(res, 404, `Route ${req.method} ${req.originalUrl} was not found.`);
});

app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && 'body' in err) {
    return sendError(res, 400, 'Request body contains invalid JSON.');
  }

  return sendError(res, 500, 'Unexpected server error.');
});

const currentFile = fileURLToPath(import.meta.url);

if (process.argv[1] === currentFile) {
  server = app.listen(port, host, () => {
    console.log(`To Do List API is running at http://${host}:${port}`);
    console.log(`Swagger UI is available at http://${host}:${port}/docs`);
  });

  server.on('error', (err) => {
    console.error(`Failed to start server: ${err.message}`);
    process.exit(1);
  });
}

export default app;
