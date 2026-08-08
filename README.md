📝 To Do App API

A lightweight RESTful CRUD API built with Node.js, Express.js, and SQLite.

This API allows users to manage a to-do list with full support for:

* ✅ Creating tasks
* 📖 Reading tasks
* ✏️ Updating tasks
* 🗑️ Deleting tasks
* 🔎 Title search
* 🔍 Filtering by completion status
* 📊 Task statistics

The API uses SQLite for persistent data storage, so tasks survive server restarts.

This repository contains the hand-built Express.js To Do API in the root files and the AI-generated version in ai-version/.

⸻

🚀 How to Install & Run

Ensure you have Node.js v18 or higher installed.

1. Clone the repository

git clone <YOUR_GITHUB_REPO_URL>
cd ToDoAppApi

2. Install dependencies

npm install

3. Start the server

node index.mjs

The server will start at:

http://localhost:3000

The SQLite database is created automatically when the application starts.

⸻

🗄️ Database

This project uses SQLite with the better-sqlite3 library.

Why SQLite?

SQLite was chosen because it:

* Is lightweight
* Requires no separate database server
* Stores the entire database in a single file
* Is easy to set up and use
* Provides persistent storage for the API

The database file is:

tasks.db

It is stored in the project directory.

Automatic Database Setup

When the application starts:

1. tasks.db is created automatically if it does not already exist.
2. The tasks table is created automatically if it does not already exist.
3. Three example tasks are inserted only if the tasks table is empty.

Tasks Table

Column	Type	Description
id	INTEGER PRIMARY KEY	Unique task identifier
title	TEXT	Task title
done	BOOLEAN	Whether the task is completed

Unlike the previous in-memory implementation, task data is now stored in the database and survives server restarts.

Architecture

Client
   ↓
Express API
   ↓
SQLite Database

The API endpoints and their request/response behaviour remain the same. The main change is that the storage layer has been replaced with SQLite.

⸻

📌 API Endpoints

Method	Endpoint	Description	Status Codes
GET	/	API metadata and endpoints list	200
GET	/health	Server health check	200
GET	/stats	Task metrics: total, completed, and open	200
GET	/tasks	List all tasks	200
GET	/tasks/:id	Fetch a single task by ID	200, 404
POST	/tasks	Create a new task	201, 400
PUT	/tasks/:id	Update task title and completion status	200, 400, 404
DELETE	/tasks/:id	Delete a task by ID	204, 404

Query Parameters

The GET /tasks endpoint supports optional query parameters:

GET /tasks?done=true

Filters tasks by completion status.

GET /tasks?search=milk

Searches task titles.

These parameters can also be combined:

GET /tasks?done=false&search=milk

⸻

💻 Sample curl -i Output

Here is an example of creating a new task using POST /tasks:

curl -i -X POST http://localhost:3000/tasks \
  -H "Content-Type: application/json" \
  -d '{"title": "Complete Stage 5 documentation"}'

Example response:

HTTP/1.1 201 Created
X-Powered-By: Express
Content-Type: application/json; charset=utf-8
Content-Length: 63
{"id":4,"title":"Complete Stage 5 documentation","done":false}

⸻

📊 SQLite Queries

The database can be opened and inspected using a SQLite database viewer such as DB Browser for SQLite.

List every task

SELECT * FROM tasks;

Show only completed tasks

SELECT * FROM tasks WHERE done = 1;

Count all tasks

SELECT COUNT(*) FROM tasks;

Mark every task as completed

UPDATE tasks SET done = 1;

Delete all completed tasks

DELETE FROM tasks WHERE done = 1;

Changes made directly to the database are reflected by the API when the endpoints are requested again.

⸻

📸 Database Screenshot

The following screenshot shows the SQLite database and the tasks table in the database viewer:

⸻

📄 Interactive Documentation — Swagger UI

Interactive OpenAPI documentation is hosted directly at /docs using swagger-ui-express.

You can view, test, and execute the API routes directly from your browser:

http://localhost:3000/docs

Swagger UI

⸻

📁 Project Structure

ToDoAppApi/
├── ai-version/
│   ├── openapi.json
│   ├── package.json
│   ├── README.md
│   └── src/
│       └── server.js
├── Images/
│   ├── db.png
│   └── swagger.png
├── index.mjs
├── openapi.json
├── package-lock.json
├── package.json
├── README.md
└── tasks.db

⸻

🔄 Data Persistence

Before

The previous implementation stored tasks in an in-memory JavaScript array:

Client
   ↓
Express API
   ↓
In-memory Array

This meant that all tasks were lost whenever the server restarted.

Now

The current implementation stores tasks in SQLite:

Client
   ↓
Express API
   ↓
SQLite Database
   ↓
tasks.db

Creating, updating, and deleting tasks now modifies the SQLite database directly.

As a result, the data remains available after restarting the server.

The database and tasks table are also created automatically when they are missing, allowing someone cloning the repository to start the project without manually configuring a database.

⸻

🤖 AI vs Me

This project also contains an AI-generated implementation in ai-version/. The purpose of this comparison was to evaluate the differences between code written manually and code generated by AI.

Full Prompt Used for the AI Version

