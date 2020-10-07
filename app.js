//"C:\Program Files\MongoDB\Server\4.4\bin\mongo.exe"
var express = require("express");
var app = express();
var bodyParser = require('body-parser');


//Model
var Job = require("./models/job");
var Company= require("./models/company");
var Seeker = require("./models/seeker");

app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({
  extended: true
}));
// accept json 
app.use(bodyParser.json());

const mongoose = require("mongoose");
const company = require("./models/company");
mongoose.connect("mongodb://localhost:27017/job_portal");

//Image Upload- Mutler
// var fs = require('fs'); 
// var path = require('path');
// var multer = require('multer');  
// require('dotenv/config');
// var fs = require('fs'); 
// var path = require('path'); 
// var multer = require('multer'); 
// var storage = multer.diskStorage({ 
//     destination: (req, file, cb) => { 
//         cb(null, 'uploads') 
//     }, 
//     filename: (req, file, cb) => { 
//         cb(null, file.fieldname + '-' + Date.now()) 
//     } 
// }); 
// var upload = multer({ storage: storage }); 



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
app.post("/register/company", function (req, res) {
  //not useful as we already used newCompany in our register form to use as array
  // var name=req.body.name;
  // var email=req.body.email;
  // var tagline=req.body.tagline;
  // var description=req.body.description;
  // var logo= req.body.logo;
  // var password =req.body.password;
  // var newCompany = new Company({
  //   name,
  //   email,
  //   tagline,
  //   description,
  //   logo,
  //   password
  // });
  Company.create(req.body.newCompany,function(err,newcompanycreate){
    if(err) 
    console.log(err);
    else
    {
       res.render("company/companylogin",{Company: newcompanycreate});
    }
  });
 // console.log(newCompany);
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
