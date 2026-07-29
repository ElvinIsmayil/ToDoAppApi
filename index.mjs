import express from 'express';
import swaggerUi from 'swagger-ui-express';
import openapiDocument from './openapi.json' with { type: 'json' };

const app = express();
const port = 3000;

app.use(express.json());
app.use('/docs', swaggerUi.serve, swaggerUi.setup(openapiDocument));

let tasks = [
  { id: 1, title: 'Learn Express essentials', done: true },
  { id: 2, title: 'Build CRUD API assignment', done: false },
  { id: 3, title: 'Publish repo to GitHub', done: false }
];

app.get('/', (req, res) => {
  res.send({ "name": "Task API", "version": "1.0", "endpoints": ["/tasks"] });
});

app.get('/health' , (req,res) => {
    res.send({ "status": "ok" });
});

app.get('/tasks' ,(req, res) => {
    res.send(tasks);
});

app.get('/tasks/:id', (req,res) => {
    const taskId = parseInt(req.params.id, 10);
    const task = tasks.find(x=> x.id === taskId);

    if(!task){
        return res.status(404).json({ "error": `Task ${taskId} not found` });
    }
    res.json(task);
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

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});



