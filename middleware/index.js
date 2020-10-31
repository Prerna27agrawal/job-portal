
var Company = require("../models/company");
var Seeker = require("../models/seeker");
var Job = require("../models/job");
var Posts =require("../models/posts");
var Quiz = require("../models/quiz");
var Question = require("../models/question");
var Submission = require("../models/submission");
var FeedBack =require("../models/feedback");


var middlewareObj ={};
middlewareObj.checkCompanyOwnership = function(req,res,next)
{
   if(req.isAuthenticated() && (req.user.isCompany == true))
   {
     next();
   }
   else
   {
      req.flash("error","You don't have permission to do that");
      res.redirect("/");
   }
}

middlewareObj.checkSeekerOwnership = function(req,res,next)
{
   if(req.isAuthenticated() && (req.user.isCompany == false))
   {
     next();
   }
   else
   {
      req.flash("error","You don't have permission to do that");
      res.redirect("/");
   }
}
middlewareObj.checkAdminOwnership = function(req,res,next)
{
   if(req.isAuthenticated() && (req.user.isAdmin == true) && (req.user.adminCode == process.env.ADMIN_CODE))
   {
     next();
   }
   else
   {
      req.flash("error","You don't have permission to do that as you are not the admin");
      res.redirect("/");
   }
}
 middlewareObj.isLoggedIn = function(req,res,next){
     if(req.isAuthenticated())
     {
        //  if(req.user.isCompany == true)
        //  {
        //      res.redirect("")
        //  }
        //  else{
        //         res.redirect("");
        //  }
          return next();
     }
     req.flash("error","You need to login");
     res.redirect("/login");
 }
 module.exports = middlewareObj;