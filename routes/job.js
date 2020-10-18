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

//saari jobs uss comapny ki show hongi
router.get("/company/:id/viewjob",middleware.checkCompanyOwnership,function(req,res){
    User.findById(req.params.id,function(err,foundUser){
      if(err)
      console.log(err);
      Job.find().where('postedBy.id').equals(foundUser._id).exec(function(err,jobs){
        if(err)
        console.log(err);
        else{
               console.log(jobs);
               Company.find().where('createdBy.id').equals(foundUser._id).exec(function(err,foundCompany){
                   if(err)
                   console.log(err);
                   else
                   {
                     console.log(foundCompany);
                     res.render("company/viewjob",{user:foundUser,jobs: jobs,company: foundCompany});
                   }
               });
        }
      });
    });
    // Company.findById(req.params.id).populate("jobs").exec(function(err,foundcom){
    //   if(err)
    //   console.log(err);
    //   else
    //   {
    //     console.log(foundcom);
    //     res.render("company/viewjob",{Company: foundcom});
    //   }
    // }); 
  });
  


  
  //jb company login kre toh usko job create karkee id mil jae company ki
router.get("/company/createjob",middleware.checkCompanyOwnership,function(req,res){
  res.render("company/createjob");//,{Company: req.user});
// });
});

  //old create job post route
//after creating job post
router.post("/login/company/createjob",function(req,res){
    console.log(req.body.job);
    req.body.job.postedBy = {
     id: req.user._id,
     username: req.user.username
   }
   console.log(req.body.job);
   console.log(req.body.job.postedBy);
   Job.create(req.body.job,function(err,job){
     if(err)
     console.log(err);
     else
     {
         console.log(job);
         res.redirect('/company/'+job.postedBy.id+'/viewjob');//,{jobs:job});
     }
});
});

 
router.get("/seeker/:seeker_id/appliedJobs",function(req,res){
  //console.log(req.user._id);
    Job.find({}).populate('postedBy').populate("appliedBy.postedBy").exec(function(err,alljobs){
      if(err)
       console.log(err);
      else{
        console.log(alljobs);
        res.render("seeker/appliedJobs",{jobs:alljobs,currentUser:req.user});
      }
    });
    // Seeker.findById(req.params.id,function(err,foundSeeker){
    //   if(err)
    //   console.log(err);
    //   Job.find().where('appliedBy.id').equals(foundSeeker._id).exec(function(err,alljobs){
    //     if(err)
    //     console.log(err);
    //     else{
    //          res.render("seeker/appliedJobs",{seeker:foundSeeker,jobs: alljobs});
    //     }
    //   });
    // })
  });



router.delete("/company/jobdelete/:id",middleware.checkCompanyOwnership,function(req,res){
   Job.findById(req.params.id,function(err,job){
    if(err)
    {
      console.log(err);
      return res.redirect("back");
    }
   job.remove();
   console.log("removed the job");
   req.flash('success',"job removed");
   res.redirect("/company/"+req.user._id+"/viewjob");
   });
  //res.send("this is to delet the job");
});


//for applied by seekrs view
//id of job
router.get("/company/:id/show/jobstats",middleware.checkCompanyOwnership,
function(req,res){
  Job.findById(req.params.id).populate('postedBy').populate("appliedBy.postedBy").exec(function(err,foundJob){
     Seeker.find({}).exec(function(err,seekers){
           if(err)
           console.log(err);
           else{
             //console.log(foundJob.appliedBy);
             //console.log(JSON.stringify(foundJob,null,"\t"));
            // console.log(seekers);
    res.render("company/seekerview",{job:foundJob,seekers:seekers});
           }
      } );  
  });
 //res.send("applied by");
});

router.get("/seeker/:id/applyjob",function(req,res){
  Job.findById(req.params.id,function(err,job){
    company.find({}).exec(function(err,allcompanies){
    if(err)
     console.log(err);
    else
    {
      console.log(req.user);
      res.render("seeker/applyjob",{job:job,companies:allcompanies});
      //Company.find().where('createdBy.id').equals(job.posted)
    }
   });
  });
});

router.post("/seeker/:id/applyjob",function(req,res){
   Job.findById(req.params.id).populate('postedBy').populate("appliedBy.postedBy").exec(function(err,foundJob){
     //console.log(foundJob);
     var find = false;
      foundJob.appliedBy.forEach(function(eachSeeker){
       // console.log(req.user._id);
       // console.log(eachSeeker.postedBy.id);
        if(String(eachSeeker.postedBy.id) == String(req.user._id))
        {
          console.log("you have applied");
          req.flash("YOU have applied already");
          find = true;
        }
      });
      if(find == false)
      {
        Job.findOneAndUpdate({_id:req.params.id},{$push:{"appliedBy":{"isStatus":"pending","postedBy":req.user}} },{new:true},function(err,job){
          if(err)
           console.log(err);
          else
          {
            console.log(req.user);
            console.log(job);
            res.redirect("/seeker/index");
          }
        });
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
    console.log("user found");
    console.log(foundUser);
    Job.findById(req.params.id).populate('appliedBy.postedBy').exec(function(err,foundjob){
         Company.findOne().where('createdBy.id').equals(foundjob.postedBy.id).exec(function(err,foundCompany){
         foundjob.appliedBy.forEach(function(user){
           console.log(String(user.postedBy.id));
           console.log(String(foundUser._id));
                  if(String(user.postedBy.id) == String(foundUser._id))
                  {
                   console.log(user.isStatus);
                      user.isStatus = 'Accepted';
                      console.log(user.isStatus);
                      foundjob.save();
                      //console.log(foundjob);
                  }
                  //console.log(user.isStatus);

         });
          if(err)
             console.log(err);
             //console.log("your data");
             //console.log(foundjob);
             //console.log(foundSeeker);
             //console.log(foundCompany);
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
                  if(error)
                  return console.log(error);
                  console.log('Message sent: %s',info.messageId);
                  console.log('Preview Url : %s',nodemailer.getTestMessageUrl(info));
                 // res.render("company/seekerview");
           res.redirect("/company/"+req.params.id+"/show/jobstats");
                  //res.redirect("back");
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
      Job.findById(req.params.id,function(err,foundjob){
           Company.findOne().where('createdBy.id').equals(foundjob.postedBy.id).exec(function(err,foundCompany){
           foundjob.appliedBy.forEach(function(user){
                    if(user.postedBy.id.equals(req.params.appliedByarray_id))
                    {
                      console.log(user.isStatus);
                        user.isStatus = 'Rejected';
                        console.log(user.isStatus);
                        foundjob.save();
                        //console.log(foundjob);
                    }
                    //console.log(user.isStatus);
  
           });
            //foundjob.appliedBy.isStatus = "Rejected";
            if(err)
              console.log(err);
              //  console.log("your data");
              //  console.log(foundjob);
              //  console.log(foundSeeker);
              //  console.log(foundCompany);
           
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
                    console.log('Preview Url : %s',nodemailer.getTestMessageUrl(info));
           res.redirect("/company/"+req.params.id+"/show/jobstats");
          // res.redirect("back");
               });
           });
      });
    });
  });
});





module.exports = router;



