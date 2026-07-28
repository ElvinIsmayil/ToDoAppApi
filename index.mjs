import express from 'express';

const app = express();
const port = 3000;

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
        res.send({ "error": `Task ${taskId} not found` });
    }
    res.json(task);
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
