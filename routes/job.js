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


//saari jobs uss comapny ki show hongi
router.get("/company/:id/viewjob",middleware.checkCompanyOwnership,function(req,res){
    User.findById(req.params.id,function(err,foundUser){
      if(err)
      console.log(err);
      Job.find().where('postedBy.id').equals(foundUser._id).exec(function(err,jobs){
        if(err)
        console.log(err);
        else{
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

 
router.get("/seeker/:id/appliedJobs",function(req,res){
    Seeker.findById(req.params.id,function(err,foundSeeker){
      if(err)
      console.log(err);
      Job.find().where('appliedBy.id').equals(foundSeeker._id).exec(function(err,alljobs){
        if(err)
        console.log(err);
        else{
             res.render("seeker/appliedJobs",{seeker:foundSeeker,jobs: alljobs});
        }
      });
    })
  })



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
  // Job.findById(req.params.id).populate("appliedBy").exec(function(err,foundJob){
  //        res.render("company/seekerview",{jobs:foundJob});
  // });

 res.send("applied by");
});




module.exports = router;








module.exports = router;

