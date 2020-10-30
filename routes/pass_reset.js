var express = require("express");
var router = express.Router();
var async = require("async");
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
var Quiz1 = require("../models/quiz1");
var FeedBack =require("../models/feedback");
var Submission = require("../models/submission");


var middleware = require("../middleware/index.js");
var passport   = require("passport");
var path= require("path");
const { emitKeypressEvents } = require("readline");




router.get('/forgot', function(req, res) {
    res.render('forgot');
  });

router.post('/forgot',function(req,res){
    console.log(req.body.email);
    var email = req.body.email;
    if(!email)
    {
        req.flash("error","Please enter the email!");
        res.redirect("back");
    }
    else{
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
                            from :'"JobPortal"',
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
router.post("/reset/:id",function(req,res){
    var password=req.body.password;
    var confirm_password = req.body.confirm;
    const id= req.params.id;
    if(!password || !confirm_password)
    {
        req.flash("error","Please fill all details");
        res.redirect("back");
    }
    else if(password != confirm_password){
        req.flash("error","Passwords does not match");
        res.redirect("back");
    }
    else{
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
