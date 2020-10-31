
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


router.get("/company/:id/myprofile",function(req,res){
    User.findById(req.params.id,function(err,foundUser){
      if(err){
        req.flash("error",err.message);
        res.redirect("back");
      console.log(err);
      }
      else{
        Company.find().where('createdBy.id').equals(foundUser._id).populate("posts").exec(function(err,foundCompany){
          if(err){
          console.log(err);
         req.flash("error",err.message);
         res.redirect("back");
          }
          else{
            res.render("company/myprofile",{user: foundUser,company: foundCompany});       
          }
        });
      }
    });
  });
  
  //search for user model and then for company model
  router.get("/company/:id/editprofile",middleware.checkCompanyOwnership,function(req,res){
     Company.findById(req.params.id,function(err,foundCompany){
       res.render("company/editprofile",{company: foundCompany});
     });
  });
  
  router.put("/company/updateprofile/:id",middleware.checkCompanyOwnership,
  upload.single('logo'),function(req,res){
    Company.findById(req.params.id,async function(err, company){
      if(err)
      {
        req.flash("error",err.message);
        res.redirect("back");
      }
      else{
          if(req.file)
          {
            try{
              await
              cloudinary.uploader.destroy(company.logoId);
              var result = await
              cloudinary.uploader.upload(req.file.path);
              company.logo= result.secure_url;
              company.logoId = result.public_id;
            }
            catch(err)
            {
              console.log(err);
              req.flash("error",err.message);
              return res.redirect("back");
            }
            company.name = req.body.name;
            company.tagline = req.body.tagline;
            company.description = req.body.description;
            company.company_url=req.body.company_url;
            company.establishmentDate=req.body.establishmentDate;
            company.linkedinId=req.body.linkedinId;
            company.facebookId=req.body.facebookId;
            company.contactno=req.body.contactno;
            company.save();
            req.flash("success","Successfully Updated");
            res.redirect("/company/"+company.createdBy.id+"/myprofile");
          }
      }
    });
  });
  
  //delete from all three schema
  router.delete("/company/:id",middleware.checkCompanyOwnership,function(req,res){
    User.findById(req.params.id, function(err,user){
      if(err)
      {
        console.log(err);
        req.flash("error",err.message);
        return res.redirect("back");
      }
      Company.findOne().where('createdBy.id').equals(user._id).exec(function(err,company){
        Posts.find().where('postedBy.id').equals(company._id).exec(function(err,posts){
        Job.find().where('postedBy.id').equals(user._id).exec(async function(err,jobs){
           try{
            await
        cloudinary.uploader.destroy(company.logoId);
        company.remove();
        jobs.forEach(function(job){
          job.remove();
        });
        posts.forEach(function(post){
          post.remove();
        });
        user.remove();
        console.log("removed the company");
        req.flash('success',"Company Removed Successfully!");
        res.redirect("/");
      }
      catch(err)
      {
        if(err)
        {
          console.log(err);
         req.flash('error'.err.message);
          return res.redirect("back");
        }
      }
        });
      });
    });
    });
  });


  module.exports = router;
