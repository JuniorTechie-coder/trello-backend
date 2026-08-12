require('dotenv').config();
const express = require('express');
const pool = require('./db');
const userRoutes = require('./routes/users');
const workspacesRoutes = require('./routes/workspaces');
const boardsRoute = require('./routes/boards');


const app = express();

//MiddleWare
app.use(express.json());

//Logger
app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
});


//Routes
app.use('/api/users', userRoutes);
app.use('/api/workspaces', workspacesRoutes);
app.use('/api/boards', boardsRoute);


//404 handelers
app.use((req, res) => {
    res.status(404).json('error: Users not found');
});

//server start
app.listen(3000, () => {
    console.log("Server running on port 3000");
});

