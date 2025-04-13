const express = require('express');
const bodyParser = require('body-parser');
const helmet = require('helmet');
const cors = require('cors');
const hpp = require('hpp');
const path = require('path');

const userRouter = require('./routes/userRoutes.js');
const jobsRouter = require('./routes/jobsRoutes.js');
const assignmentRouter = require('./routes/assignmentsRoutes.js');

const app = express();

// GLOBAL MIDDLEWARES
//Set security HTTP headers
// app.use(helmet());

// Body parser, reading data from body into req.body
app.use(express.json({ limit: '10kb' }));
app.use(express.static(`${__dirname}/public/img/users`));

app.use(bodyParser.urlencoded({ extended: false }));

app.use(
  helmet({
    crossOriginResourcePolicy: false,
  })
);

app.use(cors());

//ROUTES

//Prevent parameter pollution
app.use(hpp({ whitelist: ['jobs'] }));

// Serving static files

app.use('/api/v1/users', userRouter);
app.use('/api/v1/jobs', jobsRouter);
app.use('/api/v1/assignments', assignmentRouter);

module.exports = app;
