var express = require("express");
var app = express();

const mongoose = require("mongoose");
mongoose.connect("mongodb://localhost:27017/job_portal");

app.set("view engine", "ejs");

//Model
var Company= require("./models/company");
var Seeker = require("./models/seeker");
var Job = require("./models/job");

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
