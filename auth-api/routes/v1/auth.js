const express = require('express');
const router = express.Router();
const mongoose = require('../../services/mongo_db');
const guest_user = require('../../models/guest_user');
var os = require('os');

// OTP controller
const { cacheOTP, uncacheOTP } = require("./controllers/otp");

// Validator middleware
const { isPhone, isPhoneOTP, isFCM } = require("./middlewares/validator");

// Database connectivity validator middleware
const { mongoDBping, mongoHealthCheck } = require("./middlewares/mongodb");
const { redisHealthCheck } = require("./middlewares/redis");

// OTP middleware
const { generateOTP, validateOTP } = require("./middlewares/otp");

// User middleware
const { createUserIfNotExist, validateUserExist, validateUserByID, removeGuestFCM, removeGuestFCMFromToken, maxDeviceCheck } = require("./middlewares/user");

// Token middleware
const { createTokens, verifyRefreshToken, refreshTokens, verifyAccessToken, uncacheToken } = require("./middlewares/token");

// Response
const { resp } = require("./data/response");

//Routes
router.post('/login/', isPhone, mongoDBping, createUserIfNotExist, async (req, res) => {
  try {

    const otp = generateOTP(6);
    cacheOTP(req, otp, res);

  } catch (err) {
    console.log(err);
    return res.status(200).json({ "response_code": 500, "message": resp[500], "response" : null });
  }
});

router.post('/validate/otp/', isPhoneOTP, mongoDBping, validateUserExist, removeGuestFCM, validateOTP, maxDeviceCheck, createTokens, async (req, res) => {

  req.temp_user.save()
    .then(data => {
      uncacheOTP(req, res, data);
    })
    .catch(err => {
      console.log(err);
      return res.status(200).json({ "response_code": 500, "message": resp[500], "response" : null });
    })
});

router.get('/token/refresh/', verifyRefreshToken, mongoDBping, validateUserByID, removeGuestFCMFromToken, refreshTokens, async (req, res) => {

  req.temp_user.save()
    .then(data => {
      return res.status(200).json({ "response_code": 200, "message": resp["token-generated-success"], "response" : { "accessToken": req.accesstoken, "refreshToken": req.refreshtoken } });
    })
    .catch(err => {
      console.log(err);
      return res.status(200).json({ "response_code": 500, "message": resp[500], "response" : null });
    })
});

router.get('/logout/', verifyAccessToken, mongoDBping, validateUserByID, uncacheToken, async (req, res) => {

  req.temp_user.save()
    .then(data => {
      return res.status(200).json({ "response_code": 200, "message": resp["logged-out-success"], "response" : null });
    })
    .catch(err => {
      console.log(err);
      return res.status(200).json({ "response_code": 500, "message": resp[500], "response" : null });
    })
})

// router.post('/guest/fcm', isFCM, mongoDBping, async (req, res) => {

//   var g_u = new guest_user();
//   g_u.fcm = req.body.fcm;
//   g_u.ip = req.ip;

//   g_u.save()
//     .then(data => {
//       return res.status(200).json({ "response_code": 200, "message": resp["guest-fcm-added"], "response" : null });
//     })
//     .catch(err => {
//       if(err.name=='MongoServerError'){
//         return res.status(200).json({ "response_code": 200, "message": resp["guest-fcm-added"], "response" : null });
//       }
//       console.log(err);
//       return res.status(200).json({ "response_code": 500, "message": resp[500], "response" : null });
//     })
// });

router.get('/healthcheck', mongoHealthCheck, redisHealthCheck, async (req, res) => {

  return res.status(200).json({ "response_code": 200, "message": resp[200], "response" : { "database": req.mongodb, "database_code": req.code_mongodb, "cache_database": req.redis, "cache_database_code": req.code_redis, "version": "1.0", "hostname": os.hostname() } });
});

module.exports = router;