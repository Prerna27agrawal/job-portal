var express = require("express");
var router = express.Router();
var async = require("async");
var crypto = require("crypto");

const jwt = require('jsonwebtoken');
const JWT_KEY = "jwtactive987";
const JWT_RESET_KEY = "jwtreset987";
const bcryptjs = require('bcryptjs');

var Company = require("../models/company");
var  Seeker = require("../models/seeker");
var  Job = require("../models/job");
var User = require("../models/user");
var Posts =require("../models/posts");

var nodemailer = require("nodemailer");
var middleware = require("../middleware/index.js");
const { emitWarning } = require("process");


var passport   = require("passport");
var path= require("path");

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
cloud_name: 'dhr7wlz2k', 
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
        facebbokId:req.body.facebbokId,
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
            req.flash("error","err.message")
            return res.redirect("back");
        }
          req.flash("success","Company Registered Successfully");
          res.redirect("/company/show");
      });
    });
});
 

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
          company.facebbokId=req.body.facebbokId;
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

router.get("/company/show",middleware.checkCompanyOwnership,function(req,res){
    res.render("company/show",{company:req.user});
});


//saari jobs uss comapny ki show hongi
router.get("/company/:id/viewjob",middleware.checkCompanyOwnership,function(req,res){
  User.findById(req.params.id,function(err,foundUser){
    if (err) {
      console.log(err);
      req.flash("error","err.message")
      return res.redirect("back");
  }
    Job.find().where('postedBy.id').equals(foundUser._id).exec(function(err,jobs){
      if (err) {
        console.log(err);
        req.flash("error","err.message")
        return res.redirect("back");
    }
      else{
            
             Company.find().where('createdBy.id').equals(foundUser._id).exec(function(err,foundCompany){
              if (err) {
                console.log(err);
                req.flash("error","err.message")
                return res.redirect("back");
            }
                 else
                 {
                   res.render("company/viewjob",{user:foundUser,jobs: jobs,company: foundCompany});
                 }
             });
      }
    });
  });
});


module.exports = router;


