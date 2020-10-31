 var express = require("express");
var router = express.Router();
const {check, validationResult} = require('express-validator');


var Company = require("../models/company");
var Seeker = require("../models/seeker");
var Job = require("../models/job");
var Job2 = require("../models/job");
var User = require("../models/user");
var Posts = require("../models/posts");
var Quiz = require("../models/quiz");
var Question = require("../models/question");
var Submission = require("../models/submission");
var FeedBack =require("../models/feedback");



var middleware = require("../middleware/index.js");
const company = require("../models/company");
// const { route } = require("./company");
//const job = require("../models/job");

var nodemailer = require("nodemailer");
const { use } = require("passport");
//const { response } = require("express");


var path= require("path");
router.use(express.static(__dirname+"./public/"));

//jb company login kre toh usko job create karkee id mil jae company ki
router.get("/company/createjob", middleware.checkCompanyOwnership, function (req, res) {
  res.render("company/createjob");
});

//after creating job post
router.post("/login/company/createjob", middleware.checkCompanyOwnership, function (req, res) {
  req.body.job.postedBy = {
    id: req.user._id,
    username: req.user.username
  }
  Job2.create(req.body.job, function (err, job) {
    if (err) {
      console.log(err);
      req.flash("error", err.message);
      return res.redirect("back");
    }
    else {
      req.flash("success", "Successfully Created New Job");
      Company.findOne().where('createdBy.id').equals(req.user._id).populate('subscribedBy').exec(function (err, company) {
        var users = [];
        // console.log(company);
        company.subscribedBy.forEach(function (eachuser) {
          users.push(eachuser.email);
        });
        //email for notification of new job
        if (users.length > 0) {
          const output = `
      <p>Greetings from WeHire,</p>
      <p> ${company.name} is hiring ${job.name} for the following job profile</p>
      <h3>Job details</h3>
      <ul>
      <li><b>Role</b>: ${job.name} </li>
      <li><b>Location</b>: ${job.location} </li>
      <li><b>Experience</b>: ${job.experience}+ years of experience </li>
      <li><b>Description</b>: ${job.description} </li>
      </ul>
      <p>
      All the best!!
      </p>
      <p>NOTE: You are receiving this mail because you are subscribed to this company </p>
      `;
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
            to: users,
            subject: 'New Job Opening !!',
            text: '',
            html: output
          };
          transporter.sendMail(mailOptions, (error, info) => {
            if (err) {
              console.log(err);
              req.flash("error", err.message);
              return res.redirect("back");
            }
            console.log('Message sent: %s', info.messageId);
            //console.log('Preview Url : %s', nodemailer.getTestMessageUrl(info));
            //res.redirect('/company/' + job.postedBy.id + '/viewjob');
          });

        }
        req.flash('success', "Notification sent to all the Subscribed Users");
        res.redirect('/company/' + job.postedBy.id + '/viewjob/1');

      });
    }
  });
});


router.get("/seeker/:seeker_id/appliedJobs", middleware.checkSeekerOwnership, function (req, res) {
  Job.find({}).exec(function (err, alljobs) {
    company.find({}).exec(function (err, allcompanies) {
      if (err) {
        console.log(err);
        req.flash("error", err.message);
        return res.redirect("back");
      }
      else {
        // console.log(alljobs);
        res.render("seeker/appliedJobs", { jobs: alljobs, companies: allcompanies });
      }
    });
  });
});



router.delete("/company/jobdelete/:id", middleware.checkCompanyOwnership, function (req, res) {
  Job.findById(req.params.id, function (err, job) {
    if (err) {
      console.log(err);
      req.flash("error", err.message);
      return res.redirect("back");
    }
    job.remove();
    console.log("removed the job");
    req.flash('success', "Job removed");
    res.redirect("/company/" + req.user._id + "/viewjob/1");
  });
});


//for applied by seekrs view
//id of job
router.get("/company/:id/show/jobstats", middleware.checkCompanyOwnership,
  function (req, res) {
    // var perPage = 3;
    // var page =req.params.page || 1
    Job.findById(req.params.id).populate('postedBy').populate("appliedBy.postedBy").exec(function (err, foundJob) {
      Seeker.find({}).exec(function (err, seekers) {
       Seeker.count().exec(function(err,count){
        if (err) {
          console.log(err);
          req.flash("error", err.message);
          return res.redirect("back");
        }
        else {
          res.render("company/seekerview", { job: foundJob, seekers: seekers });
        }
      });
    });
  });
  });

