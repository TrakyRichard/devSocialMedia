const express = require("express");
const router = express.Router();

const gravatar = require('gravatar');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// load user model
const User = require("../../models/User");
const keys = require("../../config/keys");
const passport = require('passport');

// Load input validation

const registerInputValidation = require('../../validations/registration');
const loginInputValidation = require('../../validations/login');

// @route GET api/users/test
// @description Text User route
// @access Public

router.get("/test", (req, res, next) => {
  res.status(200).json({
    msg: "users works"
  })
});

// @route GET api/users/register
// @description Register a new user
// @access Public

router.post("/register", (req, res, next) => {

    const { errors, isValid } = registerInputValidation(req.body);
    // Check first line validation
    if(!isValid) {
      return res.status(400).json(errors);
    }
    User.findOne({email: req.body.email}).then((user) => {
      if(user){
        erros.email = "Email already exist"
        return res.status(400).json(errors.email)
      }
      else {

        const avatar = gravatar.url(req.body.email, {
          s: "200", // size,
          r: "pg", // Rating
          d: 'mm' // default

        })
        const newUser = new User({
          name: req.body.name,
          email: req.body.email,
          avatar,
          password: req.body.password
        });

        bcrypt.genSalt(10,  (err, salt)=>{
          if(err) throw err;
          bcrypt.hash(newUser.password, salt, (err, hash) =>{
            if(err) throw err;
            newUser.password = hash;
            newUser.save().then((user) => {
              res.status(200).json(user);
            }).catch(err => next(err))
          })
        })
      }
    })
})

// @route GET api/users/login
// @description login user / return Tokenr
// @access Public

router.post("/login", (req, res, next) => {

  const { errors, isValid } = loginInputValidation (req.body);
  // Check first line validation
  if(!isValid) {
    return res.status(400).json(errors);
  }

  const email = req.body.email;
  const password = req.body.password;

  User.findOne({email}).exec().then(user => {
    if(!user) {
      errors.email = 'User not found';
      return res.status(404).json({
        message: errors
      })
    }

    // check Password
    bcrypt.compare(password, user.password).then(isMatch => {
      if(isMatch) {
        // res.status(200).json({
        //   message: "User passed"
        // });
         //User Matched
          const payload = {id: user.id, name: user.name, avatar: user.avatar} // create JWT payload
        //sign Token
        jwt.sign(payload, keys.secretOrKey, {expiresIn: 3600}, (err, token)=>{
          if(err) {
            return res.status(400).json({
              message: err
            })
          }
            res.status(200).json({
              success: true,
              token: 'Bearer ' + token
            })
        });

      } else {
        errors.password = "Error Password Incorrect";
        return res.status(400).json({
          message: errors
        })
      }
    })
  }).catch(err => next(err))
})

// @route GET api/users/current
// @description Return currentUser
// @access Private
router.get('/current', passport.authenticate('jwt', {session: false}), (req, res, next)=> {
  res.status(200).json({
    message: "Success",
    response: {
      id: req.user.id,
      name: req.user.name,
      email: req.user.email
    }
  })
})

module.exports = router;