const express = require('express');
const router = express.Router();
const mongoose = require('../../services/mongo_db');

// Validator middleware
const { predictor } = require("./middlewares/validator");

// Database connectivity validator middleware
const { mongoDBping } = require("./middlewares/mongodb");

// User middleware
const { validateUserByID } = require("./middlewares/user");

// Token middleware
const { verifyAccessToken } = require("./middlewares/token");

// Response
const { resp } = require("./data/response");

//Routes
router.get('/get/ai/plan', verifyAccessToken, mongoDBping, validateUserByID, predictor, async (req, res) => {

  return res.status(200).json({ "response_code": 200, "message": resp[200], "response" : { "iteration" : req.iteration, "days-remaining": req.days } })
});

module.exports = router;