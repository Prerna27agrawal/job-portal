//routes setting
//email unique kaise hai
var express = require("express");
var router = express.Router();
var Company = require("../models/company");
var  Seeker = require("../models/seeker");
var  Job = require("../models/job");
var User = require("../models/user");
var Posts =require("../models/posts");
var FeedBack =require("../models/feedback");

var Quiz = require("../models/quiz");
var Question = require("../models/question");
var Submission = require("../models/submission");
var middleware = require("../middleware/index.js");
const { runInContext, isContext } = require("vm");
var path= require("path");
const { networkInterfaces } = require("os");
const { mapLimit } = require("async");
var async = require("async");
//crypto is part of express no need to install is
var crypto = require("crypto");
var nodemailer = require("nodemailer");
router.use(express.static(__dirname+"/public"));

router.get("/admin/index",middleware.checkAdminOwnership,function(req,res){
    // Quiz.find({}).exec(function(err,quiz){
    res.render("admin/index",{admin:req.user}); 
// });

});

router.get("/admin/companies/:page",middleware.checkAdminOwnership,function(req,res){
    var perPage = 3;
    var page =req.params.page || 1
       Company.find({}).populate('posts').populate('subscribedBy').skip((perPage * page)-perPage).limit(perPage).exec(function(err,companies){
        Company.count().exec(function(err,count){
        if (err) {
            console.log(err);
            req.flash("error",err.message);
            return res.redirect("back"); 
        }    
        res.render("admin/companyshow",{companies:companies,current: page,pages: Math.ceil(count/perPage)});
       });
    });
});

router.get("/admin/seekers/:page",middleware.checkAdminOwnership,function(req,res){
    var perPage = 3;
    var page =req.params.page || 1
    Seeker.find({}).skip((perPage * page)-perPage).limit(perPage).exec(function(err,seekers){
        Seeker.count().exec(function(err,count){
        if (err) {
            console.log(err);
            req.flash("error",err.message);
            return res.redirect("back"); 
        } 
        res.render("admin/seekershow",{seekers:seekers,current: page,pages: Math.ceil(count/perPage)});
     });
    });
});

router.get("/admin/jobs/:page",middleware.checkAdminOwnership,function(req,res){
    var perPage = 3;
    var page =req.params.page || 1  
    Job.find({}).populate('appliedBy').skip((perPage * page)-perPage).limit(perPage).exec(function(err,jobs){
        Job.count().exec(function(err,count){
        if (err) {
            console.log(err);
            req.flash("error",err.message);
            return res.redirect("back"); 
        } 
        res.render("admin/jobshow",{jobs:jobs,current: page,pages: Math.ceil(count/perPage)});
       });
    });
});

router.get("/admin/feedback/:page",middleware.checkAdminOwnership,function(req,res){
    var perPage = 3;
    var page =req.params.page || 1  
    FeedBack.find({}).skip((perPage * page)-perPage).limit(perPage).exec(function(err,feedbacks){
        FeedBack.count().exec(function(err,count){
        if (err) {
            console.log(err);
            req.flash("error",err.message);
            return res.redirect("back"); 
        } 
        else{
            res.render("admin/feedback",{feedbacks:feedbacks,current: page,pages: Math.ceil(count/perPage)});
        }
    });
});          
});

router.post("/feedback/:id/aboutus",middleware.checkAdminOwnership,function(req,res){
   FeedBack.findById(req.params.id,function(err,foundfeedback){
    if (err) {
        console.log(err);
        req.flash("error",err.message);
        return res.redirect("back"); 
    } 
    else{
        foundfeedback.isPosted = true;
        foundfeedback.save();
        // FeedBack.find({isPosted:true}).exec(function(err,feedbacks){
            if (err) {
                console.log(err);
                req.flash("error",err.message);
                return res.redirect("back"); 
            } 
            else{
                req.flash("success","Posted On About Us Page!");
                res.redirect("back");
            }
        // });
    }
   }); 
});

router.delete("/feedback/delete/:id",middleware.checkAdminOwnership,function(req,res){
    FeedBack.findById(req.params.id,function(err,feedback){
        if (err) {
            console.log(err);
            req.flash("error", err.message);
            return res.redirect("back");
          }
          else{
              feedback.remove();
              console.log("removed feedback");
              req.flash("Success","Feedback removed");
              res.redirect("/admin/feedback/1");
          }
    });
});

router.post("/feedback/sendmail",function(req,res){
          const output =`<p> ${req.body.content} <p>
      <p>NOTE: You are receiving this mail because you are submitted feedback </p>
      `;
      var email= req.body.email;
      var subject = req.body.subject;
      let transporter = nodemailer.createTransport({
        // host: 'mail.google.com',
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        //service: 'Gmail',
        auth: {
          user :process.env.PORTAL_MAIL_ID,
          pass :process.env.PORTAL_MAIL_PASSWORD
        },
        tls: {
          rejectUnauthorized: false
        }
      });
      let mailOptions = {
        from: '"WeHire"',
        to: email,
        subject: subject,
        text: '',
        html: output
      };
      transporter.sendMail(mailOptions, (error,info)=>{
        if(error)
        {
            console.log(err);
            req.flash('error',"something went wrong on our end");
            res.redirect('back');
        }
        else
        {
            console.log('Message sent: %s',info.messageId);
            req.flash('success',"Mail has been sent to the user!");
            res.redirect('/admin/feedback/1');
        }
    });

});
module.exports = router;
