var express = require("express");
var router = express.Router();
var Company = require("../models/company");
var  Seeker = require("../models/seeker");
var  Job = require("../models/job");
var User = require("../models/user");
var Posts =require("../models/posts");

var middleware = require("../middleware/index.js");
const { runInContext } = require("vm");
var path= require("path");
////Multer config
router.use(express.static(__dirname+"./public/"));

 var multer = require('multer');
 var storage = multer.diskStorage({
     destination: "./public/resume_folder/",
     filename: function(req, file, callback) {
   callback(null, file.fieldname+'_'+Date.now() + "_"+path.extname(file.originalname));
 }
});
var uploadsFilter = function (req, file, cb) {
  if(file.fieldname == "resume")
  {
      if (!file.originalname.match(/\.(pdf)$/i)) {
          return cb(new Error('Only pdf files are allowed!'), false);
      }
      else
        cb(null, true);
  }
  else if(file.fieldname == "image")
  {
    if(file.mimetype === 'image/png' ||file.mimetype === 'image/jpg' ||file.mimetype === 'image/jpeg')
    {
         cb(null,true);
    }
    else{
      return cb(new Error("only images are allowed"),false);
    }
  }
};
var upload = multer({ 
  storage: storage,
  //limits:{fileSize:1000000},
   fileFilter: uploadsFilter}).fields([
     {
       name:'resume',
       maxCount:1
     },
     {
       name:'image',
       maxCount:1
     }
   ]);
var cloudinary = require('cloudinary');
const { route } = require("./company");
//////////


function escapeRegex(text) {
  return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
};

router.get("/register/seeker", middleware.checkSeekerOwnership,function (req, res) {
    res.render("seeker/seekerregister");
  });
  
   
 router.post("/register/seeker",middleware.checkSeekerOwnership,upload, function (req, res) {
  //console.log(req.files); 
  //console.log(req.files.image);
  var newSeeker=new Seeker({
          firstname:req.body.firstname,
          lastname:req.body.lastname,
          email:req.body.email,
          gender:req.body.gender,
          country:req.body.ownCountry,
          state:req.body.ownState,
          city:req.body.ownCity,
          phone:req.body.phone,
          status:req.body.status,
          gradyear:req.body.gradyear,
          education:req.body.education,
          degree:req.body.degree,
          studyYear:req.body.studyyear,
          stream:req.body.stream,
          studyYear:req.body.year,
          cgpa:req.body.cgpa,
          linkedinId:req.body.linkedinId,
          githubId:req.body.githubId,
          website:req.body.website,
          skills:req.body.skills,
          resume:req.files.resume[0].filename,
         // image:req.files.image[0].filename
          });
          newSeeker.seekerBy = {
          id : req.user._id,
          username : req.user.username
          }
          //console.log(req.files.image);
          if(req.files.image)
          {
            console.log(" image given");
            newSeeker.image = req.files.image[0].filename;
          }
          if(!req.files.image)
          {
            console.log("no image given");
          }
          req.user.isFill=true;
          req.user.save();
Seeker.create(newSeeker,function(err, newSeekercreate) {
    if (err) {
      console.log(err);
      req.flash("error","err.message");
      res.redirect("back");
    }
      console.log(newSeekercreate);
      req.flash("success","You are successfully registered .");
      res.redirect("/seeker/index");
  });
});

  
router.get("/seeker/index",middleware.checkSeekerOwnership,function(req,res){
    //console.log(req.user);
  Company.find({}).exec(function(err,allcompany){
      if (err) {
        console.log(err);
        req.flash("error","err.message")
        return res.redirect("back");
    }else{
          if(req.query.search_name)
          {
            const regex = new RegExp(escapeRegex(req.query.search_name), 'gi');
            Job.find({ "name": regex }).populate('postedBy').populate('appliedBy.postedBy').exec(function(err,alljobs){
              if (err) {
                console.log(err);
                req.flash("error","err.message")
                return res.redirect("back");
            }
              else{
               //console.log(alljobs);
               var len=Number(alljobs.length);
               //console.log(len);
                if(len == 0)
                {
                  console.log("no such job");
                  req.flash("error","No Job with this title found");
                  res.redirect("back");
                }else{
                  //console.log("these jobs");
                 // req.flash("success","Following Jobs match with your search");
                 res.render("seeker/index",{jobs:alljobs,companies:allcompany});
                }
              }
            });
          }
          else if(req.query.search_location){
            const regex = new RegExp(escapeRegex(req.query.search_location), 'gi');
            Job.find({ "location": regex }).populate('postedBy').populate('appliedBy.postedBy').exec(function(err,alljobs){
              if (err) {
                console.log(err);
                req.flash("error","err.message")
                return res.redirect("back");
            }
            else{
              //console.log(alljobs);
              var len=Number(alljobs.length);
              //console.log(len);
               if(len == 0)
               {
                 console.log("no such job");
                 req.flash("error","No Job at this location found");
                 res.redirect("back");
               }else{
                 //console.log("these jobs");
                // req.flash("success","Following Jobs match with your search");
                res.render("seeker/index",{jobs:alljobs,companies:allcompany});
               }
             }
            });
          }
          else if(req.query.search_keywords){
              const regex = new RegExp(escapeRegex(req.query.search_keywords), 'gi');
              Job.find({$or:
                [{"name": regex},
                { "location": regex },
                {"company": regex },
                {"experience": regex},
                {"description": regex},
                ]
              }).populate('postedBy').populate('appliedBy.postedBy').exec(function(err,alljobs){
                if (err) {
                  console.log(err);
                  req.flash("error","err.message")
                  return res.redirect("back");
              }
              else{
                //console.log(alljobs);
                var len=Number(alljobs.length);
                //console.log(len);
                 if(len == 0)
                 {
                   console.log("no such job");
                   req.flash("error","No Job with this Keyword found");
                   res.redirect("back");
                 }else{
                   //console.log("these jobs");
                  // req.flash("success","Following Jobs match with your search");
                  res.render("seeker/index",{jobs:alljobs,companies:allcompany});
                 }
               }
              });
          }
    else
    {
        Job.find({}).populate('postedBy').populate('appliedBy.postedBy').exec(function(err,alljobs){
          if (err) {
            console.log(err);
            req.flash("error","err.message")
            return res.redirect("back");
          }
          else{
            //console.log(alljobs);
            var len=Number(alljobs.length);
            //console.log(len);
             if(len == 0)
             {
               console.log("no such job");
               req.flash("error","No Job found");
               res.redirect("back");
             }else{
               //console.log("these jobs");
              // req.flash("success","Following Jobs match with your search");
              res.render("seeker/index",{jobs:alljobs,companies:allcompany});
             }
           }
      });
    }
  }
  });
 });
  
