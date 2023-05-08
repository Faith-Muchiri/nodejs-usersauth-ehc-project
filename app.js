const express = require('express');
const connectDb = require('./config/dbConnection');
const errorHandler = require('./middleware/errorHandler');
const dotnev = require('dotenv').config();

connectDb();
const app = express();

// create port
const port = process.env.PORT || 8000;

app.use(express.json());
app.use("/api/users", require("./routes/userRoutes"));
app.use('/api/password',require('./routes/forgotPasswordRoutes'));
app.use(errorHandler);

// starting a server
app.listen(port, () => {
    console.log(`App is running at ${port}`)
})