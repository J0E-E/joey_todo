const { v4: uuidv4 } = require('uuid');
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



app.post("/addTask", async (req, res) => {
    const queryParams = req.query;
    const task = queryParams.task;
    const uid = uuidv4()
    await db.collection('tasks').insertOne({task, completed: false, uid: uid});
    res.status(200).json({ uid: uid})
    console.log(`Task added with uid: ${uid}`)
})

app.get("/getTasks", async (req, res) => {
    let data = await db.collection("tasks").find().toArray();
    res.json(data)
    console.log("Tasks sent.")
})

app.put("/toggleCompleted", async (req, res) => {
    const queryParams = req.query;
    const taskUID = queryParams.uid;
    let taskObject = await db.collection("tasks").findOne({uid: taskUID});
    if(taskObject.completed){
        await db.collection("tasks").updateOne({uid: taskUID}, { $set: {completed: false}});
    }else{
        await db.collection("tasks").updateOne({uid: taskUID}, { $set: {completed: true}});
    }
    taskObject = await db.collection("tasks").findOne({uid: taskUID});
    res.status(200).json({uid: taskUID, completed: taskObject.completed})
    console.log("Tasks marked completed.")
});

app.delete("/clearCompleted", async (req, res) => {
    await db.collection("tasks").deleteMany({completed: true})
    console.log("DELETED COMPLETED")
    res.sendStatus(200)
})