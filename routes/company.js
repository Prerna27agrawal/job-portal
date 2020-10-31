var express = require("express");
var router = express.Router();
var async = require("async");
var crypto = require("crypto");
const jwt = require('jsonwebtoken');
const bcryptjs = require('bcryptjs');

var Company = require("../models/company");
var  Seeker = require("../models/seeker");
var  Job = require("../models/job");
var User = require("../models/user");
var Posts =require("../models/posts");
var Quiz = require("../models/quiz");
var Question = require("../models/question");
var Submission = require("../models/submission");
var FeedBack =require("../models/feedback");


var nodemailer = require("nodemailer");
var middleware = require("../middleware/index.js");
const { emitWarning } = require("process");


var passport   = require("passport");
var path= require("path");
router.use(express.static(__dirname+"./public/"));

//Multer and cloudinary config
var multer = require('multer');
var storage = multer.diskStorage({
    filename: function(req, file, callback) {
  callback(null, Date.now() + file.originalname);
}
});
var imageFilter = function (req, file, cb) {
  if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/i)) {
      return cb(new Error('Only image files are allowed!'), false);
  }
  cb(null, true);
};
var upload = multer({ storage: storage, fileFilter: imageFilter})
var cloudinary = require('cloudinary');
cloudinary.config({ 
cloud_name: process.env.CLOUD_NAME, 
api_key: process.env.CLOUDINARY_API_KEY,
api_secret: process.env.CLOUDINARY_API_SECRET
});
////////////

  
router.get("/register/company",middleware.checkCompanyOwnership,function (req, res) {
    res.render("company/companyregister");
  });

//company register page 
router.post("/register/company",middleware.checkCompanyOwnership,upload.single('logo'), function (req, res) {
    cloudinary.uploader.upload(req.file.path, function(result) {
      // add cloudinary url for the image to the campground object under image property
      req.body.logo = result.secure_url;
      req.body.logoId = result.public_id;
      var newComp=new Company({
        name: req.body.name,
        tagline:req.body.tagline,
        description:req.body.description,
        logo:req.body.logo,
        logoId:req.body.logoId,
        establishmentDate:req.body.establishmentDate,
        company_url:req.body.company_url,
        linkedinId:req.body.linkedinId,
        facebookId:req.body.facebookId,
        contactno:req.body.contactno,
      });
      newComp.createdBy = {
        id: req.user._id,
        username : req.user.username
      }
      req.user.isFill=true;
      req.user.save();
      console.log(req.user);
      Company.create(newComp,function(err, newcompanycreate) {
        if (err) {
            console.log(err);
            req.flash("error",err.message);
            return res.redirect("back");
        }
          req.flash("success","Company Registered Successfully");
          res.redirect("/company/show");
      });
    });
});
 


router.get("/company/show",middleware.checkCompanyOwnership,function(req,res){
    res.render("company/show",{company:req.user});
});


//saari jobs uss comapny ki show hongi
router.get("/company/:id/viewjob/:page",middleware.checkCompanyOwnership,function(req,res){
     var perPage = 3;
     var page =req.params.page || 1
  User.findById(req.params.id,function(err,foundUser){
    if (err) {
      console.log(err);
      req.flash("error",err.message);
      return res.redirect("back");
  }
    Job.find().where('postedBy.id').equals(foundUser._id).skip((perPage * page)-perPage).limit(perPage).exec(function(err,jobs){
      Job.count().exec(function(err,count){
      if (err) {
        console.log(err);
        req.flash("error",err.message);
        return res.redirect("back");
    }
      else{
            
             Company.find().where('createdBy.id').equals(foundUser._id).exec(function(err,foundCompany){
              if (err) {
                console.log(err);
                req.flash("error",err.message);
                return res.redirect("back");
            }
                 else
                 {
                   res.render("company/viewjob",{user:foundUser,jobs: jobs,company: foundCompany,current: page,pages: Math.ceil(count/perPage)});
                 }
             });
      }
    });
  });
  });
});


module.exports = router;


