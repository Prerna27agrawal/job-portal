var express = require("express");
var router = express.Router();
var async = require("async");
const {check, validationResult} = require('express-validator');

//crypto is part of express no need to install is
var crypto = require("crypto");
var nodemailer = require("nodemailer");

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
router.use(express.static(__dirname+"/public"));



router.get('/forgot', function(req, res) {
    res.render('forgot');
  });


router.post('/forgot',[ check('email', 'Your email is not valid').not().isEmpty().isEmail().isLength({ min: 10, max: 30 }).normalizeEmail()
],function(req,res){
    const errors = validationResult(req);
    if(!errors.isEmpty())
    {
          var errorResponse = errors.array({ onlyFirstError: true });
          req.flash("error",errorResponse[0].msg);
          res.redirect("/register");
    }
    else{
    console.log(req.body.email);
    var email = req.body.email;
        User.findOne({email:email}).then(user=>{
            if(!user)
            {
                req.flash("error","This email is not registered");
                res.redirect("back");
            }
            else{
                const token = jwt.sign({ _id: user._id }, process.env.JWT_RESET_KEY, { expiresIn: '60m' });
                const CLIENT_URL = 'http://' + req.headers.host;
                const output = `
                <h2>Please click on below link to reset your account password</h2>
                <p>${CLIENT_URL}/forgot/${token}</p>
                <p><b>NOTE: </b> The activation link expires in 60 minutes.</p>
                `;
                 User.updateOne({resetLink: token},(err,success)=>{
                       if(err)
                       {
                           req.flash("error","Error resetting password");
                           res.redirect("back");
                       }
                       else{
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
                            from :'"WeHire"',
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
                                    res.redirect('/forgot');
                                }
                                else
                                {
                                    console.log('Message sent: %s',info.messageId);
                                    req.flash('success',"Password reset link sent to email ID. Please follow the instructions.");
                                    res.redirect('/login');
                                }
                            });


                       }
                 });
            }
              
        });
    }
})

router.get("/forgot/:token",function(req,res){
    const {token} = req.params;
    if(token)
    {
        jwt.verify(token, process.env.JWT_RESET_KEY, (err, decodedToken) => {
            if (err) {
                req.flash("error","Incorrect or expired link! Please try again.");
                res.redirect('/login');
            }
            else{
                 const{_id} = decodedToken;
                 User.findById(_id, (err, user) => {
                    if (err) {
                        req.flash("error",'User with email ID does not exist! Please try again.');
                        res.redirect('/login');
                    }
                    else {
                        res.redirect(`/reset/${_id}`)
                    }
                });
            }
        });
    }
    else{
        console.log("Password reset error");
        req.flash("error","Internal Server Error");
        res.redirect("/");
    }
});

router.get("/reset/:id",function(req,res){
   res.render("reset",{id:req.params.id});
});
router.post("/reset/:id",[
    check('password','Password in not matching the format').not().isEmpty().isLength({min:8}),
    check('confirm_password','Password Confirm is not in matching  format').not().isEmpty().isLength({min:8}),
    check('confirm_password', 'Passwords do not match').custom((value, {req}) => (value === req.body.password))
  ],function(req,res){
        const errors = validationResult(req);
        if(!errors.isEmpty())
        {
              var errorResponse = errors.array({ onlyFirstError: true });
              req.flash("error",errorResponse[0].msg);
              res.redirect("/register");
        }
        else{
    var password=req.body.password;
    var confirm_password = req.body.confirm;
    const id= req.params.id;
        bcryptjs.genSalt(10, (err, salt) => {
            bcryptjs.hash(password, salt, (err, hash) => {
                if (err) throw err;
                password = hash;
        
                User.findByIdAndUpdate({ _id: id },{ password },function (err, result) {
                 if (err) {
                            req.flash("error",'Error resetting password!');
                            res.redirect(`/reset/${id}`);
                        } else {
                            req.flash("success",'Password reset successfully!');
                            res.redirect('/login');
                        }
                    });
            });
        });
}
});




 
router.get("/contactus",function(req,res){
    res.render("contactus"); 
 });
 router.post("/contactus",function(req,res){
     var newfeedback = new FeedBack({
         FirstName:req.body.FirstName,
         LastName:req.body.LastName,
         email:req.body.email,
         message:req.body.message
     });
     FeedBack.create(newfeedback,function(err,newfeedback){
         if (err) {
             console.log(err);
             req.flash("error",err.message);
             res.redirect("back");
           }
           else{
               console.log(newfeedback);
               req.flash("success","Thanks! For Your time.");
               res.redirect("/aboutus");
           }
     });
     
 });
 
 router.get("/aboutus",function(req,res){
      FeedBack.find({isPosted:true}).exec(function(err,feedbacks){
         if (err) {
             console.log(err);
             req.flash("error", err.message);
             return res.redirect("back");
           }
           else{
             res.render("aboutus",{feedbacks:feedbacks});
           }
      });
 });


 module.exports = router;
