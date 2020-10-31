var express = require("express");
var router = express.Router();
var async = require("async");
var crypto = require("crypto");
const {check, validationResult} = require('express-validator');



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

var passport   = require("passport");
var path= require("path");


 //POST route for adding new projects
 router.post("/seeker/:id/addproject",middleware.checkSeekerOwnership,function(req,res){
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
        req.flash("error",err.message);
      }else{
        seeker.projects.push(newproject);
        seeker.save();
        // console.log(seeker);
        res.redirect("/seeker/"+req.user._id+"/myprofile");
      }
    });
});  



router.get("/seeker/:id/editproject/:projectid",middleware.checkSeekerOwnership,function(req,res){
    Seeker.findOne().where('seekerBy.id').equals(req.user._id).exec(function(err,seeker){
      if (err) {
        console.log(err);
        req.flash("error",err.message);
        return res.redirect("back");
    }
       seeker.projects.forEach(function(project) {
           if(String(project._id) == String(req.params.projectid)){
                res.render("project/edit",{project:project,foundSeeker:seeker});
           }
       });
    });
});
router.post("/seeker/:id/editproject/:projectid",middleware.checkSeekerOwnership,function (req,res){
  console.log(req.body);
  var title =req.body.project_title;
    var url=req.body.project_url;
       var starttime=`${req.body.project_start_month} ${req.body.project_start_year}`;
       var endtime=`${req.body.project_end_month} ${req.body.project_end_year}`;
        var description=req.body.project_description;
       if(req.body.endtime == "Current Current"){
         endtime ="Current";
       }
  Seeker.update({"seekerBy.id": req.params.id , "projects._id":req.params.projectid},
  {$set:{"projects.$.title":title,
  "projects.$.url":url,
  "projects.$.starttime":starttime,
  "projects.$.endtime":endtime,
  "projects.$.description":description } },function(err,data) {
        if (err) {
          console.log(err);
          req.flash("error",err.message);
          return res.redirect("back");
       }
      //    seeker.projects.forEach(function(project) {
      //        if(String(project._id) == String(req.params.projectid)){
      //             project.remove();
                   console.log(data);
                  req.flash("success","Project updated");
                  res.redirect("/seeker/"+req.user._id+"/myprofile");
      });
    });
  // Seeker.findOne().where('seekerBy.id').equals(req.user._id).exec(function(err,seeker){
  //   if (err) {
  //     console.log(err);
  //     req.flash("error",err.message);
  //     return res.redirect("back");
  // }else{
  //   seeker.projects.forEach(function(project) {
  //     if(String(project._id) == String(req.params.projectid)){
  //       project.title=req.body.project_title;
  //        project.url=req.body.project_url;
  //      project.starttime=`${req.body.project_start_month} ${req.body.project_start_year}`;
  //      project.endtime=`${req.body.project_end_month} ${req.body.project_end_year}`;
  //      project.description=req.body.project_description;
  //      if(project.endtime == "Current Current"){
  //        project.endtime ="Current";
  //      }
  //      project.save();
  //      req.flash("success","Project Updated");
  //      res.redirect("/seeker/"+req.user._id+"/myprofile");
  //     }
  // });
  // }
  // });
// });
router.delete("/seeker/:id/delete/:projectid",middleware.checkSeekerOwnership,function (req,res){
  Seeker.findOneAndUpdate({"seekerBy.id": req.params.id},{$pull:{"projects":{"_id":req.params.projectid}}},function(err,data){
    if (err) {
      console.log(err);
      req.flash("error",err.message);
      return res.redirect("back");
   }
  //    seeker.projects.forEach(function(project) {
  //        if(String(project._id) == String(req.params.projectid)){
  //             project.remove();
               console.log(data);
              req.flash("success","Project deleted");
              res.redirect("/seeker/"+req.user._id+"/myprofile");
      //   }
   //  });
  });
  
});


module.exports = router;