So I want you to generate a Node.js backend api using Express.js Framework. The api is about a to do list and there should be tasks stored in in-memory list and the task should have (int : id, string : title, boolean : done) properties. The api should have all crud endpoints. Dont forget to send appropriate status messages for error and success situations. You can also add extra endpoints such as stats, search, and filter by done property. Also make sure to include swagger view as well.
Put all the code in this folder [ai-version](ai-version/)

⸻

🧪 AI Version — Run Results

The AI version was placed in ai-version/, while the hand-built root API files were not changed.

It starts successfully with:

cd ai-version
npm start

The initial AI version passed the following checkpoint tests:

Check	Result
GET /health	✅ Pass — 200 OK
GET /tasks	✅ Pass — 200 OK
POST /tasks with valid title	✅ Pass — 201 Created
POST /tasks with blank title	✅ Pass — 400 Bad Request
GET /tasks/:id existing task	✅ Pass — 200 OK
GET /tasks/:id missing task	✅ Pass — 404 Not Found
PUT /tasks/:id	✅ Pass — 200 OK
PATCH /tasks/:id	✅ Pass — 200 OK
DELETE /tasks/:id	✅ Pass — 200 OK
GET /tasks?done=false	✅ Pass — 200 OK
GET /tasks?search=swagger	✅ Pass — 200 OK
GET /tasks?done=maybe	✅ Pass — 400 Bad Request
GET /tasks/stats	✅ Pass — 200 OK
GET /docs/	✅ Pass — 200 OK Swagger HTML

One curl command initially failed before reaching the API because the URL query string was not quoted in zsh. Quoting the URL fixed it.

⸻

🔍 Concrete Differences Found

1. Filtering and Search

The AI version handled filtering and search better.

It uses one GET /tasks route that applies done and search query parameters together.

The hand-built version accidentally defines GET /tasks three times, with the later filter/search handlers appearing after app.listen. As a result, the first GET /tasks route wins and query filtering is effectively ignored.

2. Validation

The AI version has stronger validation.

It:

* Rejects non-positive IDs
* Rejects non-integer IDs
* Validates done as a boolean
* Trims task titles
* Returns 400 for invalid JSON

The hand-built version mostly checks missing titles and missing done, but does not fully validate boolean types or invalid ID formats.

3. Response Format

The AI version uses consistent response envelopes containing:

{
  "success": true,
  "message": "...",
  "data": {}
}

The hand-built version returns raw task objects or arrays in some places, simple { "error": "..." } objects in others, and 204 No Content for successful deletion.

4. Swagger Documentation

The AI version documents every endpoint in Swagger, including query filters and examples.

The hand-built API also includes Swagger, but its implementation and documentation are less aligned around the search/filter functionality.

5. PATCH Endpoint

The AI version added:

PATCH /tasks/:id

This was useful, but the original prompt did not explicitly request PATCH or specify whether additional endpoints were allowed.

⸻

🤔 What the AI Got Wrong or Decided Silently

The AI chose a response envelope format on its own.

This format is clean, but the original prompt did not explicitly require:

{
  "success": true,
  "message": "...",
  "data": {}
}

The AI also chose /tasks/stats for statistics, while the hand-built API uses:

GET /stats

The original prompt asked for a stats endpoint but did not specify its exact path.

The AI returned 200 OK with the deleted task for DELETE, while the hand-built API uses 204 No Content.

The original prompt asked for an appropriate success response but did not explicitly define the expected status code.

⸻

🧠 What I Learned About My Prompt

The experiment showed that AI-generated code can make reasonable design decisions that may not match the intended specification.

My prompt needed to be more specific about:

* Exact response shapes
* Exact statistics route
* Whether PATCH should exist
* Delete status code
* Validation rules
* Search and filtering behaviour
* Swagger documentation requirements

Being more precise in the prompt makes the resulting implementation more predictable and easier to evaluate.

⸻

🔁 Rematch Prompt

Regenerate the Express.js to-do API in ai-version with the same in-memory task model: integer id, string title, boolean done.
Use only Node.js, Express.js, and swagger-ui-express. Do not add a database, authentication, TypeScript, or extra frameworks.
Use these exact routes:
- GET /health
- GET /tasks
- GET /tasks/:id
- POST /tasks
- PUT /tasks/:id
- DELETE /tasks/:id
- GET /tasks/stats
- GET /docs for Swagger UI
Do not add PATCH.
Use GET /tasks query parameters for both optional features:
- done=true or done=false filters by completion status.
- search=text performs a case-insensitive title search.
- If both are present, apply both.
Use this exact JSON envelope for successful JSON responses:
{
  "success": true,
  "message": "short message",
  "data": ...
}
Use this exact JSON envelope for errors:
{
  "success": false,
  "message": "short error message"
}
Status code rules:
- 200 for successful reads and updates.
- 201 for successful creates.
- 204 for successful deletes with no response body.
- 400 for blank title, invalid id format, invalid done type, invalid done filter, and invalid JSON.
- 404 for missing tasks and unknown routes.
Swagger/OpenAPI must document every route, request body, response body, status code, and query parameter.
Keep the code simple and put reusable validation helpers near the routes.

Rematch Result

The improved prompt removes ambiguity around:

* Response format
* Statistics path
* PATCH
* Delete status code
* Validation
* Combined filtering behaviour
* Swagger requirements

The original AI implementation was kept in ai-version/ so that the comparison remains unbiased.
