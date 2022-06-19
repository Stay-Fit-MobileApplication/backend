const express = require('express');
const router = express.Router();
const mongoose = require('../../services/mongo_db');
const request = require('../../models/challenge_request');
const axios = require('axios');

// Validator middleware
const { idValidator, idCountValidator } = require("./middlewares/validator");

// Database connectivity validator middleware
const { mongoDBping } = require("./middlewares/mongodb");

// User middleware
const { validateUserByID, validateOtherUserByID } = require("./middlewares/user");

// Connect request middleware
const { isRejectableChecker, isAcceptableChecker } = require("./middlewares/connect_request_validator");

// Token middleware
const { verifyAccessToken } = require("./middlewares/token");

// Response
const { resp } = require("./data/response");
const user = require('../../models/user');

//Routes
router.post('/sent/', idValidator, verifyAccessToken, mongoDBping, validateUserByID, validateOtherUserByID, async (req, res) => {

  var new_request = new request({
    requester: req.temp_user._id,
    receiver: req.other_user._id
  })

  new_request.save()
    .then(data => {
      const send_data = {
        id: req.other_user._id.toString(),
        title: 'AI Challenge request ⚔️',
        body: 'Hi ' + req.other_user.name + ', you have received a AI challenge request from ⚔️ ' + req.temp_user.name + '.',
        type: 'challenge',
        request_id: data._id.toString()
      }
      axios.post('http://app.geekstudios.tech/contact/v1/push', send_data)
        .then((response) => {
          return res.status(200).json({ "response_code": 200, "message": "Challenge request sent.", "response": { data } });
        })
        .catch((error) => {
          console.log(error)
          return res.status(200).json({ "response_code": 200, "message": "Challenge request sent.", "response": { data } });
        })
    })
    .catch(err => {
      console.log(err);
      return res.status(200).json({ "response_code": 500, "message": resp[500], "response": null });
    })

});

// router.post('/reject/', idValidator, verifyAccessToken, mongoDBping, validateUserByID, validateOtherUserByID, isRejectableChecker, async (req, res) => {

//   req.temp_request.status = 'rejected'
//   req.temp_request.rejected_date = new Date()

//   req.temp_request.save()
//     .then(data => {
//       return res.status(200).json({ "response_code": 200, "message": resp["connect-req-rejected"], "response": { data } });
//     })
//     .catch(err => {
//       console.log(err);
//       return res.status(200).json({ "response_code": 500, "message": resp[500], "response": null });
//     })

// });

router.post('/accept/', idValidator, verifyAccessToken, mongoDBping, validateUserByID, async (req, res) => {

  request.findById(req.body.id)
    .then(data => {
      data.status = 'accepted'
      data.save()
        .then(data => {
          const send_data = {
            id: data.requester.toString(),
            title: 'AI Challenge request accepted ✅',
            body: 'Hi ' + req.temp_user.name + ', your AI challenge request has been accepted.'
          }
          axios.post('http://app.geekstudios.tech/contact/v1/push', send_data)
            .then((response) => {
              return res.status(200).json({ "response_code": 200, "message": "Challenge request accepted.", "response": { data } });
            })
            .catch((error) => {
              console.log(error)
              return res.status(200).json({ "response_code": 200, "message": "Challenge request accepted.", "response": { data } });
            })
        })
        .catch(err => {
          console.log(err)
          return res.status(200).json({ "response_code": 500, "message": resp[500], "response": null });
        })
    })
    .catch(err => {
      console.log(err)
      return res.status(200).json({ "response_code": 500, "message": resp[500], "response": null });
    })

});

