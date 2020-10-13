var express = require("express");
var router = express.Router();
var async = require("async");
//crypto is part of express no need to install is
var crypto = require("crypto");


var Company = require("../models/company");
var  Seeker = require("../models/seeker");
var  Job = require("../models/job");
var User = require("../models/user");
var Posts =require("../models/posts");



var middleware = require("../middleware/index.js");

var passport   = require("passport");
//var LocalStrategy= require("passport-local");
var path= require("path");
const company = require("../models/company");



//search for company and the post id in it 


router.get("/company/:id/posts/new", middleware.checkCompanyOwnership, function(req,res){
    Company.findById(req.params.id,function(err,foundcompany){
       if(err)
       console.log(err);
       else
       {
           res.render("posts/new",{company: foundcompany});
       }
    });
    //res.send("to add new post");
  });

  router.post("/company/:id/posts",middleware.checkCompanyOwnership,function(req,res){
      Company.findById(req.params.id,function(err,foundcompany){
        if(err)
       {
         console.log(err);
         res.redirect("/");
       }
        else{
            Posts.create(req.body.posts,function(err,post){
               if(err)
               {
                   console.log(err);
                   req.flash("error","Something went wrong");
               }
               else{
                   post.postedBy.id = foundcompany._id;
                   post.postedBy.companyname = foundcompany.name;
                   post.save();
                   foundcompany.posts.push(post);
                   foundcompany.save();
                   console.log("successfully added post");
                   req.flash("success","Successfully added post");
        // res.redirect('/company/'+job.postedBy.id+'/viewjob');//,{jobs:job});
                   res.redirect('/company/'+foundcompany.createdBy.id+'/myprofile')
               }
            });
        }
      });
  });

  router.get("/company/:id/posts/:post_id/edit",middleware.checkCompanyOwnership,
  function(req,res){
      Company.findById(req.params.id,function(err,foundcompany){
          if(err)
          console.log(err);
          else{
              Posts.findById(req.params.post_id,function(err,foundpost){
                   if(err)
                   {
                       console.log(err);
                       res.redirect("back");
                   }
                   else{
                       res.render("posts/edit",{company: foundcompany,post: foundpost});
                   }
              });
          }
      });
      
  });
  router.put("/company/:id/postsedit/:post_id",middleware.checkCompanyOwnership,
  function(req,res){
    Company.findById(req.params.id,function(err,foundcompany){
    Posts.findByIdAndUpdate(req.params.post_id,req.body.posts,function(err,updatedpost){
      if(err)
      {
          console.log(err);
          res.redirect("back");
      }
      else{
          res.redirect("/company/"+ foundcompany.createdBy.id +"/myprofile");
      }
    });
});
  });

  router.delete("/company/:id/postsdelete/:post_id",function(req,res){
    Company.findById(req.params.id,function(err,foundcompany){
 Posts.findByIdAndRemove(req.params.post_id,function(err){
     if(err)
     {
         console.log(err);
         res.redirect("back");
     }
     else{
         req.flash("success","post deleted");
         res.redirect("/company/"+ foundcompany.createdBy.id +"/myprofile");
     }
    });
 });
//    res.send("to dlete the post");
  });
  
  

















module.exports = router;
