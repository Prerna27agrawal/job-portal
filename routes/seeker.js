var express = require("express");
const {check, validationResult} = require('express-validator');

var router = express.Router();
var Company = require("../models/company");
var  Seeker = require("../models/seeker");
var  Job = require("../models/job");
var User = require("../models/user");
var Posts =require("../models/posts");
var Quiz = require("../models/quiz");
var Question = require("../models/question");
var Submission = require("../models/submission");
var FeedBack =require("../models/feedback");

var middleware = require("../middleware/index.js");
const { runInContext } = require("vm");
var path= require("path");
////Multer config
router.use(express.static(__dirname+"/public"));

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
//////////


function escapeRegex(text) {
  return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
};

router.get("/register/seeker", middleware.checkSeekerOwnership,function (req, res) {
    res.render("seeker/seekerregister");
  });

 router.post("/register/seeker",middleware.checkSeekerOwnership,upload,
// [
//   check('firstname','FirstName is required').not().isEmpty(),
//   check('status','Current Status is required').not().isEmpty(),
//   check('gradyear','Graduation Year is required').not().isEmpty().isLength({min:4}),
//   check('education','College is required').not().isEmpty(),
//   check('degree','Degree is required').not().isEmpty(),
//   check('studyyear','Studying year is required').not().isEmpty(),
//   check('cgpa','cgpa is required').not().isEmpty(),
//   check('skills','Skill is required').not().isEmpty(),
//   check('phone','Phone Number should be atleast 10 digit number').isInt().isLength({min:10,max:12}),
// ] 
function (req, res) {
  //console.log(req.files); 
  //console.log(req.files.image);
 // const errors = validationResult(req);
  //console.log(errors);
   //
    //       var errorResponse = errors.array({ onlyFirstError: true });
    //       req.flash("error",errorResponse[0].msg);
    //       res.redirect("/register");
    // }else{
  var status = req.body.status;
  var degree = req.body.degree;

  var newSeeker=new Seeker({
          firstname:req.body.firstname,
          lastname:req.body.lastname,
          email:req.body.email,
          gender:req.body.gender,
          country:req.body.ownCountry,
          state:req.body.ownState,
          city:req.body.ownCity,
          phone:req.body.phone,
          status:status.toUpperCase(),
          gradyear:req.body.gradyear,
          education:req.body.education,
          degree:degree.toUpperCase(),
          studyYear:req.body.studyyear,
          stream:req.body.stream,
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
          User.findOne({"isAdmin":true}).exec(function(err,admin){
Seeker.create(newSeeker,function(err, newSeekercreate) {
    if (err) {
      console.log(err);
      req.flash("error",err.message);
      res.redirect("back");
    }
      
       req.user.QuizCount = admin.QuizCount;
       req.user.save();
      console.log(newSeekercreate);
      req.flash("success","You are successfully registered .");
      res.redirect("/seeker/index");
  });
          });
});

  
router.get("/seeker/index",middleware.checkSeekerOwnership,function(req,res){
    //console.log(req.user);
    Seeker.findOne({"seekerBy.id":req.user._id}).exec(function(err,seeker){
  Company.find({}).exec(function(err,allcompany){
      if (err) {
        console.log(err);
        req.flash("error",err.message);
        return res.redirect("back");
    }else{
          if(req.query.search_name)
          {
            const regex = new RegExp(escapeRegex(req.query.search_name), 'gi');
            Job.find({ "name": regex }).populate('postedBy').populate('appliedBy.postedBy').exec(function(err,alljobs){
              if (err) {
                console.log(err);
                req.flash("error",err.message);
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
                }
                  //console.log("these jobs");
                 // req.flash("success","Following Jobs match with your search");
                 res.render("seeker/index",{jobs:alljobs,companies:allcompany,seeker:Seeker});
                }
              
            });
          }
          else if(req.query.search_location){
            const regex = new RegExp(escapeRegex(req.query.search_location), 'gi');
            Job.find({ "location": regex }).populate('postedBy').populate('appliedBy.postedBy').exec(function(err,alljobs){
              if (err) {
                console.log(err);
                req.flash("error",err.message);
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
               }
                 //console.log("these jobs");
                // req.flash("success","Following Jobs match with your search");
                res.render("seeker/index",{jobs:alljobs,companies:allcompany,seeker:seeker});
               
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
                  req.flash("error",err.message);
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
                 }
                   //console.log("these jobs");
                  // req.flash("success","Following Jobs match with your search");
                  res.render("seeker/index",{jobs:alljobs,companies:allcompany,seeker:seeker});
                 
               }
              });
          }
    else
    {
        Job.find({}).populate('postedBy').populate('appliedBy.postedBy').exec(function(err,alljobs){
          if (err) {
            console.log(err);
            req.flash("error",err.message);
            return res.redirect("back");
          }
          else{
            //console.log(alljobs);
               //console.log("these jobs");
              // req.flash("success","Following Jobs match with your search");
              res.render("seeker/index",{jobs:alljobs,companies:allcompany,seeker:seeker});
             
           }
      });
    }
  }
  });
});
 });

   
router.get("/seeker/:id/myprofile",middleware.isLoggedIn,function(req,res){
  User.findById(req.params.id,function(err,foundUser){
    if (err) {
      console.log(err);
      req.flash("error",err.message);
      return res.redirect("back");
  }
    else{
      Seeker.findOne().where('seekerBy.id').equals(foundUser._id).exec(function(err,foundSeeker){
        if (err) {
          console.log(err);
          req.flash("error",err.message);
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
    var status = req.body.status;
    var degree = req.body.degree;  
    foundSeeker.firstname=req.body.firstname,
    foundSeeker.lastname=req.body.lastname,
    foundSeeker.email=req.body.email,
    foundSeeker.gender=req.body.gender,
    foundSeeker.country=req.body.ownCountry,
    foundSeeker.state=req.body.ownState,
    foundSeeker.city=req.body.ownCity,
    foundSeeker.phone=req.body.phone,
    foundSeeker.status=status.toUpperCase(),
    foundSeeker.gradyear=req.body.gradyear,
    foundSeeker.education=req.body.education,
    foundSeeker.degree=degree.toUpperCase(),
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

  
router.get("/seeker/:id/subscribe/:job_id",middleware.checkSeekerOwnership,function(req,res){
  Company.findOneAndUpdate({_id:req.params.id},{$push:{"subscribedBy":req.user._id} },{new:true},function(err,company){
    if (err) {
      console.log(err);
      req.flash("error",err.message);
      return res.redirect("back");
  }
    else
    {
      company.save();
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
    req.flash("error",err.message);
    return res.redirect("back");
}
  else
  {
    req.flash("success","You unsubscribed this company");
    res.redirect("/seeker/"+req.params.job_id+"/applyjob");
  }
});
});
module.exports = router;