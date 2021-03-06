const express = require('express');
const router = express.Router();
var user = require("../../models/user");
const mongoose = require('../../services/mongo_db');
const axios = require('axios');

// Validator middleware
const { idValidator, validateProfileUpdate, usernameValidator } = require("./middlewares/validator");

// Database connectivity validator middleware
const { mongoDBping } = require("./middlewares/mongodb");

// User middleware
const { validateUserByID, validateOtherUserByID, formatUserViewData, formatSameUserViewData, formatSameUserViewDataFunc, processUpdateData } = require("./middlewares/user");

// Token middleware
const { verifyAccessToken } = require("./middlewares/token");

// Response
const { resp } = require("./data/response");

//Routes
router.get('/status/', verifyAccessToken, mongoDBping, validateUserByID, formatSameUserViewData, async (req, res) => {

  return res.status(200).json({ "response_code": 200, "message": resp[200], "response": { "profile_completion": req.temp_user.profile_completion, "user": req.temp_user } });
});

router.post('/update', verifyAccessToken, mongoDBping, validateUserByID, validateProfileUpdate, processUpdateData, async (req, res) => {

  req.temp_user.save()
    .then(data => {
      if (req.old_profile_completion == 0) {

        const send_data = {
          id: req.temp_user._id.toString(),
          title: 'Profile completed',
          body: 'Hi ' + req.temp_user.name + ', you have completed your profile 🎉. Stay fit stay healthy.'
        }

        axios.post('http://app.geekstudios.tech/contact/v1/push', send_data)
          .then((response) => {
            data = formatSameUserViewDataFunc(data)
            return res.status(200).json({ "response_code": 200, "message": resp["prof-updated"], "response": { "user": data } });
          })
          .catch((error) => {
            console.log(error)
            data = formatSameUserViewDataFunc(data)
            return res.status(200).json({ "response_code": 200, "message": resp["prof-updated"], "response": { "user": data } });
          })
      } else {
        data = formatSameUserViewDataFunc(data)
        return res.status(200).json({ "response_code": 200, "message": resp["prof-updated"], "response": { "user": data } });
      }
    })
    .catch(err => {
      console.log(err);
      return res.status(200).json({ "response_code": 500, "message": resp[500], "response": null });
    })
});

router.post('/username/available', verifyAccessToken, mongoDBping, usernameValidator, validateUserByID, async (req, res) => {

  user.find({ username: req.body.username })
    .then(data => {
      if (data == null) {
        return res.status(200).json({ "response_code": 200, "message": resp["username-avail"], "response": { "user": data } });
      }
      return res.status(200).json({ "response_code": 400, "message": resp["username-taken"], "response": { "user": data } });
    })
    .catch(err => {
      console.log(err);
      return res.status(200).json({ "response_code": 500, "message": resp[500], "response": null });
    })
});

router.get('/get/nearby-users/:id', verifyAccessToken, mongoDBping, validateUserByID, async (req, res) => {

  if (!Number.isInteger(parseInt(req.params.id))) {
    return res.status(200).json({ "response_code": 400, "message": resp[400], "response": null });
  } else {
    req.km = parseInt(req.params.id)
    if (req.km > 600 || req.km <= 0) {
      return res.status(200).json({ "response_code": 400, "message": resp["distance-error"], "response": null });
    }
  }

  user.find({ _id: { $nin: [req.temp_user._id] }, location: { $near: { $geometry: { type: "Point", coordinates: req.temp_user.location.coordinates }, $maxDistance: parseInt(req.km) } } }, { _id: 1, name: 1, profile_images: 1, username: 1, phone: 1, country_code: 1 })
    .then(data => {
      return res.status(200).json({ "response_code": 200, "message": resp["prof-fetched"], "response": { "users": data } });
    })
    .catch(err => {
      console.log(err);
      return res.status(200).json({ "response_code": 500, "message": resp[500], "response": null });
    })
});

router.get('/get', verifyAccessToken, mongoDBping, validateUserByID, formatSameUserViewData, async (req, res) => {

  return res.status(200).json({ "response_code": 200, "message": resp["prof-fetched"], "response": { "user": req.temp_user } });
});

router.post('/view/user', idValidator, verifyAccessToken, mongoDBping, validateUserByID, validateOtherUserByID, formatUserViewData, async (req, res) => {

  return res.status(200).json({ "response_code": 200, "message": resp["prof-fetched"], "response": { "user": req.other_user } });
});

module.exports = router;