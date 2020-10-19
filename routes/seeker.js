var express = require("express");
var router = express.Router();
var Company = require("../models/company");
var  Seeker = require("../models/seeker");
var  Job = require("../models/job");
var User = require("../models/user");
var Posts =require("../models/posts");

var middleware = require("../middleware/index.js");


// var passport   = require("passport");
// var LocalStrategyS= require("passport-local");
var path= require("path");
//var passportLocalMongooseS = require('passport-local-mongoose'); 



// ////////passport-authenticate
// router.use(require("express-session")({
//     secret: "It is a Job Portal seeker page",
//     resave :false,
//     saveUninitialized: false	
// }));
// router.use(passport.initialize());
// router.use(passport.session());
// //passport.use(new LocalStrategy(Company.authenticate())); 
// passport.use(new LocalStrategyS(Seeker.authenticate())); 
// passport.serializeUser(Seeker.serializeUser());
// passport.deserializeUser(Seeker.deserializeUser());
// //passport.serializeUser(Company.serializeUser());
// //passport.deserializeUser(Company.deserializeUser());
// ////////////////////////////////////////

// /////
router.use(express.static(__dirname+"./public/"));
 var multer = require('multer');
 var storage = multer.diskStorage({
     destination: "./public/resume_folder/",
     filename: function(req, file, callback) {
   callback(null, file.fieldname+'_'+Date.now() + "_"+path.extname(file.originalname));
 }
});
var uploadsFilter = function (req, file, cb) {
  // accept image files only
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
  limits:{fileSize:1000000},
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
const job = require("../models/job");
const company = require("../models/company");
const { runInContext } = require("vm");
// const { populate } = require("../models/company");
// cloudinary.config({ 
// cloud_name: 'dhr7wlz2k', 
// api_key: process.env.CLOUDINARY_API_KEY,
// api_secret: process.env.CLOUDINARY_API_SECRET
// });
// ////////////

function escapeRegex(text) {
  return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
};



// router.get("/login/seeker", function (req, res) {
//     res.render("seeker/seekerlogin");
//   });
  
  
  
  router.get("/register/seeker", function (req, res) {
    res.render("seeker/seekerregister");
  });
  
  
  router.get("/seeker/index",function(req,res){
    console.log(req.user);
    company.find({}).exec(function(err,allcompany){
    if(req.query.search_name)
    {
      const regex = new RegExp(escapeRegex(req.query.search_name), 'gi');
      job.find({ "name": regex },function(err,alljobs){
        if(err)
         console.log(err);
        else{
          //console.log(alljobs);
          res.render("seeker/index",{jobs:alljobs,companies:allcompany});
        }
      });
    }
    else if(req.query.search_location){
      const regex = new RegExp(escapeRegex(req.query.search_location), 'gi');
      job.find({ "location": regex },function(err,alljobs){
        if(err)
         console.log(err);
        else{
          //console.log(alljobs);
          res.render("seeker/index",{jobs:alljobs,companies:allcompany});
        }
      });
    }
    else if(req.query.search_keywords){
      const regex = new RegExp(escapeRegex(req.query.search_keywords), 'gi');
      job.find({$or:
        [{"name": regex},
         { "location": regex },
         {"company": regex },
         {"experience": regex},
         {"description": regex},
        ]
      },function(err,alljobs){
        if(err)
         console.log(err);
        else{
          //console.log(alljobs);
          res.render("seeker/index",{jobs:alljobs,companies:allcompany});
        }
      });
    }
    else
    {
    job.find({}).populate('postedBy').populate('appliedBy.postedBy').exec(function(err,alljobs){
      if(err)
       console.log(err);
      else{
        //console.log(alljobs);
        //console.log(allcompany);
        res.render("seeker/index",{jobs:alljobs,companies:allcompany});
    }
  });
  }
});
    //res.render("seeker/index");//,{seeker:req.user});
  });
  
  router.get("/seeker/:id/myprofile",middleware.checkSeekerOwnership,function(req,res){
    User.findById(req.params.id,function(err,foundUser){
      if(err)
      console.log(err);
      else{
        Seeker.findOne().where('seekerBy.id').equals(foundUser._id).exec(function(err,foundSeeker){
          if(err)
          console.log(err);
          else{
        res.render("seeker/profile",{foundSeeker:foundSeeker,foundUser:foundUser});      
          }
        });
      }
    });
  });
 
  
  // router.get("/login/seeker/companyname", function (req, res) {
  //   res.send("let us routerly to my company and work ");
  // });
  
  
  
  //POST Request
  
  //NEW LOGIN POSTROUTE
  //router.post("/login",middleware,callback)
  
  
  router.post("/register/seeker",upload, function (req, res) {
            console.log(req.files);
            //var resume_file =`public/resume_folder/${req.file.filename}`;
    // var file = req.files.resume,
    //     filename = file.name;
    //     file.mv("../resume_folder"+filename,function(err){
    //       if(err)
    //       console.log(err);
    //       console.log("error occured while uploading resume to folder");
    //     });
    var newSeeker=new Seeker({
     // username:req.body.username,
      firstname:req.body.firstname,
      lastname:req.body.lastname,
      email:req.body.email,
      gender:req.body.gender,
      country:req.body.ownCountry,
      state:req.body.ownState,
      city:req.body.ownCity,
      phone:req.body.phone,
      //email:req.body.email,
      status:req.body.status,
      gradyear:req.body.gradyear,
      education:req.body.education,
      stream:req.body.stream,
      cgpa:req.body.cgpa,
      linkedinId:req.body.linkedinId,
      githubId:req.body.githubId,
      website:req.body.website,
      skills:req.body.skills,
      resume:req.files.resume[0].filename,
      image:req.files.image[0].filename
    });
    newSeeker.seekerBy = {
      id : req.user._id,
      username : req.user.username
    }
    // User.findOne().where('_id').equals('req.user._id').exec(function(err,user){
    //   console.log(user);    
    //   user.isFill=true;
    //        user.save();
    //        console.log(user);
    // });
    req.user.isFill=true;
    req.user.save();
    console.log("to check is fill");
    console.log(req.user);
    Seeker.create(newSeeker,function(err, newSeekercreate) {
      if (err) {
         console.log(err);
          return res.render("seeker/seekerregister");
      }
      console.log(newSeekercreate);
       res.redirect("/seeker/index");
      });
    });
  
  // router.post("/login/seeker",passport.authenticate("local",
  //   {
  //     // console.log(req.user);
  //     successRedirect: "/seeker/index",
  //     failureRedirect:"/login/seeker"
  //   }),function(req,res){
  // });
  
  
  


module.exports = router;