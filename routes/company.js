var express = require("express");
var router = express.Router();
var async = require("async");
//crypto is part of express no need to install is
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

// const middlewareObj = require("../middleware/index.js");
// const { use } = require("passport");
// const { exec } = require("child_process");

var passport   = require("passport");
//var LocalStrategy= require("passport-local");
var path= require("path");
//var passportLocalMongoose = require('passport-local-mongoose'); 

var multer = require('multer');
var storage = multer.diskStorage({
    filename: function(req, file, callback) {
  callback(null, Date.now() + file.originalname);
}
});
var imageFilter = function (req, file, cb) {
  // accept image files only
  if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/i)) {
      return cb(new Error('Only image files are allowed!'), false);
  }
  cb(null, true);
};
var upload = multer({ storage: storage, fileFilter: imageFilter})
var cloudinary = require('cloudinary');
const { emitWarning } = require("process");
const company = require("../models/company");

cloudinary.config({ 
cloud_name: 'dhr7wlz2k', 
api_key: process.env.CLOUDINARY_API_KEY,
api_secret: process.env.CLOUDINARY_API_SECRET
});
////////////


router.get("/", function (req, res) {
    res.render("landing");
  });
  
  router.get("/login", function (req, res) {
    res.render("login");
  });

  router.get("/logout",function(req,res){
    req.logout();
    //flash message
    res.redirect("/");
  })

 router.post("/login",passport.authenticate('local',{failureRedirect:'/login',failureFlash: 'Invalid username or password.'}),function(req,res){
        console.log(req.user);
        console.log(req.body);
  if(req.user.isVerified == true  && req.user.isFill == false){
     if(req.user.isCompany == true)
      {
            res.redirect("/register/company");
      }
      else
      {
       res.redirect("/register/seeker");
      }
    }
    else if(req.user.isVerified == true && req.user.isFill == true)
    {
      if(req.user.isCompany == true)
      {
            res.redirect("/company/show");
      }
      else
      {
       res.redirect("/seeker/index");
      }
    }
    else{
      console.log("first fill your details and verify yourself");
       res.redirect("/register");
    }
 });


router.get("/register", function (req, res) {
    res.render("register");
  });
router.post("/register",function(req,res){
  User.findOne({email:req.body.email}).then(user=>{
    if(user)
    {
      console.log("this email id alreasy exist");
      req.flash("error","'Email ID already registered'");
      res.redirect("/register");
    }
    else{
        //eemail verification
 const token = jwt.sign({username:req.body.username,password:req.body.password,email:req.body.email,role:req.body.role}, JWT_KEY,{expiresIn: '60m'});
 const CLIENT_URL ='http://'+ req.headers.host;
 const output = `
                <h2>Please click on below link to activate your account</h2>
                <p>${CLIENT_URL}/activate/${token}</p>
                <p><b>NOTE: </b> The above activation link expires in 60 minutes.</p>
                `;
const transporter = nodemailer.createTransport({
                  // host: 'mail.google.com',
                   host:'smtp.gmail.com',
                   port: 587,
                   secure :false,
                   //service: 'Gmail',
                   auth: {
                     user :'jobportal2525@gmail.com',
                     pass :'shaifali2727'
                   },
                   tls: {
                     rejectUnauthorized :false
                   }
                 });
  
  const mailOptions = {
                   from :'"JobPortal" <jobportal916@gmail.com>',
                   to :req.body.email,
                   subject : 'Account Verification:',
                   text : '',
                   html :output
                 };
   transporter.sendMail(mailOptions, (error,info)=>{
                      if(error)
                      {
                        console.log(err);
                        req.flash('error',"something went wrong on our end.please register again");
                        res.redirect('/login');
                      }
                      else
                      {
                           console.log('Message sent: %s',info.messageId);
                           req.flash('success',"'Activation link sent to registered email ID. Please activate to log in.");
                           res.redirect('/login');
                      }
                 });
    }
  });
});
router.get("/activate/:token",function(req,res){
   const token = req.params.token;
   if(token){
   jwt.verify(token,JWT_KEY, function(err,decodedToken){
    if(err)
    {
         console.log(err);
         req.flash('error','Incorrect or expired link!please register again.');
         res.redirect('/register');
    }
    else
    {
      console.log("169");
      console.log(decodedToken.email);
      console.log(decodedToken.username);
         User.findOne({email:decodedToken.email}).then(foundUser=>{
              if(foundUser){
                     //user already exists
                     req.flash('error','Email ID already registered! Please log in.');
                     res.redirect('/login');
              }
              else{
                     const newUser = new User({
                     username:decodedToken.username,
                     email:decodedToken.email,
                     role:decodedToken.role,
                     password:decodedToken.password
                     });
                     if(newUser.role == "company")
                          {
                              newUser.isCompany =true;
                          }
                    newUser.isVerified = true;
                    bcryptjs.genSalt(10, (err, salt) => {
                      bcryptjs.hash(newUser.password, salt, (err, hash) => {
                          if (err) throw err;
                          newUser.password = hash;
                          newUser.save().then(user => {
                                  req.flash(
                                      'success_msg',
                                      'Account activated. You can now log in.'
                                  );
                                  res.redirect('/login');
                              })
                              .catch(err => console.log(err));
                      });
                  });
                     //create kr denge company ko
              }
         });
    }
});
   }
else
{
console.log("Account activation error");
}
});

  
router.get("/register/company", function (req, res) {
    res.render("company/companyregister");
  });
//company register page 
router.post("/register/company", upload.single('logo'), function (req, res) {
    cloudinary.uploader.upload(req.file.path, function(result) {
      // add cloudinary url for the image to the campground object under image property
      req.body.logo = result.secure_url;
      req.body.logoId = result.public_id;
      var newComp=new Company({
       // username:req.body.username,
        name: req.body.name,
       // email:req.body.email,
        tagline:req.body.tagline,
        description:req.body.description,
        logo:req.body.logo,
        logoId:req.body.logoId
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
            return res.render("company/companyregister");
        }
         res.redirect("/company/show");
           // res.render("company/companylogin");
      });
    });
});
 

router.get("/company/:id/myprofile",function(req,res){
  User.findById(req.params.id,function(err,foundUser){
    if(err)
    console.log(err);
    else{
      Company.find().where('createdBy.id').equals(foundUser._id).populate("posts").exec(function(err,foundCompany){
        if(err)
        console.log(err);
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
  //res.send("this is to edit company profile");
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
          //company.email = req.body.email;
          company.tagline = req.body.tagline;
          company.description = req.body.description;
          company.save();
          req.flash("success","Successfully Updated");
          res.redirect("/company/"+company.createdBy.id+"/myprofile");
        }
    }
  } )

});
//deete from all three schema
router.delete("/company/:id",middleware.checkCompanyOwnership,function(req,res){
  User.findById(req.params.id, function(err,user){
    if(err)
    {
      console.log(err);
     // req.flash("error",err.message);
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
      req.flash('success',"company delted successfully!");
      res.redirect("/");
    }
    catch(err)
    {
      if(err)
      {
        console.log(err);
       // req.flash('error'.err.message);
        return res.redirect("back");
      }
    }
      });
    });
  });
  });
 // res.send("delte for company");
});






router.get("/company/show",middleware.checkCompanyOwnership,function(req,res){

    res.render("company/show",{company:req.user});
  });


module.exports = router;


