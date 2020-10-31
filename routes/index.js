var express = require("express");
var router = express.Router();
var async = require("async");
//crypto is part of express no need to install is
var crypto = require("crypto");
var nodemailer = require("nodemailer");
const {check, validationResult} = require('express-validator');


const jwt = require('jsonwebtoken');
const bcryptjs = require('bcryptjs');

var Company = require("../models/company");
var  Seeker = require("../models/seeker");
var  Job = require("../models/job");
var User = require("../models/user");
var Posts =require("../models/posts");
var Quiz = require("../models/quiz");
var Question = require("../models/question");
var Submission = require("../models/submission");
var FeedBack =require("../models/feedback");


var middleware = require("../middleware/index.js");
var passport   = require("passport");
var path= require("path");
const { emitKeypressEvents } = require("readline");
const { log } = require("console");

router.get("/", function (req, res) {
    res.render("landing");
  });
 


router.get("/logout",function(req,res){
    req.logout();
    req.flash("success","Logged You Out");
    res.redirect("/");
  })



router.get("/login", function (req, res) {
    res.render("login",{log:false});
  });


router.post("/login",[
    check('username','Username is required').not().isEmpty(),
    check('password').not().isEmpty().withMessage('Password Is required').isLength({min:8}).withMessage('Length should be atleast 8').matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]){8,}/).withMessage('Password should contain atleast one number,one uppercase and lowercase letter, and should be atleast 8 characters long'),
   // check('password','Password in not matching the format').not().isEmpty().isLength({min:8})
  ],passport.authenticate('local',{failureRedirect:'/login',failureFlash: 'Invalid username or password.'}),function(req,res){
    const errors = validationResult(req);
    if(!errors.isEmpty())
    {
          var errorResponse = errors.array({ onlyFirstError: true });
          req.flash("error",errorResponse[0].msg);
          res.redirect("/register");
    }else{
    console.log("Current user");
    console.log(req.user);
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
  else if(req.user.isAdmin == true)
  {
    req.flash("success","You are the admin");
    res.redirect("/admin/index");
  }
  else 
  {
    req.flash("success","Logged You In");
    res.redirect("/seeker/index");
  }
}
else{
  console.log("first fill your details and verify yourself");
   res.redirect("/login");
}
    }
});


router.get("/register", function (req, res) {
res.render("login",{log:true});
});

router.post("/register",[
    check('username','Username is required').not().isEmpty(),
    check('password').not().isEmpty().withMessage('Password Is required').isLength({min:8}).withMessage('Length should be atleast 8').matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]){8,}/).withMessage('Password should contain atleast one number,one uppercase and lowercase letter, and should be atleast 8 characters long'),
    check('confirm_password').not().isEmpty().withMessage('Confirm Password Is required').isLength({min:8}).withMessage('Length should be atleast 8').matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]){8,}/).withMessage('Password should contain atleast one number,one uppercase and lowercase letter, and should be atleast 8 characters long'),      
   // check('confirm_password','Password Confirm is not in matching  format').not().isEmpty().isLength({min:8}),
    check('email', 'Your email is not valid').not().isEmpty().isEmail().isLength({ min: 10, max: 30 }).normalizeEmail(),
    check('confirm_password', 'Passwords do not match').custom((value, {req}) => (value === req.body.password))
  ],(req,res)=>{
    const errors = validationResult(req);
    if(!errors.isEmpty())
    {
          var errorResponse = errors.array({ onlyFirstError: true });
          req.flash("error",errorResponse[0].msg);
          res.redirect("/register");
    }
    else{
    if(req.body.role == 'Admin')
    {
        if(req.body.adminCode == process.env.ADMIN_CODE)
        {
            User.findOne({email:req.body.email}).then(user=>{
                if(user)
                {
                console.log("this email id alreasy exist");
                req.flash("error","Email ID already registered");
                res.redirect("/register");
                }
                else{
                    //email verification
                    const token = jwt.sign({username:req.body.username,password:req.body.password,email:req.body.email,role:req.body.role,adminCode:req.body.adminCode},process.env.JWT_KEY,{expiresIn: '60m'});
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
                                    user :process.env.PORTAL_MAIL_ID,
                                    pass :process.env.PORTAL_MAIL_PASSWORD
                                },
                                tls: {
                                    rejectUnauthorized :false
                                }
                                });
                    const mailOptions = {
                                from :'"JobPortal"',
                                to :req.body.email,
                                subject : 'Account Verification:',
                                text : '',
                                html :output
                                };
                    transporter.sendMail(mailOptions, (error,info)=>{
                                    if(error)
                                    {
                                        console.log(error);
                                        req.flash('error',"Something went wrong on our end. Please register again");
                                        res.redirect('/register');
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
        }
            else{
            console.log("fake admin attempt");
            req.flash("error","Sorry!You are not  the admin and do not have permission to do so");
            res.redirect("/register");
            }
    }
    else{   
        User.findOne({email:req.body.email}).then(user=>{
            if(user)
            {
            console.log("this email id alreasy exist");
            req.flash("error","Email ID already registered");
            res.redirect("/register");
            }
            else{
                //email verification
                const token = jwt.sign({username:req.body.username,password:req.body.password,email:req.body.email,role:req.body.role,adminCode:req.body.adminCode}, process.env.JWT_KEY,{expiresIn: '60m'});
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
                                user :process.env.PORTAL_MAIL_ID,
                                pass :process.env.PORTAL_MAIL_PASSWORD
                            },
                            tls: {
                                rejectUnauthorized :false
                            }
                            });
                const mailOptions = {
                            from :'"WeHire" ',//<jobportal916@gmail.com>',
                            to :req.body.email,
                            subject : 'Account Verification:',
                            text : '',
                            html :output
                            };
                transporter.sendMail(mailOptions, (error,info)=>{
                                if(error)
                                {
                                    console.log(error);
                                    req.flash('error',"Something went wrong on our end.please register again");
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
    }
}
    
});

router.get("/activate/:token",function(req,res){
    const token = req.params.token;
    if(token){
        jwt.verify(token,process.env.JWT_KEY, function(err,decodedToken){
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
                        password:decodedToken.password,
                        adminCode:decodedToken.adminCode
                        });
                        if(newUser.role == "company")
                            {
                                newUser.isCompany =true;
                            }
                        newUser.isVerified = true;
                        if(newUser.adminCode == process.env.ADMIN_CODE && newUser.role=="Admin"){
                            newUser.isAdmin = true;
                            newUser.isFill = true;
                        }
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