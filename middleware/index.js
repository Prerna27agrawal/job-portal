
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
   if(req.isAuthenticated() && (req.user.isCompany == true) && (req.user.isFill == true)&& (req.user.isAdmin == false))
   {
      res.set('Cache-Control', 'no-cache, private, no-store, must-revalidate, post-check=0, pre-check=0');
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
   if(req.isAuthenticated() && (req.user.isCompany == false) && (req.user.isFill == true)&& (req.user.isAdmin == false))
   {
      res.set('Cache-Control', 'no-cache, private, no-store, must-revalidate, post-check=0, pre-check=0');
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
      res.set('Cache-Control', 'no-cache, private, no-store, must-revalidate, post-check=0, pre-check=0');
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
      res.set('Cache-Control', 'no-cache, private, no-store, must-revalidate, post-check=0, pre-check=0');
        return next();
   }
   req.flash("error","You need to login");
   res.redirect("/login");
}
 middlewareObj.isLoggedInSeeker = function(req,res,next){
     if(req.isAuthenticated() && (req.user.isCompany== false) && (req.user.isAdmin == false))
     {
        res.set('Cache-Control', 'no-cache, private, no-store, must-revalidate, post-check=0, pre-check=0');
          return next();
     }
     req.flash("error","You need to login");
     res.redirect("/login");
 }
 middlewareObj.isLoggedInCompany = function(req,res,next){
   if(req.isAuthenticated() && (req.user.isCompany== true) && (req.user.isAdmin == false))
   {
      res.set('Cache-Control', 'no-cache, private, no-store, must-revalidate, post-check=0, pre-check=0');
        return next();
   }
   req.flash("error","You need to login");
   res.redirect("/login");
}
middlewareObj.isLoggedInAdminSeeker = function(req,res,next){
   if(req.isAuthenticated() && ((req.user.isCompany== false) || (req.user.isAdmin == true)) && (req.user.isFill == true))
   {
      res.set('Cache-Control', 'no-cache, private, no-store, must-revalidate, post-check=0, pre-check=0');
        return next();
   }
   req.flash("error","You need to login");
   res.redirect("/login");
}

middlewareObj.isLoggedInAdmin = function(req,res,next){
   if(req.isAuthenticated() && (req.user.isAdmin == true) && (req.isFill == true))
   {
      res.set('Cache-Control', 'no-cache, private, no-store, must-revalidate, post-check=0, pre-check=0');
        return next();
   }
   req.flash("error","You need to login");
   res.redirect("/login");
}

 module.exports = middlewareObj;