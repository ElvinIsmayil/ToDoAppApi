import express from 'express';
import swaggerUi from 'swagger-ui-express';
import Database from 'better-sqlite3';
import openapiDocument from './openapi.json' with { type: 'json' };

const app = express();
const port = 3000;

// Database initialization
const db = new Database('tasks.db');

db.exec(`
  CREATE TABLE IF NOT EXISTS tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    done INTEGER NOT NULL DEFAULT 0
  )
`);

// We retrieve the number of tasks using sql statement 
const countStmt = db.prepare('SELECT COUNT(*) AS count FROM tasks');
const { count } = countStmt.get();


// Example taks which are inserted if the tasks table is empty in the db
if (count === 0) {
  const insertStmt = db.prepare('INSERT INTO tasks (title, done) VALUES (?, ?)');
  insertStmt.run('Buy groceries', 0);
  insertStmt.run('Clean the desk', 0);
  insertStmt.run('Complete Week 2 Assignment', 1);
}

app.use(express.json());
app.use('/docs', swaggerUi.serve, swaggerUi.setup(openapiDocument));


app.get('/', (req, res) => {
  res.send({ "name": "Task API", "version": "1.0", "endpoints": ["/tasks"] });
});

app.get('/health' , (req,res) => {
    res.send({ "status": "ok" });
});

app.get('/tasks' ,(req, res) => {
        const done = req.query.done;
        const search = req.query.search;

        if(done !== undefined){
            const isDone = (done === 'true' || done === '1') ? 1 : 0;
            const getStmt = db.prepare('SELECT * FROM tasks WHERE done = ?');
            const tasks = getStmt.all(isDone).map(task => ({
                ...task,
                done: Boolean(task.done)
            }));
           return res.json(tasks);
        }
        if(search){
            const getStmt = db.prepare('SELECT * FROM tasks WHERE title LIKE ?');
            const tasks = getStmt.all(`%${search}%`).map(task => ({
                ...task,
                done: Boolean(task.done)
            }));
           return res.json(tasks);
        }
        else{
            const getStmt = db.prepare('SELECT * FROM tasks');
            const tasks = getStmt.all().map(task => ({
                    ...task,
                    done: Boolean(task.done)
                }));
            return res.json(tasks);
        }
});


app.get('/tasks/:id', (req,res) => {
    const taskId = parseInt(req.params.id, 10);
    const stmt = db.prepare('SELECT * FROM tasks WHERE id = ?');
    const task = stmt.get(req.params.id);
    if(!task){
        return res.status(404).json({ "error": `Task ${taskId} not found` });
    }

   const formattedTask = {
  ...task,
  done: Boolean(task.done)
};

    res.json(formattedTask);
})

app.post('/tasks', (req,res)=> {
    if(!req.body.title || req.body.title.trim() === ""){
        return res.status(400).json({"error" : "The title is missing"});
    }

    const stmt = db.prepare('INSERT INTO tasks (title, done) VALUES (?, ?)');
    const info = stmt.run(req.body.title, 0);

    const newTask = db.prepare('SELECT * FROM tasks WHERE id = ?').get(info.lastInsertRowid);

    res.status(201).json({
        ...newTask,
    done: Boolean(newTask.done)
    });
});

app.put('/tasks/:id', (req,res) => {
    if(!req.body.title || req.body.title.trim() == "" || req.body.done == null){
        return res.status(400).json({"error" : "The request is invalid"});
    }
    const taskId = parseInt(req.params.id,10);
    const existingTask = db.prepare('SELECT * FROM tasks WHERE id = ?').get(taskId);

    if(!existingTask){
        return res.status(404).json({"error" : "The task was not found"});
    }

    const updatedTitle = req.body.title.trim();
    const updatedDone = req.body.done ? 1 : 0;

     const updateStmt = db.prepare('UPDATE tasks SET title = ?, done = ? WHERE id = ?');
    updateStmt.run(updatedTitle, updatedDone, taskId);

    const updatedTask = db.prepare('SELECT * FROM tasks WHERE id = ?').get(taskId);

    return res.json({
    ...updatedTask,
    done: Boolean(updatedTask.done) 
  });
});


app.delete('/tasks/:id', (req,res) => {
    const taskId = parseInt(req.params.id,10);
    const existingTask = db.prepare('SELECT * FROM tasks WHERE id = ?').get(taskId);

    if(!existingTask){
        return res.status(404).json({"error" : "The task was not found"});
    }

    const deleteStmt = db.prepare('DELETE FROM tasks WHERE id = ?');
    const result = deleteStmt.run(req.params.id);
    if(result.changes == 0){
       return res.status(404).json({"error" : "The task could not be deleted"});
    }

   return res.status(204).send();
})

app.get('/stats', (req,res)=>{
    const total = db.prepare('SELECT COUNT(*) AS total FROM tasks').get().total;
    const done = db.prepare('SELECT COUNT(*) AS done FROM tasks WHERE done = ?').get(1).done;
    const open = total - done;

    const response = {"total" : total, "done" : done, "open" : open};
    res.json(response);
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);  
});  



