var express = require("express");
var router = express.Router();
var async = require("async");
var crypto = require("crypto");


var Company = require("../models/company");
var  Seeker = require("../models/seeker");
var  Job = require("../models/job");
var User = require("../models/user");
var Posts =require("../models/posts");
var Quiz1 = require("../models/quiz1");
var FeedBack =require("../models/feedback");

var middleware = require("../middleware/index.js");

var passport   = require("passport");
var path= require("path");


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
        req.flash("error",err.message);
      }else{
        seeker.projects.push(newproject);
        seeker.save();
        // console.log(seeker);
        res.redirect("/seeker/"+req.user._id+"/myprofile");
      }
    })
})  



module.exports = router;
