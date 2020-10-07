var express = require("express");
var app = express();

var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({
  extended: true
}));

// accept json 
app.use(bodyParser.json());

const mongoose = require("mongoose");
mongoose.connect("mongodb://localhost:27017/job_portal");

app.set("view engine", "ejs");

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

//Model
var Job = require("./models/job");
var Company= require("./models/company");
var Seeker = require("./models/seeker");


//GET Request
app.get("/", function (req, res) {
  res.render("landing");
});
app.get("/login", function (req, res) {
  res.render("login");
});
app.get("/login/company", function (req, res) {
  res.render("company/companylogin");
})
app.get("/login/seeker", function (req, res) {
  res.render("seeker/seekerlogin");
})

app.get("/register/company", function (req, res) {
  res.render("company/companyregister");
})
app.get("/register/seeker", function (req, res) {
  res.render("seeker/seekerregister");
})

app.get("/register", function (req, res) {
  res.render("register");
});

app.get("/login/seeker/companyname", function (req, res) {
  res.send("let us apply to my company and work ");
});
app.get("/login/company/createjob",function(req,res){
  res.render("company/createjob");
});
app.get("/login/company/viewjob",function(req,res){
    res.send("following are the jobs");
});

//POST Request
app.post("/login/company", function (req, res) {
  res.render("company/companyindex");
});
app.post("/login/seeker", function (req, res) {
  res.render("seeker/index");
});

app.post("/register/company", function (req, res) {

  var name=req.body.name;
  var email=req.body.email;
  var tagline=req.body.tagline;
  var description=req.body.description;
  var logo={ 
    //add karna hai
  } ;
  var newCompany = new Company({
    name,
    email,
    tagline,
    description,
    logo,
  });
  console.log(newCompany);
  res.send("company/companylogin");
})
app.post("/register/seeker", function (req, res) {
  res.send("seeker/seekerlogin");
})
app.post("/login/company/createjob",function(req,res){
  res.send("job created");
});


var port = process.env.PORT || 3000;
app.listen(port, function () {
  console.log("Server has started");
});
