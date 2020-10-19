var express = require("express");
var router = express.Router();
var async = require("async");
//crypto is part of express no need to install is
var crypto = require("crypto");
var nodemailer = require("nodemailer");

const jwt = require('jsonwebtoken');
const JWT_KEY = "jwtactive987";
const JWT_RESET_KEY = "jwtreset987";
const bcryptjs = require('bcryptjs');

var Company = require("../models/company");
var  Seeker = require("../models/seeker");
var  Job = require("../models/job");
var User = require("../models/user");
var Posts =require("../models/posts");


var middleware = require("../middleware/index.js");
var passport   = require("passport");
var path= require("path");

router.get("/", function (req, res) {
    res.render("landing");
  });
  


router.get("/logout",function(req,res){
    req.logout();
    req.flash("success","Logged You Out");
    res.redirect("/");
  })


router.get("/login", function (req, res) {
    res.render("login");
  });


router.post("/login",passport.authenticate('local',{failureRedirect:'/login',failureFlash: 'Invalid username or password.'}),function(req,res){
    console.log(req.user);
    console.log(req.body);
 if(req.user.isVerified == true  && req.user.isFill == false){
    if(req.user.isCompany == true)
    {
            req.flash("success","Logged You In");
            req.flash("error","Fill Your  details first");
            res.redirect("/register/company");
    }
    else
    {
        req.flash("success","Logged You In");
        req.flash("error","Fill Your  details first");
        res.redirect("/register/seeker");
    }
}
else if(req.user.isVerified == true && req.user.isFill == true){
  if(req.user.isCompany == true)
  {
    req.flash("success","Logged You In");
        res.redirect("/company/show");
  }
  else
  {
    req.flash("success","Logged You In");
    res.redirect("/seeker/index");
  }
}
else{
  console.log("first fill your details and verify yourself");
   res.redirect("/register");
}
});


router.get("/register", function (req, res) {
res.render("register");
});

router.post("/register",function(req,res){
    User.findOne({email:req.body.email}).then(user=>{
        if(user)
        {
        console.log("this email id alreasy exist");
        req.flash("error","Email ID already registered");
        res.redirect("/register");
        }
        else{
            //email verification
            const token = jwt.sign({username:req.body.username,password:req.body.password,email:req.body.email,role:req.body.role}, JWT_KEY,{expiresIn: '60m'});
            const CLIENT_URL ='http://'+ req.headers.host;
            const output = `
                        <h2>Please click on below link to activate your account</h2>
                        <p>${CLIENT_URL}/activate/${token}</p>
                        <p><b>NOTE: </b> The above activation link expires in 60 minutes.</p>
                        `;
            const transporter = nodemailer.createTransport({
                        // host: 'mail.google.com',
                        host:'smtp.gmail.com',
                        port: 587,
                        secure :false,
                        auth: {
                            user :'jobportal2525@gmail.com',
                            pass :'shaifali2727'
                        },
                        tls: {
                            rejectUnauthorized :false
                        }
                        });
            const mailOptions = {
                        from :'"JobPortal" <jobportal916@gmail.com>',
                        to :req.body.email,
                        subject : 'Account Verification:',
                        text : '',
                        html :output
                        };
            transporter.sendMail(mailOptions, (error,info)=>{
                            if(error)
                            {
                                console.log(err);
                                req.flash('error',"something went wrong on our end.please register again");
                                res.redirect('/login');
                            }
                            else
                            {
                                console.log('Message sent: %s',info.messageId);
                                req.flash('success',"Activation link sent to registered email ID. Please activate to log in.");
                                res.redirect('/login');
                            }
                        });
            //email verification done
        }
    });
});

router.get("/activate/:token",function(req,res){
    const token = req.params.token;
    if(token){
        jwt.verify(token,JWT_KEY, function(err,decodedToken){
        if(err)
        {
            console.log(err);
            req.flash('error','Incorrect or expired link! Please register again.');
            res.redirect('/register');
        }
        else
        {
            User.findOne({email:decodedToken.email}).then(foundUser=>{
                if(foundUser){
                        //user already exists
                        req.flash('error','Email ID already registered! Please log in.');
                        res.redirect('/login');
                }
                else{
                        const newUser = new User({
                        username:decodedToken.username,
                        email:decodedToken.email,
                        role:decodedToken.role,
                        password:decodedToken.password
                        });
                        if(newUser.role == "company")
                            {
                                newUser.isCompany =true;
                            }
                        newUser.isVerified = true;
                        bcryptjs.genSalt(10, (err, salt) => {
                            bcryptjs.hash(newUser.password, salt, (err, hash) => {
                                if (err) throw err;
                                newUser.password = hash;
                                newUser.save().then(user => {
                                        req.flash('success','Account activated. You can now log in.');
                                        res.redirect('/login');
                                    }).catch(err => console.log(err));
                            });
                        });
                        //create kr denge company ko
                    }
            });
        }
        });
    }
    else
    {
       console.log("Account activation error");
       req.flash("error","INTERNAL SERVER ERROR");
    }
});

module.exports = router;