router.post("/company/:id/show/jobstats/search",middleware.checkCompanyOwnership,
function(req,res){
 // var filteryear=req.body.filteryear;
  var filtercgpa=req.body.filtercgpa;
  var filterdegree1 = req.body.filterdegree;
  var filterdegree= filterdegree1.toUpperCase();
  var filterstatus1 = req.body.filterstatus;
  var filterstatus= filterstatus1.toUpperCase();

  var lesser;
  var greater;
  if(filtercgpa != '')
  {
    console.log("hi");
    console.log(filtercgpa);
    //greater then equal to
    //less than
      
       if(filtercgpa == '0.0')
       {
           lesser=10;
           greater=0;
       }
       else if(filtercgpa == '9.0'){
        lesser=10;
        greater=9;
       }
       else if(filtercgpa == '8.5')
       {
           lesser=10;
           greater=8.5;
       }
       else if(filtercgpa == '8.0'){
        lesser=10;
        greater=8;
       }
       else if(filtercgpa == '7.5'){
        lesser=10;
        greater=7.5;
       }
       else if(filtercgpa == '7.0'){
        lesser=10;
        greater=7;
       }
       else if(filtercgpa == '6.0'){
        lesser=10;
        greater=6;
       }
       else if(filtercgpa == '5.0'){
        lesser=10;
        greater=5;
       }
       else if(filtercgpa == '4.0')
       {
           lesser=10;
           greater=4;
       }  else if(filtercgpa == '3.0')
       {
           lesser=10;
           greater=3;
       }  else if(filtercgpa == '2.0')
       {
           lesser=10;
           greater=2;
       }  
       else {
        lesser=5;
        greater=1;
       }
  }
  Job.findById(req.params.id).populate('postedBy').populate("appliedBy.postedBy").exec(function (err, foundJob) {
     
if(filtercgpa!= '' && filterdegree!='' && filterstatus!= ''){
  var filterParameter = {status:filterstatus,degree:filterdegree,cgpa:{$lte:lesser,$gte:greater}}
}
else if(filtercgpa!= '' && filterdegree!='' && filterstatus== ''){
  var filterParameter = {degree:filterdegree,cgpa:{$lte:lesser,$gte:greater}}
}
else if(filtercgpa!= '' && filterdegree=='' && filterstatus!= ''){
  var filterParameter = {status:filterstatus,cgpa:{$lte:lesser,$gte:greater}}
}
else if(filtercgpa!= '' && filterdegree=='' && filterstatus == ''){
  var filterParameter = {cgpa:{$lte:lesser,$gte:greater}}
}
else{
  var filterParameter={}
}
console.log(filterParameter);
Seeker.find(filterParameter).exec(function (err, seekers) {
   if (err) {
     console.log(err);
     req.flash("error", err.message);
     return res.redirect("back");
   }
   else {
     console.log(seekers);
     res.render("company/seekerview", { job: foundJob, seekers: seekers});
   }
 });
  });     
});

router.get("/seeker/:id/applyjob", middleware.checkSeekerOwnership, function (req, res) {
  Job.findById(req.params.id, function (err, job) {
    company.find({}).exec(function (err, allcompanies) {
      if (err) {
        console.log(err);
        req.flash("error", err.message);
        return res.redirect("back");
      }
      else {
        res.render("seeker/applyjob", { job: job, companies: allcompanies });
      }
    });
  });
});

router.post("/seeker/:id/applyjob", middleware.checkSeekerOwnership, function (req, res) {
  Job.findById(req.params.id).populate('postedBy').populate("appliedBy.postedBy").exec(function (err, foundJob) {
    if (err) {
      console.log(err);
      req.flash("error", err.message);
      return res.redirect("back");
    } else {
      var find = false;
      foundJob.appliedBy.forEach(function (eachSeeker) {
        if (String(eachSeeker.postedBy.id) == String(req.user._id)) {
          console.log("you have applied");
          req.flash("error", "You have already applied for this job");
          find = true;
        }
      });
      if (find == false) {
        Job.findOneAndUpdate({ _id: req.params.id }, { $push: { "appliedBy": { "isStatus": "Pending", "postedBy": req.user } } }, { new: true }, function (err, job) {
          if (err) {
            console.log(err);
            req.flash("error", err.message);
            return res.redirect("back");
          }
          else {
            console.log(req.user);
            console.log(job);
            req.flash("success", "You have applied for this job.");
            res.redirect("/seeker/" + req.params.id + "/applyjob");
          }
        });
      }
    }
  });
});

module.exports = router;
