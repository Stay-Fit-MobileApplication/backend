const Ajv = require("ajv")
const addFormats = require("ajv-formats")
const ajv = new Ajv({verbose: true})
addFormats(ajv)

// Response
const { resp } = require("../data/response");

//Activeness Index
const active_index = [1.2,1.375,1.55,1.725,1.9]

const max_active_index = [250.0,275.0,300.0,325.0,350.0]

function predictor(req,res,next){
  if(req.temp_user.profile_completion == 0){
    return res.status(200).json({ "response_code": 400, "message": "Profile not completed.", "response" : null })
  }
  var maxCal = max_active_index[active_index.indexOf(req.temp_user.activeness)]
  if(maxCal>req.temp_user.cal_correction && req.temp_user.cal_correction>0){
    maxCal = req.temp_user.cal_correction
  }else if(req.temp_user.cal_correction<0){
    maxCal = 100
  }
  var days = parseInt(req.temp_user.cal_correction/maxCal) + 1
  var single_work_cal = (8/3600)*req.temp_user.weight*10*13
  req.iteration = Math.ceil(maxCal/single_work_cal)
  req.days = days
  next()
}

function predict(req){
  var maxCal = max_active_index[active_index.indexOf(req.body.activeness)]
  if(maxCal>req.body.cal_correction && req.body.cal_correction>0){
    maxCal = req.body.cal_correction
  }else if(req.body.cal_correction<0){
    maxCal = 100
  }
  var days = Math.ceil(req.body.cal_correction/maxCal)
  req.body.days = days
  return
}

// Validate id & count
const schemaIdCountValidate = {
  type: "object",
  properties: {
    id: { type: "string", maxLength: 24, minLength: 24 },
    count: { type: "number" }
  },
  required: ["id"],
  additionalProperties: false
}

const idCountValidate = ajv.compile(schemaIdCountValidate)

function idCountValidator(req, res, next) {
  const valid = idCountValidate(req.body)
  if (!valid) {
    return res.status(200).json({ "response_code": 400, "message": resp[400], "response" : null })
  } else {
    next();
  }
}

// Validate id
const schemaIdValidate = {
  type: "object",
  properties: {
    id: { type: "string", maxLength: 24, minLength: 24 }
  },
  required: ["id"],
  additionalProperties: false
}

const idValidate = ajv.compile(schemaIdValidate)

function idValidator(req, res, next) {
  const valid = idValidate(req.body)
  if (!valid) {
    return res.status(200).json({ "response_code": 400, "message": resp[400], "response" : null })
  } else {
    next();
  }
}

// Validate username
const schemaUsernameValidate = {
  type: "object",
  properties: {
    username: { type: "string", maxLength: 50, minLength: 2 }
  },
  required: ["username"],
  additionalProperties: false
}

const usernameValidate = ajv.compile(schemaUsernameValidate)

function usernameValidator(req, res, next) {
  const valid = usernameValidate(req.body)
  if (!valid) {
    return res.status(200).json({ "response_code": 400, "message": resp[400], "response" : null })
  } else {
    next();
  }
}

function getBaseLog(x, y) {
  return Math.log(y) / Math.log(x);
}

function bmi(req){
  return (req.body.weight)/Math.pow(req.body.height/100,2)
}

function bodyfat(req){
  if(req.body.gender == 'male'){
    return (495/((1.0324 - 0.19077*getBaseLog(10, (req.body.waist - req.body.neck))) + 0.15456*getBaseLog(10, req.body.height))) - 450
  }else{
    return (495/((1.29579 - 0.35004*getBaseLog(10, (req.body.waist + req.body.hip - req.body.neck))) + 0.22100*getBaseLog(10, req.body.height))) - 450
  }
}

function bmr(req){
  return (370 + (21.6*(1 - req.body.bodyfat/100)*req.body.weight))
}

function amr(req){
  return (req.body.activeness * req.body.bmr)
}

function totalCalDiff(req){
  let minFat = (req.body.gender == 'male') ? 0.18 : 0.25
  let maxFat = (req.body.gender == 'male') ? 0.25 : 0.31
  let mass = req.body.weight/9.8
  let fatDiff = req.body.bodyfat/100 - maxFat
  let tempWeight
  if(fatDiff<0){
    tempDiff = (fatDiff + maxFat) - minFat
    tempWeight = tempDiff * mass * 9.8
  }else{
    tempWeight = fatDiff * mass * 9.8
  }
  let calDiff = tempWeight * 7700
  console.log(calDiff)
  return calDiff
}

// Validate update
const schemaUpdateValidate = {
  type: "object",
  properties: {
    name: { type: "string", maxLength: 150, minLength: 2 },
    username: { type: "string", maxLength: 50, minLength: 2 },
    dob: { type: "string", format: "date" },
    height: { type: "number", minimum: 1, maximum: 300 },
    weight: { type: "number", minimum: 1, maximum: 300 },
    hip: { type: "number", minimum: 0, maximum: 300 },
    neck: { type: "number", minimum: 1, maximum: 300 },
    waist: { type: "number", minimum: 1, maximum: 300 },
    lat: { type: "number" },
    lon: { type: "number" },
    bio: { type: "string", maxLength: 500, minLength: 2 },
    gender: { type: "string", maxLength: 20, minLength: 2 },
    activeness: { type: "number", minimum: 0, maximum: 4 }
  },
  required: ["name", "dob", "username","height","weight","lat","lon","bio","gender","hip","neck","waist","activeness"],
  additionalProperties: false
}

const updateValidate = ajv.compile(schemaUpdateValidate)

function validateProfileUpdate(req, res, next) {
  const valid = updateValidate(req.body)
  if (!valid) {
    return res.status(200).json({ "response_code": 400, "message": resp[400], "response" : null })
  } else {
    if(req.body.gender != 'male' && req.body.gender != 'female'){
      return res.status(200).json({ "response_code": 402, "message": resp[400], "response" : null })
    }
    let lat = req.body.lat
    let lon = req.body.lon
    if(!(lat>=-90.0 && lat<=90.0 && lon>=-180.0 && lon<=180.0)){
      return res.status(200).json({ "response_code": 403, "message": resp[400], "response" : null })
    }
    req.body.bmi = bmi(req)
    req.body.bodyfat = bodyfat(req)
    req.body.bmr = bmr(req)
    req.body.activeness = active_index[req.body.activeness]
    req.body.amr = amr(req)
    req.body.cal_correction = totalCalDiff(req)
    req.old_profile_completion = req.temp_user.profile_completion
    req.temp_user.profile_completion = 1
    predict(req)
    next();
  }
}

function pageValidator(req, res, next){
  if (typeof req.query.limit == 'undefined') {
    req.query.limit = 10
  }else{
    if(!Number.isInteger(parseInt(req.query.limit))){
      return res.status(200).json({ "response_code": 400, "message": resp[400], "response": null });
    }else if(req.query.limit<1){
      return res.status(200).json({ "response_code": 400, "message": resp[400], "response": null });
    }
  }

  if (typeof req.query.page == 'undefined') {
    req.query.page = 1
  }else{
    if(!Number.isInteger(parseInt(req.query.page))){
      return res.status(200).json({ "response_code": 400, "message": resp[400], "response": null });
    }else if(req.query.page<1){
      return res.status(200).json({ "response_code": 400, "message": resp[400], "response": null });
    }
  }

  next()
}

module.exports = {
  idValidator,
  validateProfileUpdate,
  pageValidator,
  usernameValidator,
  predictor,
  idCountValidator
};