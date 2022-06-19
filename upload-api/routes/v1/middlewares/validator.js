const Ajv = require("ajv")
const ajv = new Ajv()

// Response
const { resp } = require("../data/response");

// Validate Add Image
const schemaId = {
  type: "object",
  properties: {
    id: { type: "string", minLength: 24, maxLength: 24 }
  },
  required: ["id"],
  additionalProperties: false
}

const id = ajv.compile(schemaId)

function isId(req, res, next) {
  const valid = id(req.body)
  if (!valid) {
    return res.status(200).json({ "response_code": 400, "message": resp[400], "response" : null })
  } else {
    next();
  }
}

module.exports = {
  isId
};