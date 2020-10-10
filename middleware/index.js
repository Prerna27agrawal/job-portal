
var Company = require("../models/company");
var Seeker = require("../models/seeker");
var Job = require("../models/job");
var middlewareObj ={};
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
     res.redirect("/login");
 }
 module.exports = middlewareObj;