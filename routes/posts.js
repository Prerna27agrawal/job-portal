var express = require("express");
var router = express.Router();
var async = require("async");
var crypto = require("crypto");


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
router.use(express.static(__dirname+"/public"));

router.get("/company/:id/posts/new", middleware.checkCompanyOwnership, function(req,res){
    Company.findById(req.params.id,function(err,foundcompany){
        if (err) {
            console.log(err);
            req.flash("error",err.message);
            return res.redirect("back");
        }
       else
       {
           res.render("posts/new",{company: foundcompany});
       }
    });
  });

router.post("/company/:id/posts",middleware.checkCompanyOwnership,function(req,res){
      Company.findById(req.params.id,function(err,foundcompany){
        if (err) {
            console.log(err);
            req.flash("error",err.message);
            return res.redirect("back");
        }
        else{
            Posts.create(req.body.posts,function(err,post){
                if (err) {
                    console.log(err);
                    req.flash("error",err.message);
                    return res.redirect("back");
                }
               else{
                   post.postedBy.id = foundcompany._id;
                   post.postedBy.companyname = foundcompany.name;
                   post.save();
                   foundcompany.posts.unshift(post);
                   foundcompany.save();
                   console.log("successfully added post");
                   req.flash("success","Successfully added post");
                   res.redirect('/company/'+foundcompany._id+'/myprofile');
               }
            });
        }
      });
  });

  router.get("/company/:id/posts/:post_id/edit",middleware.checkCompanyOwnership,
  function(req,res){
      Company.findById(req.params.id,function(err,foundcompany){
        if (err) {
            console.log(err);
            req.flash("error",err.message);
            return res.redirect("back");
        }
          else{
              Posts.findById(req.params.post_id,function(err,foundpost){
                if (err) {
                    console.log(err);
                    req.flash("error",err.message);
                    return res.redirect("back");
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
        if (err) {
            console.log(err);
            req.flash("error",err.message);
            return res.redirect("back");
        }
      else{
          req.flash("success","Post updated");
          res.redirect("/company/"+ foundcompany._id +"/myprofile");
      }
    });
});
  });

  router.delete("/company/:id/postsdelete/:post_id", middleware.checkCompanyOwnership,function(req,res){
    Company.findById(req.params.id,function(err,foundcompany){
 Posts.findByIdAndRemove(req.params.post_id,function(err){
    if (err) {
        console.log(err);
        req.flash("error",err.message);
        return res.redirect("back");
    }
     else{
         req.flash("success","Post deleted");
         res.redirect("/company/"+ foundcompany._id +"/myprofile");
     }
    });
 });
  });
  


module.exports = router;
