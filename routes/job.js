var express = require("express");
var router = express.Router();

var Company = require("../models/company");
var  Seeker = require("../models/seeker");
var  Job = require("../models/job");
var User = require("../models/user");
var Posts =require("../models/posts");


var middleware = require("../middleware/index.js");
const company = require("../models/company");
const { route } = require("./company");
const job = require("../models/job");

var nodemailer = require("nodemailer");
const { use } = require("passport");
const { response } = require("express");



  
  //jb company login kre toh usko job create karkee id mil jae company ki
router.get("/company/createjob",middleware.checkCompanyOwnership,function(req,res){
  res.render("company/createjob");
});

//after creating job post
router.post("/login/company/createjob",middleware.checkCompanyOwnership,function(req,res){
    req.body.job.postedBy = {
     id: req.user._id,
     username: req.user.username
   }
   Job.create(req.body.job,function(err,job){
    if (err) {
      console.log(err);
      req.flash("error","err.message")
      return res.redirect("back");
  }
     else
     {
       req.flash("success","Successfully Created New Job");
         Company.findOne().where('createdBy.id').equals(req.user._id).populate('subscribedBy.id').exec(function(err,company){
           var users=[];
           company.subscribedBy.forEach(function(eachuser){
              users.push(eachuser.id.email);
           });
           //email for notification of new job
      const output= `
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
         host:'smtp.gmail.com',
         port: 587,
         secure :false,
         //service: 'Gmail',
         auth: {
           user :'jobportal2525@gmail.com',
           pass :'shaifali2727'
         },
         tls: {
           rejectUnauthorized :false
         }
       });
       
       let mailOptions = {
        from :'"WeHire" <jobportal2525@gmail.com>',
        to :users,
        subject : 'New Job Opening !!',
        text : '',
        html :output
      };
      transporter.sendMail(mailOptions, (error, info) => {
        if (err) {
          console.log(err);
          req.flash("error","err.message")
          return res.redirect("back");
      }
          console.log('Message sent: %s', info.messageId);
          console.log('Preview Url : %s', nodemailer.getTestMessageUrl(info));
          req.flash('success',"Notification sent to all the Subscribed Users");
          res.redirect('/company/' + job.postedBy.id + '/viewjob');
        });
        });
     }
});
});

 
router.get("/seeker/:seeker_id/appliedJobs",middleware.checkSeekerOwnership,function(req,res){
    Job.find({}).populate('postedBy').populate("appliedBy.postedBy").exec(function(err,alljobs){
      if (err) {
        console.log(err);
        req.flash("error","err.message")
        return res.redirect("back");
    }
      else{
       // console.log(alljobs);
        res.render("seeker/appliedJobs",{jobs:alljobs,currentUser:req.user});
      }
    });
  });



router.delete("/company/jobdelete/:id",middleware.checkCompanyOwnership,function(req,res){
   Job.findById(req.params.id,function(err,job){
    if (err) {
      console.log(err);
      req.flash("error","err.message")
      return res.redirect("back");
  }
   job.remove();
   console.log("removed the job");
   req.flash('success',"Job removed");
   res.redirect("/company/"+req.user._id+"/viewjob");
   });
});


//for applied by seekrs view
//id of job
router.get("/company/:id/show/jobstats",middleware.checkCompanyOwnership,
function(req,res){
  Job.findById(req.params.id).populate('postedBy').populate("appliedBy.postedBy").exec(function(err,foundJob){
     Seeker.find({}).exec(function(err,seekers){
      if (err) {
        console.log(err);
        req.flash("error","err.message")
        return res.redirect("back");
    }
           else{
    res.render("company/seekerview",{job:foundJob,seekers:seekers});
           }
      } );  
  });
});

router.get("/seeker/:id/applyjob",middleware.checkSeekerOwnership,function(req,res){
  Job.findById(req.params.id,function(err,job){
    company.find({}).exec(function(err,allcompanies){
      if (err) {
        console.log(err);
        req.flash("error","err.message")
        return res.redirect("back");
    }
    else
    {
      console.log(req.user);
      res.render("seeker/applyjob",{job:job,companies:allcompanies});
    }
   });
  });
});

router.post("/seeker/:id/applyjob",middleware.checkSeekerOwnership,function(req,res){
   Job.findById(req.params.id).populate('postedBy').populate("appliedBy.postedBy").exec(function(err,foundJob){
    if (err) {
      console.log(err);
      req.flash("error","err.message")
      return res.redirect("back");
  }else{
     var find = false;
      foundJob.appliedBy.forEach(function(eachSeeker){
        if(String(eachSeeker.postedBy.id) == String(req.user._id))
        {
          console.log("you have applied");
          req.flash("error","You have already applied for this job");
          find = true;
          break;
        }
      });
      if(find == false)
      {
        Job.findOneAndUpdate({_id:req.params.id},{$push:{"appliedBy":{"isStatus":"pending","postedBy":req.user}} },{new:true},function(err,job){
          if (err) {
            console.log(err);
            req.flash("error","err.message")
            return res.redirect("back");
        }
          else
          {
            console.log(req.user);
            console.log(job);
            req.flash("success","You have applied for this job.");
            res.redirect("/seeker/index");
          }
        });
      }
    }
   });
});


///select a candidate for a particlar job
//id is for the selected job
//:seeker_id is for the selected seeker
//:applied by_id is for the array object id that is the user schema id
router.post("/job/:id/selected/:appliedByarray_id/seeker/:seeker_id",middleware.checkCompanyOwnership,function(req,res){
  Seeker.findById(req.params.seeker_id,function(err,foundSeeker){
  User.findById(req.params.appliedByarray_id,function(err,foundUser){
    Job.findById(req.params.id).populate('appliedBy.postedBy').exec(function(err,foundjob){
         Company.findOne().where('createdBy.id').equals(foundjob.postedBy.id).exec(function(err,foundCompany){
         foundjob.appliedBy.forEach(function(user){
                  if(String(user.postedBy.id) == String(foundUser._id))
                  {
                   console.log(user.isStatus);
                      user.isStatus = 'Accepted';
                      console.log(user.isStatus);
                      foundjob.save();
                  }
         });
         if (err) {
          console.log(err);
          req.flash("error","err.message")
          return res.redirect("back");
      }
             const output= `
                 <p> You have been  seleceted for the following job</p>
                 <h3>Job details</h3>
                 <ul>
                 <li>Company: ${foundCompany.name} </li>
                 <li>Job role: ${foundjob.name} </li>
                 <li>Job location: ${foundjob.location} </li>
                 </ul>
                 <p>
                 for further details you will be contacted by the company
                 </p>
             `;
     
             let transporter = nodemailer.createTransport({
              // host: 'mail.google.com',
               host:'smtp.gmail.com',
               port: 587,
               secure :false,
               //service: 'Gmail',
               auth: {
                 user :'jobportal2525@gmail.com',
                 pass :'shaifali2727'
               },
               tls: {
                 rejectUnauthorized :false
               }
             });
  
             let mailOptions = {
               from :'"JobPortal" <jobporta2525@gmail.com>',
               to :foundUser.email,
               subject : 'Job Offer',
               text : '',
               html :output
             };
  
             transporter.sendMail(mailOptions, (error,info)=>{
              if (err) {
                console.log(err);
                req.flash("error","err.message")
                return res.redirect("back");
            }
                  console.log('Message sent: %s',info.messageId);
                  console.log('Preview Url : %s',nodemailer.getTestMessageUrl(info));
                  req.flash("success","Mail has been sent to the Seeker Regarding your Decision");
                  res.redirect("/company/"+req.params.id+"/show/jobstats");
             });
         });
    });
  });
  });
  });
  
  
  /////reject a job
  router.post("/job/:id/rejected/:appliedByarray_id/seeker/:seeker_id",middleware.checkCompanyOwnership,function(req,res){
    Seeker.findById(req.params.seeker_id,function(err,foundSeeker){
  User.findById(req.params.appliedByarray_id,function(err,foundUser){
    Job.findById(req.params.id).populate('appliedBy.postedBy').exec(function(err,foundjob){
           Company.findOne().where('createdBy.id').equals(foundjob.postedBy.id).exec(function(err,foundCompany){
           foundjob.appliedBy.forEach(function(user){
            if(String(user.postedBy.id) == String(foundUser._id))
                    {
                      console.log(user.isStatus);
                        user.isStatus = 'Rejected';
                        console.log(user.isStatus);
                        foundjob.save();
                    }
  
           });
           if (err) {
            console.log(err);
            req.flash("error",err.message);
            return res.redirect("back");
        }
               const output= `
                   <p> Sorry!You have been  rejected for the following job</p>
                   <h3>Job details</h3>
                   <ul>
                   <li>Company: ${foundCompany.name} </li>
                   <li>Job role: ${foundjob.name} </li>
                   <li>Job location: ${foundjob.location} </li>
                   </ul>
               `;
       
               let transporter = nodemailer.createTransport({
                // host: 'mail.google.com',
                 host:'smtp.gmail.com',
                 port: 587,
                 secure :false,
                 //service: 'Gmail',
                 auth: {
                   user :'jobportal2525@gmail.com',
                   pass :'shaifali2727'
                 },
                 tls: {
                   rejectUnauthorized :false
                 }
               });
    
               let mailOptions = {
                 from :'"JobPortal" <jobportal916@gmail.com>',
                 to :foundUser.email,
                 subject : 'Job Offer',
                 text : '',
                 html :output
               };
    
               transporter.sendMail(mailOptions, (error,info)=>{
                    if(error)
                    return console.log(error);
                    console.log('Message sent: %s',info.messageId);
                  req.flash("success","Mail has been sent to the Seeker Regarding your Decision");
                    console.log('Preview Url : %s',nodemailer.getTestMessageUrl(info));
           res.redirect("/company/"+req.params.id+"/show/jobstats");
               });
           });
      });
    });
  });
});



module.exports = router;



