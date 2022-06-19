const mongoose = require('../../../services/mongo_db');
const user = require('../../../models/user');

// Response
const { resp } = require("../data/response");

function validateUserByID(req, res, next) {

  user.findById(req.token.id)
    .then(data => {
      if (data == null) {
        return res.status(200).json({ "response_code": 404, "message": resp["account-not-found"], "response": null });
      } else {
        req.temp_user = data;
        next();
      }
    })
    .catch(err => {
      console.log(err);
      return res.status(200).json({ "response_code": 500, "message": resp[500], "response": null });
    })
}

function validateOtherUserByID(req, res, next) {

  user.findById(req.body.id)
    .then(data => {
      if (data == null) {
        return res.status(200).json({ "response_code": 404, "message": resp["account-not-found"], "response": null });
      } else {
        if (data._id.toString() == req.temp_user._id.toString()) { return res.status(200).json({ "response_code": 404, "message": resp["req-rec-should-not-same"], "response": null }); }
        req.other_user = data;
        next();
      }
    })
    .catch(err => {
      console.log(err);
      return res.status(200).json({ "response_code": 500, "message": resp[500], "response": null });
    })
}

function formatUserViewData(req, res, next) {

  //req.other_user.phone = undefined;
  //req.other_user.country_code = undefined;
  req.other_user.connected_users = undefined;
  req.other_user.profile_completion = undefined;
  req.other_user.device = undefined;
  req.other_user.creation_ip = undefined;
  req.other_user.updation_ip = undefined;
  req.other_user.__v = undefined;
  req.other_user.created_at = undefined;
  req.other_user.updated_at = undefined;

  next();

}

function formatSameUserViewData(req, res, next) {

  req.temp_user.device = undefined;
  req.temp_user.creation_ip = undefined;
  req.temp_user.updation_ip = undefined;
  req.temp_user.__v = undefined;
  req.temp_user.created_at = undefined;
  req.temp_user.updated_at = undefined;

  next();

}

function formatSameUserViewDataFunc(data) {

  data.device = undefined;
  data.creation_ip = undefined;
  data.updation_ip = undefined;
  data.__v = undefined;
  data.created_at = undefined;
  data.updated_at = undefined;

  return data

}

async function processUpdateData(req, res, next) {

  for (let [key, value] of Object.entries(req.body)) {
    if (key == 'lat' || key == 'lon') { 
      req.temp_user.location.coordinates = [req.body.lon,req.body.lat]
     }else{
      req.temp_user[key] = value
     }
  }

  return next();

}

module.exports = {
  validateUserByID,
  validateOtherUserByID,
  formatUserViewData,
  processUpdateData,
  formatSameUserViewData,
  formatSameUserViewDataFunc
};