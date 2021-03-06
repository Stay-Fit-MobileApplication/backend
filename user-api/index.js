require('dotenv').config();
process.env.TZ = 'Asia/Calcutta'
const express = require('express');
const app = express();
const PORT = process.env.PORT;

app.use(express.json());
app.set('trust proxy', 1);

const profileRoute = require('./routes/v1/profile');
app.use('/v1/profile', profileRoute);

const workoutRoute = require('./routes/v1/workout');
app.use('/v1/workout', workoutRoute);

const requestRoute = require('./routes/v1/request');
app.use('/v1/request', requestRoute);

const challengeRoute = require('./routes/v1/challenge');
app.use('/v1/challenge', challengeRoute);

const healthRoute = require('./routes/v1/health');
app.use('/v1/healthcheck', healthRoute);

const server = app.listen(
  PORT,
  () => console.log(`User service is running on port : ${PORT}`)
)