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
            res.json(tasks);
        }
        if(search){
            const getStmt = db.prepare('SELECT * FROM tasks WHERE title LIKE ?');
            const tasks = getStmt.all(`%${search}%`).map(task => ({
                ...task,
                done: Boolean(task.done)
            }));
             res.json(tasks);
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

    const taskId = tasks[tasks.length - 1].id + 1;
    let task = {id : taskId, title: req.body.title, done: false};
    
    tasks.push(task);
    res.status(201).json(task);
});

app.put('/tasks/:id', (req,res) => {
    if(!req.body.title || req.body.title.trim() == "" || req.body.done == null){
        return res.status(400).json({"error" : "The request is invalid"});
    }
    const taskId = parseInt(req.params.id,10);
    const task = tasks.find(x=> x.id === taskId);
    if(!task){
        return res.status(404).json({"error" : "The task was not found"});
    }
    task.title = req.body.title;
    task.done = req.body.done;
    res.json(task);
})

app.delete('/tasks/:id', (req,res) => {
    const taskId = parseInt(req.params.id,10);
    let task = tasks.find(x=>x.id === taskId);
    let index = tasks.findIndex(x=>x.id === taskId);
    if(!task){
        return res.status(404).json({"error" : "The task was not found"});
    }
    tasks.splice(index,1);
    res.status(204).send();
})

app.get('/stats', (req,res)=>{
    const total = tasks.length;
    const done = tasks.filter(x=> x.done === true).length;
    const open = total - done;

    const response = {"total" : total, "done" : done, "open" : open};
    res.json(response);
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);  
});  



