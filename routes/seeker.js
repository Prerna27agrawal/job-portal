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

/////
var multer = require('multer');
var storage = multer.diskStorage({
    filename: function(req, file, callback) {
  callback(null, Date.now() + file.originalname);
}
});
var imageFilter = function (req, file, cb) {
  // accept image files only
  if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/i)) {
      return cb(new Error('Only image files are allowed!'), false);
  }
  cb(null, true);
};
var upload = multer({ storage: storage, fileFilter: imageFilter})
var cloudinary = require('cloudinary');
const job = require("../models/job");
const company = require("../models/company");
const { populate } = require("../models/company");
cloudinary.config({ 
cloud_name: 'dhr7wlz2k', 
api_key: process.env.CLOUDINARY_API_KEY,
api_secret: process.env.CLOUDINARY_API_SECRET
});
////////////

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
    Seeker.findById(req.params.id,function(err,foundSeeker){
      if(err){
        console.log(err);
      }else{
        res.render("seeker/profile",{foundSeeker:foundSeeker});
      }
    })
  })
 
  
  // router.get("/login/seeker/companyname", function (req, res) {
  //   res.send("let us routerly to my company and work ");
  // });
  
  
  
  //POST Request
  
  //NEW LOGIN POSTROUTE
  //router.post("/login",middleware,callback)
  
  
  router.post("/register/seeker", function (req, res) {
    var newSeeker=new Seeker({
     // username:req.body.username,
      firstname:req.body.firstname,
      lastname:req.body.lastname,
      email:req.body.email,
      country:req.body.country,
      status:req.body.status,
      gradyear:req.body.gradyear,
      linkedinId:req.body.linkedinId,
      skills:req.body.skills
    });
    newSeeker.seekerBy = {
      id : req.user._id,
      username : req.user.username
    }
    Seeker.create(newSeeker,function(err, newSeekercreate) {
      if (err) {
         console.log(err);
          return res.render("seeker/seekerregister");
      }
       res.redirect("/login");
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