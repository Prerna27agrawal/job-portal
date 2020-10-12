var express = require("express");
var router = express.Router();


var Company = require("../models/company");
var  Seeker = require("../models/seeker");
var  Job = require("../models/job");
var User = require("../models/user");

var middleware = require("../middleware/index.js");



var passport   = require("passport");
//var LocalStrategy= require("passport-local");
var path= require("path");
//var passportLocalMongoose = require('passport-local-mongoose'); 



// ////////passport-authenticate
// router.use(require("express-session")({
//     secret: "It is a Job Portal company page",
//     resave :false,
//     saveUninitialized: false	
// }));
// router.use(passport.initialize());
// router.use(passport.session());
// passport.use(new LocalStrategy(Company.authenticate())); 
// //passport.use(new LocalStrategy(Seeker.authenticate())); 
// //passport.serializeUser(Seeker.serializeUser());
// //passport.deserializeUser(Seeker.deserializeUser());
// passport.serializeUser(Company.serializeUser());
// passport.deserializeUser(Company.deserializeUser());
// ////////////////////////////////////////

/////
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
const middlewareObj = require("../middleware/index.js");
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

 router.post("/login",passport.authenticate('local',{failureRedirect:'/login',failureFlash: 'Invalid username or password.'}),function(req,res){
        //console.log(req.user);
        //console.log(req.body);
     if(req.user.isCompany == true)
      {
            res.redirect("/company/show");
      }
      else
      {
       res.redirect("/seeker/index");
      }
 });


//  app.post('/login',
//   passport.authenticate('local'),
//   function(req, res) {
//     // If this function gets called, authentication was successful.
//     // `req.user` contains the authenticated user.
//     res.redirect('/users/' + req.user.username);
//   });
  
router.get("/register", function (req, res) {
    res.render("register");
  });
router.post("/register",function(req,res){
   var newUser = new User(
     {
       username:req.body.username
     });
     if(req.body.role == "company")
     {
         newUser.isCompany =true;
     }
     User.register(newUser,req.body.password,function(err,user){
       if(err)
       console.log(err);
       else
       {
          passport.authenticate("local")(req,res,function()
          {
               console.log(user);
               if(user.isCompany == true)
               {
                    res.redirect("/register/company");
               }
               else{
                       res.redirect("/register/seeker");
               }
          });
       }
     });
   
})
  
router.get("/register/company", function (req, res) {
    res.render("company/companyregister");
  });


  
//company register page 
router.post("/register/company", upload.single('logo'), function (req, res) {
    cloudinary.uploader.upload(req.file.path, function(result) {
      // add cloudinary url for the image to the campground object under image property
      req.body.logo = result.secure_url;
      var newComp=new Company({
       // username:req.body.username,
        name: req.body.name,
        email:req.body.email,
        tagline:req.body.tagline,
        description:req.body.description,
        logo:req.body.logo
      });
      newComp.createdBy = {
        id: req.user._id,
        username : req.user.username
      }
      Company.create(newComp,function(err, newcompanycreate) {
        if (err) {
           console.log(err);
            return res.render("company/companyregister");
        }
         res.redirect("/login");
           // res.render("company/companylogin");
      });
    });
  });
  


//   router.get("/login/company", function (req, res) {
//     res.render("company/companylogin");
//   });

//   router.post("/login/company",passport.authenticate('local',
//   {
//     //console.log(req.user);
//     successRedirect: "/company/show",
//     failureRedirect:"/login/company"
//   }),function(req,res){
// });



router.get("/company/show",middleware.checkCompanyOwnership,function(req,res){

    res.render("company/show",{company:req.user});
  });

module.exports = router;


