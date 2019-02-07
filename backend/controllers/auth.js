const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const User = require('../models/user');

exports.getUser = (req,res,next) => {
  User.findOne({_id: req.param.id})
    .then(user=>{
      if(!user){
        return res.status(401).json({
          success: false,
          message: 'Cannot find this user',
        });
      }
      res.status(200).json({
        success: true,
        user: user,
      })
    }).catch(error => {
      res.status(500);
    });
}

exports.createUser = (req,res,next) => {
  bcrypt.hash(req.body.password, 10)
    .then(hash => {
      const user = new User({
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email: req.body.email,
        password: hash,
      });
      user.save()
        .then(result => {
          res.status(201).json({
            message: "User created!",
            result: result,
          });
        }).catch(error => {
          res.status(500).json({
              message: "Email address already registered up!\ntry login"
          });
        });
    });
}


exports.userLogin = (req,res,next) => {
  User.findOne({email: req.body.email})
    .then(user => {
      if(!user){
        return res.status(401).json({
          success: false,
          message: 'Email doesn\'t exist!',
        });
      }
      bcrypt.compare(req.body.password, user.password)
        .then(result => {
          if(!result){
            return res.status(401).json({
              success: false,
              message: "Incorrect password!",
            });
          }
          const token = jwt.sign(
            {email: user.email, userId: user._id},
            process.env.JWT_KEY,
            {expiresIn: process.env.SESSION_EXPIRE},
          );
          res.status(200).json({
            message: `Welcome ${user.firstName}!`,
            success: true,
            token: token,
            expiresIn: process.env.SESSION_EXPIRE,
            userId: user._id,
            fname: user.firstName,
            lname: user.lastName,
          });
        })
    }).catch(error => {
      res.status(401).json({
        success: false,
        message: 'Login failed!',
      });
    });
}
