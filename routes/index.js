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


var middleware = require("../middleware/index.js");
var passport   = require("passport");
var path= require("path");
const { emitKeypressEvents } = require("readline");

router.get("/", function (req, res) {
    res.render("landing");
  });
  
router.get("/contactus",function(req,res){
   res.render("contactus"); 
});
router.post("/contactus",middleware.isLoggedIn,function(req,res){
    var newfeedback = new FeedBack({
        FirstName:req.body.FirstName,
        LastName:req.body.LastName,
        email:req.body.email,
        message:req.body.message
    });
    newfeedback.postedBy ={
        id: req.user._id
    }
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
})

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
   //console.log(req.body);
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
   res.redirect("/register");
}
});


router.get("/register", function (req, res) {
res.render("register");
});

router.post("/register",function(req,res){
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
                            from :'"JobPortal" ',//<jobportal916@gmail.com>',
                            to :req.body.email,
                            subject : 'Account Verification:',
                            text : '',
                            html :output
                            };
                transporter.sendMail(mailOptions, (error,info)=>{
                                if(error)
                                {
                                    console.log(error);
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