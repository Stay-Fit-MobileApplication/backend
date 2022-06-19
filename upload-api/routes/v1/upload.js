const express = require('express');
const router = express.Router();
const mongoose = require('../../services/mongo_db');
var image = require('../../models/image');
const user = require('../../models/user');
const mongo = require('mongoose');
var os = require('os');

// Token middleware
const { verifyAccessToken } = require("./middlewares/token");

// Database connectivity validator middleware
const { mongoDBping, mongoHealthCheck } = require("./middlewares/mongodb");
const { redisHealthCheck } = require("./middlewares/redis");

// User middleware
const { validateUserByID } = require("./middlewares/user");

// Uploader middleware
const { uploadMulter, uploader, sharpify } = require("./middlewares/aws");

// Response
const { resp } = require("./data/response");

//Routes

router.post('/add/profile', mongoDBping, verifyAccessToken, validateUserByID, async (req, res) => {
  await uploadMulter(req, res, async (err) => {
    if (err) return res.status(200).json({ "response_code": 400, "message": resp["upload-exceed"], "response" : null });

    try {
      if(req.files === undefined){
        return res.status(200).json({ "response_code": 400, "message": resp["please-attach-photo"], "response" : null });
      }
      let files = req.files.file
      for (const key in files) {
        let originalFile = files[key]
        let newFile = await sharpify(originalFile)
        let newName = Date.now();
        let ext = originalFile.originalname.split('.').pop()
        var ogData = await uploader(req.temp_user._id, originalFile.buffer, originalFile.mimetype, newName + '.' + ext)
        var tbData = await uploader(req.temp_user._id, newFile, originalFile.mimetype, newName + '-thumbnail.' + ext)
        if(!(ogData && tbData)){
          return res.status(200).json({ "response_code": 500, "message": resp[500], "response" : null });
        }
        let id = mongo.Types.ObjectId();
        image.original = 'http://app.geekstudios.tech/stayfit/uploads/'+req.temp_user._id+'/'+newName + '.' + ext;
        image.thumbnail = 'http://app.geekstudios.tech/stayfit/uploads/'+req.temp_user._id+'/'+newName + '-thumbnail.' + ext;
        image.is_profile = true;
        image.id = id;
        req.temp_user.profile_images = []
        req.temp_user.profile_images.push(image)
        user.updateOne({ _id: req.token.id }, { profile_images: req.temp_user.profile_images, profile_completion: req.temp_user.profile_completion })
          .then(data => {
            return res.status(200).json({ "response_code": 200, "message": resp["prof-img-upload-success"], "response" : { "profile_images": req.temp_user.profile_images } });
          })
          .catch(err => {
            console.log(err);
            return res.status(200).json({ "response_code": 500, "message": resp[500], "response" : null });
          })
      }
    } catch (err) {
      console.log(err);
      return res.status(200).json({ "response_code": 500, "message": resp[500], "response" : null });
    }
  })

});

router.get('/healthcheck', mongoHealthCheck, redisHealthCheck, async (req, res) => {

  return res.status(200).json({ "response_code": 200, "message": resp[200], "response" : { "database": req.mongodb, "database_code": req.code_mongodb, "cache_database": req.redis, "cache_database_code": req.code_redis, "version": "1.0", "hostname": os.hostname() } });
});

module.exports = router;