const express = require('express')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const User = require('../models/User')
const {validateSignup,validateLogin} = require('../config/joi')




exports.getIndex =  async (req,res) => {
  await res.render('index');
  req.app.locals.msg = "";
  
};

exports.postSignup = async(req,res) => {
  // Validate inputs server-side
  const {error} = validateSignup(req.body);
  if  (error) {
    req.app.locals.msg = error.details[0].message;
    res.status(400);
    return res.redirect('/');
  }

  //Hash the password
  const salt = await bcrypt.genSalt(12);
  const hashedPassword = await bcrypt.hashSync(req.body.password,salt);
  
  // Create a new user
  const newUser = new User({
    username:req.body.username,
    email:req.body.email,
    password:hashedPassword
  });
  newUser.save()
  .then(()=> {
    req.app.locals.msg = "User Created";
    return res.redirect('/');
  })
  .catch(err=>res.status(400).json({err}));
}; // end route

exports.postLogin = async (req,res)=> {
  if(req.body.submit === "1") {
    const {error} = validateLogin(req.body);
    if(error) {
      req.app.locals.msg = error.details[0].message;
      res.status(400);
      return res.redirect('/');
    };
    const user = await User.findOne({email:req.body.email},{},{runValidators: true, context: 'query'}) // for mongoose unique validator
  
      if(!user) {
        req.app.locals.msg = "Email not found";
        return res.status(400).redirect('/');
      }
    const validPass = await bcrypt.compare(req.body.password,user.password);
    if(!validPass) {
      req.app.locals.msg = "Password not matching";
      return res.status(400).redirect('/')
    };
    const token = jwt.sign({_id:user._id},process.env.TOKEN_SECRET);
    res.cookie('id',token);
    //res.header('Authorization',token);
    req.app.locals.msg = "Signed In";
    req.app.locals.isLoggedIn = true;
    res.redirect('/');
  }
  if(req.body.submit==="0") {
    if(req.cookies.id) {
      req.app.locals.isLoggedIn = false;
      res.clearCookie('id');
      req.app.locals.msg = "signed out";
      res.redirect('/');
    } else {
      req.app.locals.msg = "not signed in";
      res.redirect('/');
    }
  }
}; // end route

// Admin Routes

exports.getAdmin = (req,res)=> {
  res.render('admin');
  req.app.locals.msg = "";
  req.app.locals.userInfo = null;
};// end route

exports.getadminRead = (req,res) => {
  try {
    const {_id} = jwt.verify(req.cookies.id,process.env.TOKEN_SECRET);
    User.findOne({_id:_id},{},{runValidators: true, context: 'query'})
    .then(verifiedUser=> {
      if(!verifiedUser) {
        req.app.locals.msg = "Access Denied";
        res.status(403);
        res.redirect("/admin");
      } else {
        console.log(req.query.email);
        User.findOne({email:req.query.email},{},{runValidators: true, context: 'query'})
        .then(user => {
          console.log("USER "+user);
          if(!user) {
            req.app.locals.msg = "No user found";
            res.status(400);
            res.redirect("/admin");
          } else {
            req.app.locals.userInfo = user;
            res.status(200).redirect('/admin');
          }
        })
      }
  })
  }
  catch {
    req.app.locals.msg = "Access Denied";
    res.status(401);
    res.redirect("/admin");
  }

};// end route

exports.putadminUpdate = (req,res) => {
  try {
    const {_id} = jwt.verify(req.cookies.id,process.env.TOKEN_SECRET);
    User.findOne({_id:_id},{},{runValidators: true, context: 'query'})
    .then(verifiedUser=> {
      if(!verifiedUser) {
        req.app.locals.msg = "Access Denied";
        res.status(403);
        res.redirect("/admin");
      } else {
        User.findOne({email:req.body.email},{},{runValidators:true,context:'query'})
        .then(user => {
          if(!user) {
            req.app.locals.msg="No user found";
            res.status(400).redirect('/admin');
          } else {
            if(req.body.password ==="" && req.body.password==="") {
              req.app.locals.msg = "Please fill out field(s)"
              res.status(400);
              return res.redirect('/admin')
            }
            else {
              if(req.body.username !=="") {
                user.username = req.body.username;
              }
               if(req.body.password !=="") {
                user.password = req.body.password;
              }
              user.save();
              req.app.locals.msg="User Updated";
              res.status(200).redirect('/admin')
            } 
          }
        });
      }
    });
  }
  catch {
    req.app.locals.msg = "Access Denied";
    res.status(401);
    res.redirect("/admin");
  }
};// end route

exports.deleteadminDelete = (req,res) => {
  try {
    const {_id} = jwt.verify(req.cookies.id,process.env.TOKEN_SECRET);
      User.findOne({_id:_id},{},{runValidators: true, context: 'query'})
      .then(user => {
        if(!user) {
          req.app.locals.msg = "Access Denied";
          res.status(403);
          res.redirect("/admin");
        } else {
          User.deleteOne({email:req.body.email})
          .then(deletionInfo=> {
            if(deletionInfo.deletedCount > 0) {
              req.app.locals.msg = "Document deleted";
              res.redirect('/admin');
            } else {
              req.app.locals.msg = "No Document found";
              res.status(400);
              res.redirect('/admin');
            }
          });
        }
      });// end then
  }
  catch {
    req.app.locals.msg = "Access Denied";
    res.status(401);
    res.redirect("/admin");
  }
  
};// end route