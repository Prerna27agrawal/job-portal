//"C:\Program Files\MongoDB\Server\4.4\bin\mongo.exe"
var express = require("express");
var app = express();
var bodyParser = require('body-parser');

//for keeping the cloud api secret
//https://www.npmjs.com/package/dotenv
require('dotenv').config()

//Model
var Job = require("./models/job");
var Company= require("./models/company");
var Seeker = require("./models/seeker");


//for image handling

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







app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({
  extended: true
}));
// accept json 
app.use(bodyParser.json());

const mongoose = require("mongoose");
const company = require("./models/company");
mongoose.connect("mongodb://localhost:27017/job_portal");

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

app.get("/register/company", function (req, res) {
  res.render("company/companyregister");
});

app.get("/register/seeker", function (req, res) {
  res.render("seeker/seekerregister");
});

app.get("/register", function (req, res) {
  res.render("register");
});

app.get("/login/seeker/companyname", function (req, res) {
  res.send("let us apply to my company and work ");
});

//jb company login kre toh usko job create karkee id mil jae company ki
app.get("/login/company/:id/createjob",function(req,res){
  Company.findById(req.params.id,function(err,company){
    if(err)
    console.log(err);
    else
    res.render("company/createjob",{Company: company});
  });
});

//saari jobs uss comapny ki show hongi
app.get("/login/company/:id/viewjob",function(req,res){
  Company.findById(req.params.id).populate("jobs").exec(function(err,foundcom){
    if(err)
    console.log(err);
    else
    {
      console.log(foundcom);
      res.render("company/viewjob",{Company: foundcom});
    }
  }); 
});



//POST Request
app.post("/login/seeker", function (req, res) {
  res.render("seeker/index");
});

//company register page 
app.post("/register/company", upload.single('logo'), function (req, res) {
  cloudinary.uploader.upload(req.file.path, function(result) {
    // add cloudinary url for the image to the campground object under image property
    req.body.newCompany.logo = result.secure_url;
    Company.create(req.body.newCompany, function(err, newcompanycreate) {
      if (err) {
         console.log(err);
        //req.flash('error', err.message);
        return res.redirect('back');
      }
      else
          res.render("company/companylogin",{Company: newcompanycreate});
    });
  });
//   Company.create(req.body.newCompany,function(err,newcompanycreate){
//     if(err) 
//     console.log(err);
//     else
//     {
//        res.render("company/companylogin",{Company: newcompanycreate});
//     }
//   });
});


app.post("/login/company/:id", function (req, res) {
  Company.findById(req.params.id,function(err,company){
    if(err)
    console.log(err);
    else
    res.render("company/companyindex",{Company: company});
  });
});

app.post("/register/seeker", function (req, res) {
  res.render("seeker/seekerlogin");
});

//after creating job post
app.post("/login/company/:id/createjob",function(req,res){
  Company.findById(req.params.id,function(err,company){
    if(err) 
    {
         console.log(err);
    }
    else{
      Job.create(req.body.job,function(err,job){
        if(err)
        console.log(err);
        else
        {
            company.jobs.push(job);
            company.save();
            console.log(company);
            res.redirect('/login/company/'+ company._id+'/viewjob');
        }
    });
  }
  });
});





var port = process.env.PORT || 3000;
app.listen(port, function () {
  console.log("Server has started");
});
