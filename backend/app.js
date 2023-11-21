const { v4: uuidv4 } = require('uuid');
const express = require("express");
const mongodb = require("mongodb");

const app = express();
let db;

// CORS middleware for local work.
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*"); // Allows access from any origin
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS"); // Include PUT here
    next();
});

/* For this to work, just download and install mongoDB. Once the service is running, this should connect to it with
The default settings. */
app.listen(8080, ()=> {
    const mongodbURI = "mongodb://localhost:27017";
    const client = new mongodb.MongoClient(mongodbURI);
    client.connect().then((server) => {
        db = server.db('joeys_app')
    });
    console.log("My app started.")
});

app.post("/addTask", async (req, res) => {
    // POST method for adding tasks to the DB.
    const queryParams = req.query;
    const task = queryParams.task;
    // Create a UUID for saving the task to the DB.
    const uid = uuidv4();
    await db.collection('tasks').insertOne({task, completed: false, uid: uid});
    res.status(200).json({ uid: uid})
    console.log(`Task added with uid: ${uid}`)
})

app.get("/getTasks", async (req, res) => {
    // GET method for retrieving Tasks list.
    let data = await db.collection("tasks").find().toArray();
    res.status(200).json(data)
    console.log("Tasks sent.")
})

app.put("/toggleCompleted", async (req, res) => {
    // PUT method for toggling completed status of a Task.
    const queryParams = req.query;
    const taskUID = queryParams.uid;
    let taskObject = await db.collection("tasks").findOne({uid: taskUID});
    if(taskObject.completed){
        await db.collection("tasks").updateOne({uid: taskUID}, { $set: {completed: false}});
    }
    else{
        await db.collection("tasks").updateOne({uid: taskUID}, { $set: {completed: true}});
    }
    taskObject = await db.collection("tasks").findOne({uid: taskUID});
    res.status(200).json({uid: taskUID, completed: taskObject.completed})
    console.log("Tasks marked completed.")
});

app.delete("/clearCompleted", async (req, res) => {
    // DELETE method for removing completed tasks from the DB.
    await db.collection("tasks").deleteMany({completed: true})
    console.log("DELETED COMPLETED")
    res.sendStatus(200)
})