router.post('/update/', idCountValidator, verifyAccessToken, mongoDBping, validateUserByID, async (req, res) => {

  request.findById(req.body.id)
    .then(data => {
      if (data.requester == req.temp_user._id) {
        data.requester_score = req.body.count
      } else if (data.receiver == req.temp_user._id) {
        data.receiver_score = req.body.count
      }
      data.save()
        .then(data => {
          if (data.requester == req.temp_user._id) {
            if (data.receiver_score) {
              if (data.requester_score > data.receiver_score) {
                const send_data = {
                  id: data.requester.toString(),
                  title: 'Victory 🏆',
                  body: 'You have won the challenge 🥳.'
                }
                axios.post('http://app.geekstudios.tech/contact/v1/push', send_data)
                  .then((response) => {
                  })
                  .catch((error) => {
                    console.log(error)
                    return res.status(200).json({ "response_code": 210, "message": "You have won the challenge.", "response": { data } });
                  })
                const new_send_data = {
                  id: data.receiver.toString(),
                  title: 'Lost 😔',
                  body: 'Keep trying, you can do it.'
                }
                axios.post('http://app.geekstudios.tech/contact/v1/push', new_send_data)
                  .then((response) => {
                  })
                  .catch((error) => {
                    console.log(error)
                    return res.status(200).json({ "response_code": 210, "message": "You have won the challenge.", "response": { data } });
                  })
                return res.status(200).json({ "response_code": 210, "message": "You have won the challenge.", "response": { data } });
              } else {
                const send_data = {
                  id: data.receiver.toString(),
                  title: 'Victory 🏆',
                  body: 'You have won the challenge 🥳.'
                }
                axios.post('http://app.geekstudios.tech/contact/v1/push', send_data)
                  .then((response) => {
                  })
                  .catch((error) => {
                    console.log(error)
                    return res.status(200).json({ "response_code": 209, "message": "You have lost the challenge.", "response": { data } });
                  })
                const new_send_data = {
                  id: data.requester.toString(),
                  title: 'Lost 😔',
                  body: 'Keep trying, you can do it.'
                }
                axios.post('http://app.geekstudios.tech/contact/v1/push', new_send_data)
                  .then((response) => {
                  })
                  .catch((error) => {
                    console.log(error)
                    return res.status(200).json({ "response_code": 209, "message": "You have lost the challenge.", "response": { data } });
                  })
                return res.status(200).json({ "response_code": 209, "message": "You have lost the challenge.", "response": { data } });
              }
            } else {
              return res.status(200).json({ "response_code": 202, "message": "Waiting for the other user to finish the challenge.", "response": null });
            }
          } else if (data.receiver == req.temp_user._id) {
            if (data.requester_score) {
              if (data.receiver_score > data.requester_score) {
                const send_data = {
                  id: data.receiver.toString(),
                  title: 'Victory 🏆',
                  body: 'You have won the challenge 🥳.'
                }
                axios.post('http://app.geekstudios.tech/contact/v1/push', send_data)
                  .then((response) => {
                  })
                  .catch((error) => {
                    console.log(error)
                    return res.status(200).json({ "response_code": 210, "message": "You have won the challenge.", "response": { data } });
                  })
                const new_send_data = {
                  id: data.requester.toString(),
                  title: 'Lost 😔',
                  body: 'Keep trying, you can do it.'
                }
                axios.post('http://app.geekstudios.tech/contact/v1/push', new_send_data)
                  .then((response) => {
                  })
                  .catch((error) => {
                    console.log(error)
                    return res.status(200).json({ "response_code": 210, "message": "You have won the challenge.", "response": { data } });
                  })
                return res.status(200).json({ "response_code": 210, "message": "You have won the challenge.", "response": { data } });
              } else {
                const send_data = {
                  id: data.requester.toString(),
                  title: 'Victory 🏆',
                  body: 'You have won the challenge 🥳.'
                }
                axios.post('http://app.geekstudios.tech/contact/v1/push', send_data)
                  .then((response) => {
                  })
                  .catch((error) => {
                    console.log(error)
                    return res.status(200).json({ "response_code": 209, "message": "You have lost the challenge.", "response": { data } });
                  })
                const new_send_data = {
                  id: data.receiver.toString(),
                  title: 'Lost 😔',
                  body: 'Keep trying, you can do it.'
                }
                axios.post('http://app.geekstudios.tech/contact/v1/push', new_send_data)
                  .then((response) => {
                  })
                  .catch((error) => {
                    console.log(error)
                    return res.status(200).json({ "response_code": 209, "message": "You have lost the challenge.", "response": { data } });
                  })
                return res.status(200).json({ "response_code": 209, "message": "You have lost the challenge.", "response": { data } });
              }
            } else {
              return res.status(200).json({ "response_code": 202, "message": "Waiting for the other user to finish the challenge.", "response": null });
            }
          }
        })
        .catch(err => {
          console.log(err)
          return res.status(200).json({ "response_code": 500, "message": resp[500], "response": null });
        })
    })
    .catch(err => {
      console.log(err)
      return res.status(200).json({ "response_code": 500, "message": resp[500], "response": null });
    })

});

module.exports = router;