router.get("/seeker/:id/myprofile",function(req,res){
    User.findById(req.params.id,function(err,foundUser){
      if (err) {
        console.log(err);
        req.flash("error","err.message")
        return res.redirect("back");
    }
      else{
        Seeker.findOne().where('seekerBy.id').equals(foundUser._id).exec(function(err,foundSeeker){
          if (err) {
            console.log(err);
            req.flash("error","err.message")
            return res.redirect("back");
        }
          else{
        res.render("seeker/profile",{foundSeeker:foundSeeker,foundUser:foundUser});      
          }
        });
      }
    });
  });



router.get("/seeker/:id/editprofile",middleware.checkSeekerOwnership,function(req,res){
  Seeker.findById(req.params.id,function(err,foundSeeker){
    res.render("seeker/editprofile",{foundSeeker : foundSeeker});
  });
});
 

router.put("/seeker/updateprofile/:id",middleware.checkSeekerOwnership,upload,function(req,res){
 
  Seeker.findById(req.params.id,function(err,foundSeeker){
    
    if(err)
    {
      req.flash("error",err.message);
      res.redirect("back");
    }
    else{
      foundSeeker.firstname=req.body.firstname,
      foundSeeker.lastname=req.body.lastname,
      foundSeeker.email=req.body.email,
      foundSeeker.gender=req.body.gender,
      foundSeeker.country=req.body.ownCountry,
      foundSeeker.state=req.body.ownState,
      foundSeeker.city=req.body.ownCity,
      foundSeeker.phone=req.body.phone,
      foundSeeker.status=req.body.status,
      foundSeeker.gradyear=req.body.gradyear,
      foundSeeker.education=req.body.education,
      foundSeeker.degree=req.body.degree,
      foundSeeker.studyYear=req.body.studyyear,
      foundSeeker.stream=req.body.stream,
      foundSeeker.studyYear=req.body.year,
      foundSeeker.cgpa=req.body.cgpa,
      foundSeeker.linkedinId=req.body.linkedinId,
      foundSeeker.githubId=req.body.githubId,
      foundSeeker.website=req.body.website,
      foundSeeker.skills=req.body.skills,
      foundSeeker.resume=req.files.resume[0].filename
      if(req.files.image)
          {
            console.log(" image given");
            newSeeker.image = req.files.image[0].filename;
          }
          if(!req.files.image)
          {
            console.log("no image given");
          }
          req.user.isFill=true;
          req.user.save();
          foundSeeker.save();
          req.flash("success","Succesfully Updated");
          res.redirect("/seeker/"+foundSeeker.seekerBy.id+"/myprofile");
    }
  });
});

  //POST route for adding new projects
  router.post("/seeker/:id/addproject",function(req,res){
      var newproject={
        title:req.body.project_title,
        url:req.body.project_url,
        starttime:`${req.body.project_start_month} ${req.body.project_start_year}`,
        endtime:`${req.body.project_end_month} ${req.body.project_end_year}`,
        description:req.body.project_description,
      }
      if(newproject.endtime=="Current Current"){
        newproject.endtime="Current";
      }

      Seeker.findOne().where('seekerBy.id').equals(req.user._id).exec(function(err,seeker){
        if(err){
          console.log(err);
          req.flash("error","err.message");
        }else{
          seeker.projects.push(newproject);
          seeker.save();
          // console.log(seeker);
          res.redirect("/seeker/"+req.user._id+"/myprofile");
        }
      })
  })  
 
  
router.get("/seeker/:id/subscribe/:job_id",middleware.checkSeekerOwnership,function(req,res){
  Company.findOneAndUpdate({_id:req.params.id},{$push:{"subscribedBy":req.user._id} },{new:true},function(err,company){
    if (err) {
      console.log(err);
      req.flash("error","err.message")
      return res.redirect("back");
  }
    else
    {
      //company.save();
      console.log(company);
      req.flash("success","Further updates will be mailed to you as you subscribed this company")
      res.redirect("/seeker/"+req.params.job_id+"/applyjob");
    }
  });
});


router.get("/seeker/:id/unsubscribe/:job_id",middleware.checkSeekerOwnership,function(req,res){
Company.findOneAndUpdate({_id:req.params.id},{$pull:{"subscribedBy":req.user._id}},{multi:true},function(err,company){
  if (err) {
    console.log(err);
    req.flash("error","err.message")
    return res.redirect("back");
}
  else
  {
    // company.subscribedBy.forEach(function(thisuser){
    //   if(String(thisuser.username) == String(req.user.username))
    //   {
    //     thisuser.remove();
    //     company.save();
    //   }  
    // });
    req.flash("success","You unsubscribed this company");
    res.redirect("/seeker/"+req.params.job_id+"/applyjob");
  }
});
});
module.exports = router;