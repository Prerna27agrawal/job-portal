var express = require("express");
var router = express.Router();

var Company = require("../models/company");
var Seeker = require("../models/seeker");
var Job = require("../models/job");
var Job2 = require("../models/job");

var User = require("../models/user");
var Posts = require("../models/posts");
var FeedBack =require("../models/feedback");
var Quiz = require("../models/quiz");
var Question = require("../models/question");
var Submission = require("../models/submission");

var middleware = require("../middleware/index.js");
const company = require("../models/company");
// const { route } = require("./company");
//const job = require("../models/job");

var nodemailer = require("nodemailer");
const { use } = require("passport");
//const { response } = require("express");


var path= require("path");
router.use(express.static(__dirname+"/public"));



///select a candidate for a particlar job
//id is for the selected job
//:seeker_id is for the selected seeker
//:applied by_id is for the array object id that is the user schema id
router.post("/job/:id/selected/:appliedByarray_id/seeker/:seeker_id", middleware.checkCompanyOwnership, function (req, res) {
    Seeker.findById(req.params.seeker_id, function (err, foundSeeker) {
      User.findById(req.params.appliedByarray_id, function (err, foundUser) {
        Job.findById(req.params.id).populate('appliedBy.postedBy').exec(function (err, foundjob) {
          Company.findOne().where('createdBy.id').equals(foundjob.postedBy.id).exec(function (err, foundCompany) {
            foundjob.appliedBy.forEach(function (user) {
              if (String(user.postedBy.id) == String(foundUser._id)) {
                console.log(user.isStatus);
                user.isStatus = 'Accepted';
                console.log(user.isStatus);
                foundjob.save();
              }
            });
            const output = `
                   <p>Congratulations, You have been  selected for the following job!!</p>
                   <h3>Job details</h3>
                   <ul>
                   <li>Company: ${foundCompany.name} </li>
                   <li>Job role: ${foundjob.name} </li>
                   <li>Job location: ${foundjob.location} </li>
                   </ul>
                   <p>
                   For further procedure, you will be contacted by the Comapny.
                   All the Best.
                   </p>
               `;
  
            const transporter = nodemailer.createTransport({
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
  
            const mailOptions = {
              from: '"WeHire" <jobporta2525@gmail.com>',
              to: foundUser.email,
              subject: 'Job Offer',
              text: '',
              html: output
            };
  
            transporter.sendMail(mailOptions, (error, info) => {
              if (error) {
                console.log(err);
                req.flash("error", err.message);
                return res.redirect("back");
              }
              else {
                console.log('Message sent: %s', info.messageId);
                console.log('Preview Url : %s', nodemailer.getTestMessageUrl(info));
                req.flash('success', "Mail has been sent to the Seeker Regarding your Decision");
                res.redirect("back");
                //console.log("hi");
              }
            });
            //res.redirect("/company/"+req.params.id+"/show/jobstats");
          });
        });
      });
    });
  });
  
  
  /////reject a job
  router.post("/job/:id/rejected/:appliedByarray_id/seeker/:seeker_id", middleware.checkCompanyOwnership, function (req, res) {
    Seeker.findById(req.params.seeker_id, function (err, foundSeeker) {
      User.findById(req.params.appliedByarray_id, function (err, foundUser) {
        Job.findById(req.params.id).populate('appliedBy.postedBy').exec(function (err, foundjob) {
          Company.findOne().where('createdBy.id').equals(foundjob.postedBy.id).exec(function (err, foundCompany) {
            foundjob.appliedBy.forEach(function (user) {
              if (String(user.postedBy.id) == String(foundUser._id)) {
                console.log(user.isStatus);
                user.isStatus = 'Rejected';
                console.log(user.isStatus);
                foundjob.save();
              }
  
            });
            const output = `
                     <p> Sorry!You have been  rejected for the following job</p>
                     <h3>Job details</h3>
                     <ul>
                     <li>Company: ${foundCompany.name} </li>
                     <li>Job role: ${foundjob.name} </li>
                     <li>Job location: ${foundjob.location} </li>
                     </ul>
                 `;
  
            const transporter = nodemailer.createTransport({
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
  
            const mailOptions = {
              from: '"WeHire" ',//<jobportal916@gmail.com>',
              to: foundUser.email,
              subject: 'Job Offer',
              text: '',
              html: output
            };
            transporter.sendMail(mailOptions, (error, info) => {
              if (error) {
                console.log(err);
                req.flash("error", err.message);
                return res.redirect("back");
              }
              else {
                console.log('Message sent: %s', info.messageId);
                //console.log('Preview Url : %s',nodemailer.getTestMessageUrl(info));
                // req.flash('success',"Password reset link sent to email ID. Please follow the instructions.");
                req.flash('success', "Mail has been sent to the Seeker Regarding your Decision");
                res.redirect("back");
              }
            });
            // res.redirect("/company/"+req.params.id+"/show/jobstats");
          });
        });
      });
    });
  })
  
  
  
    module.exports = router;
  