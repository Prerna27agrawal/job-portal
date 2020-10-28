 var express = require("express");
var router = express.Router();

var Company = require("../models/company");
var Seeker = require("../models/seeker");
var Job = require("../models/job");
var User = require("../models/user");
var Posts = require("../models/posts");
var Quiz1 = require("../models/quiz1");
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
  Job.create(req.body.job, function (err, job) {
    if (err) {
      console.log(err);
      req.flash("error", err.message);
      return res.redirect("back");
    }
    else {
      req.flash("success", "Successfully Created New Job");
      Company.findOne().where('createdBy.id').equals(req.user._id).populate('subscribedBy').exec(function (err, company) {
        var users = [];
        console.log(company);
        company.subscribedBy.forEach(function (eachuser) {
          users.push(eachuser.email);
        });
        //email for notification of new job
        if (users.length > 0) {
          const output = `
      <p>Hello Seeker,</p>
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
router.get("/company/:id/show/jobstats/:page", middleware.checkCompanyOwnership,
  function (req, res) {
    var perPage = 3;
    var page =req.params.page || 1
    Job.findById(req.params.id).populate('postedBy').populate("appliedBy.postedBy").exec(function (err, foundJob) {
      Seeker.find({}).skip((perPage * page)-perPage).limit(perPage).exec(function (err, seekers) {
       Seeker.count().exec(function(err,count){
        if (err) {
          console.log(err);
          req.flash("error", err.message);
          return res.redirect("back");
        }
        else {
          res.render("company/seekerview", { job: foundJob, seekers: seekers,current:page,pages: Math.ceil(count/perPage) });
        }
      });
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
