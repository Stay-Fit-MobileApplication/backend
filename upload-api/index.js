require('dotenv').config();
process.env.TZ = 'Asia/Calcutta'
const express = require('express');
const app = express();
const PORT = process.env.PORT;

app.use(express.json());
app.set('trust proxy', 1);

const uploadRoute = require('./routes/v1/upload');
app.use('/v1', uploadRoute);

const server = app.listen(
  PORT,
  () => console.log(`Upload service is running on port : ${PORT}`)
)