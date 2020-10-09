// "C:\Program Files\MongoDB\Server\4.4\bin\mongo.exe"
var express = require("express");
var app = express();
var bodyParser = require('body-parser');
const mongoose = require("mongoose");
var passport   = require("passport");
var LocalStrategy= require("passport-local");
var path= require("path");
var passportLocalMongoose = require('passport-local-mongoose'); 


const Company = require("./models/company");
const Seeker = require("./models/seeker");
const Job = require("./models/job");

app.use(express.static(path.join(__dirname+"/public")));
//for keeping the cloud api secret
//https://www.npmjs.com/package/dotenv
require('dotenv').config();

////////////////for image handling
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
cloudinary.config({ 
  cloud_name: 'dhr7wlz2k', 
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});
//////////////////////////////////////////////

app.use(bodyParser.urlencoded({extended: true}));
// accept json 
app.use(bodyParser.json());
mongoose.connect("mongodb://localhost:27017/jobportalnew", { useNewUrlParser: true ,useUnifiedTopology: true});
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);
app.set("view engine", "ejs");
// app.use(bodyParser.urlencoded({extended: true}));
// // accept json 
// app.use(bodyParser.json());




////////passport-authenticate
app.use(require("express-session")({
    secret: "It is a Job Portal",
    resave :false,
    saveUninitialized: false	
}));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(Company.authenticate())); 
passport.use(new LocalStrategy(Seeker.authenticate())); 
passport.serializeUser(Seeker.serializeUser());
passport.deserializeUser(Seeker.deserializeUser());
passport.serializeUser(Company.serializeUser());
passport.deserializeUser(Company.deserializeUser());
////////////////////////////////////////



//GET Request
app.get("/", function (req, res) {
  res.render("landing");
});

app.get("/login", function (req, res) {
  res.render("login");
});

app.get("/login/company", function (req, res) {
  res.render("company/companylogin");
});

app.get("/login/seeker", function (req, res) {
  res.render("seeker/seekerlogin");
});

app.get("/register", function (req, res) {
  res.render("register");
});

app.get("/register/company", function (req, res) {
  res.render("company/companyregister");
});

app.get("/register/seeker", function (req, res) {
  res.render("seeker/seekerregister");
});

app.get("/company/show",function(req,res){

  res.render("company/show",{company:req.user});
});

app.get("/seeker/index",function(req,res){
  res.render("seeker/index",{seeker:req.user});
})

app.get("/seeker/:id/myprofile",function(req,res){
  Seeker.findById(req.params.id,function(err,foundSeeker){
    if(err){
      console.log(err);
    }else{
      res.render("seeker/profile",{foundSeeker:foundSeeker});
    }
  })
})

app.get("/seeker/:id/appliedJobs",function(req,res){
  Seeker.findById(req.params.id,function(err,foundSeeker){
    if(err)
    console.log(err);
    Job.find().where('appliedBy.id').equals(foundSeeker._id).exec(function(err,alljobs){
      if(err)
      console.log(err);
      else{
           res.render("seeker/appliedJobs",{seeker:foundSeeker,jobs: alljobs});
      }
    });
  })
})

// app.get("/login/seeker/companyname", function (req, res) {
//   res.send("let us apply to my company and work ");
// });

//jb company login kre toh usko job create karkee id mil jae company ki
app.get("/company/createjob",function(req,res){
       res.render("company/createjob");//,{Company: req.user});
  // });
});

//saari jobs uss comapny ki show hongi
app.get("/company/:id/viewjob",function(req,res){
  Company.findById(req.params.id,function(err,foundCompany){
    if(err)
    console.log(err);
    Job.find().where('postedBy.id').equals(foundCompany._id).exec(function(err,jobs){
      if(err)
      console.log(err);
      else{
           res.render("company/viewjob",{Company:foundCompany,jobs: jobs});
      }
    });
  });
  // Company.findById(req.params.id).populate("jobs").exec(function(err,foundcom){
  //   if(err)
  //   console.log(err);
  //   else
  //   {
  //     console.log(foundcom);
  //     res.render("company/viewjob",{Company: foundcom});
  //   }
  // }); 
});



//POST Request

//company register page 
app.post("/register/company", upload.single('logo'), function (req, res) {
  cloudinary.uploader.upload(req.file.path, function(result) {
    // add cloudinary url for the image to the campground object under image property
    req.body.logo = result.secure_url;
    var newComp=new Company({
      username:req.body.username,
      name: req.body.name,
      email:req.body.email,
      tagline:req.body.tagline,
      description:req.body.description,
      logo:req.body.logo
    });
    Company.register(newComp,req.body.password, function(err, newcompanycreate) {
      if (err) {
         console.log(err);
          return res.render("company/companyregister");
      }
      passport.authenticate('local')(req,res,function(){
       // console.log(newcompanycreate);
        res.redirect("/login/company");
         // res.render("company/companylogin");
      })
    });
  });
});

//NEW LOGIN POSTROUTE
//app.post("/login",middleware,callback)
app.post("/login/company",passport.authenticate("local",
  {
    //console.log(req.user);
    successRedirect: "/company/show",
    failureRedirect:"/login/company"
  }),function(req,res){
});



app.post("/register/seeker", function (req, res) {
  var newSeeker=new Seeker({
    username:req.body.username,
    firstname:req.body.firstname,
    lastname:req.body.lastname,
    email:req.body.email,
    country:req.body.country,
    status:req.body.status,
    gradyear:req.body.gradyear,
    linkedinId:req.body.linkedinId,
    skills:req.body.skills
  });

  Seeker.register(newSeeker,req.body.password, function(err, newseekercreate) {
    if (err) {
        console.log(err);
        return res.render("seeker/seekerregister");
    }
    passport.authenticate('local')(req,res,function(){
     console.log(newseekercreate);
      res.redirect("/login/seeker");
      //  res.render("company/companylogin");
    })
  });
});

app.post("/login/seeker",passport.authenticate("local",
  {
    // console.log(req.user);
    successRedirect: "/seeker/index",
    failureRedirect:"/login/seeker"
  }),function(req,res){
});


//old create job post route
//after creating job post
app.post("/login/company/createjob",function(req,res){
       console.log(req.body.job);
       req.body.job.postedBy = {
        id: req.user._id,
        username: req.user.username
      }
      console.log(req.body.job);
      console.log(req.body.job.postedBy);
      Job.create(req.body.job,function(err,job){
        if(err)
        console.log(err);
        else
        {
            console.log(job);
            res.redirect('/company/'+job.postedBy.id+'/viewjob');//,{jobs:job});
        }
});
});





var port = process.env.PORT || 3000;
app.listen(port, function () {
  console.log("Server has started");
});