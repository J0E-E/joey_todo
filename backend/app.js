const express = require("express");
const mongodb = require("mongodb");

const app = express();

// CORS middleware
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*"); // Allows access from any origin
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS"); // Include PUT here
    next();
  });

app.listen(8080, ()=> {
    const mongodbUri = "mongodb://localhost:27017";
    const client = new mongodb.MongoClient(mongodbUri);
    client.connect().then((server) => {
        db = server.db('joeys_app')
    });
    console.log("My app started.")
});

app.get("/addTask", async (req, res) => {
    const queryParams = req.query;
    const task = queryParams.task;
    await db.collection('tasks').insertOne({task, completed: false});
    res.sendStatus(200)
    console.log("Task added.")
})

app.get("/getTasks", async (req, res) => {
    let data = await db.collection("tasks").find().toArray();
    res.json(data)
    console.log("Tasks sent.")
})

app.put("/markCompleted", async (req, res) => {
    const queryParams = req.query;
    const task = queryParams.task;
    await db.collection("tasks").updateOne({task}, { $set: {completed: true}});
    res.sendStatus(200);
});