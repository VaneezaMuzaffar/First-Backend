//server provide whole background for // website where all website will be run also a computer which handles requests or response
//In express proper backend create or Api create(approch use MVC) 

// M=>model=>DB=>MongoDB(Model,Schema,Collection)

// V=>View

// C=Controller=>functions=>bridge between db or frontend
//When we build APIs (using Express.js or any backend), we use HTTP methods to define 
// what kind of operation we want to perform on the server.

const express = require('express');
const app = express();
const cors = require("cors");
const ConnectDB = require('./config/db.js');
const user = require("./router/userRouter.js");
const classRoutes = require("./router/classRoutes.js");
const assignmentRoutes = require("./router/assignmentRoutes.js");

ConnectDB();
app.use(express.json()); //json data convert in object
app.use(cors());

// Routes
app.use("/api/v1/user", user);
app.use("/api/v1/class", classRoutes);
app.use("/api/v1/assignment", assignmentRoutes);

app.listen(8000, () => {
  console.log("Server is running on port: 8000");
});
 //creating server here 



//2. POST → Create new data
//Used to send new data to the server (like submitting a form or creating a new user).
// app.post("/users", (req, res) => {
//   res.send("New user created");
// });//Typically used with fetch() or axios from the frontend.


//1. GET → Read / Fetch data
//Used to retrieve data from the server.
// static routing 
// app.get("/users", (req, res) => {
//   res.send("Get all users from data base");
// });//When you visit http://localhost:8000/users in your browser, it sends a GET request.

// dynamic routing for get data 
// 2️⃣ GET → Dynamic route (Fetch specific user by ID)
// app.get("/user/:id", (req, res) => {
//   const data = req.params;
//   console.log("User ID received:", data.id);
//   res.send(`Hello user id: ${data.id} from the backend`);
// });



//4. PATCH → Partially update data (Optional)
//Used to update only part of an existing record (not full data).
// app.patch("/users/:id", (req, res) => {
//   res.send(`User ${req.params.id} partially updated`);
// });

//5. DELETE → Remove data
//Used to delete an existing record.
// app.delete("/users/:id", (req, res) => {
//   res.send(`User with ID ${req.params.id} deleted`);
// });
