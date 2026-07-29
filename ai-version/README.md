# To Do List API

Node.js backend API built with Express.js. Tasks are stored in an in-memory list and use this shape:

```json
{
  "id": 1,
  "title": "Learn Express.js",
  "done": false
}
```

## Run

```bash
cd ai-version
npm install
npm start
```

The API runs on `http://localhost:3000` by default.

Swagger UI is available at:

```text
http://localhost:3000/docs
```

You can change the port:

```bash
PORT=4000 npm start
```

You can also change the bind host:

```bash
HOST=0.0.0.0 PORT=4000 npm start
```

## Endpoints

| Method | Path | Description |
| --- | --- | --- |
| GET | `/` | API information |
| GET | `/health` | Health check |
| GET | `/tasks` | List all tasks |
| GET | `/tasks?done=true` | Filter by done status |
| GET | `/tasks?search=express` | Search by title |
| GET | `/tasks/stats` | Get task counts |
| GET | `/tasks/:id` | Get one task |
| POST | `/tasks` | Create a task |
| PUT | `/tasks/:id` | Replace a task |
| PATCH | `/tasks/:id` | Partially update a task |
| DELETE | `/tasks/:id` | Delete a task |

## Example Requests

Create a task:

```bash
curl -X POST http://localhost:3000/tasks \
  -H "Content-Type: application/json" \
  -d '{"title":"Finish assignment","done":false}'
```

Update a task:

```bash
curl -X PATCH http://localhost:3000/tasks/1 \
  -H "Content-Type: application/json" \
  -d '{"done":true}'
```
