const Ajv = require("ajv")
const ajv = new Ajv()

// Response
const { resp } = require("../data/response");

// Validate Phone & OTP
const schemaPhoneOTP = {
  type: "object",
  properties: {
    phone: { type: "string", maxLength: 12, minLength: 4 },
    country_code: { type: "string", maxLength: 12, minLength: 1 },
    otp: { type: "string", maxLength: 6, minLength: 6 },
    device: {
      type: "object",
      properties: {
        fcm: { type: "string", maxLength: 500, minLength: 10 }
      },
      additionalProperties: false
    }
  },
  required: ["phone", "otp", "country_code","device"],
  additionalProperties: false,
}

const validatePhoneOTP = ajv.compile(schemaPhoneOTP)

function isPhoneOTP(req, res, next) {
  const valid = validatePhoneOTP(req.body)
  if (!valid) {
    return res.status(200).json({ "response_code": 400, "message": resp[400], "response" : null })
  } else {
    next();
  }
}


// Validate Phone
const schemaPhone = {
  type: "object",
  properties: {
    phone: { type: "string", maxLength: 12, minLength: 4 },
    country_code: { type: "string", maxLength: 12, minLength: 1 }
  },
  required: ["phone", "country_code"],
  additionalProperties: false,
}

const validatePhone = ajv.compile(schemaPhone)

function isPhone(req, res, next) {
  const valid = validatePhone(req.body)
  if (!valid) {
    return res.status(200).json({ "response_code": 400, "message": resp[400], "response" : null })
  } else {
    next();
  }
}

// Validate FCM
const schemaFCM = {
  type: "object",
  properties: {
    fcm: { type: "string", maxLength: 500, minLength: 10 }
  },
  required: ["fcm"],
  additionalProperties: false,
}

const validateFCM = ajv.compile(schemaFCM)

function isFCM(req, res, next) {
  const valid = validateFCM(req.body)
  if (!valid) {
    return res.status(200).json({ "response_code": 400, "message": resp[400], "response" : null })
  } else {
    next();
  }
}

module.exports = {
  isPhone,
  isPhoneOTP,
  isFCM
};