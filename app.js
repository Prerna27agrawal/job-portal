var express = require("express");
var app = express();

const mongoose = require("mongoose");
mongoose.connect("mongodb://localhost/job_portal");

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

//POST Request
app.post("/login/company", function (req, res) {
  res.render("createjob");
});
app.post("/login/seeker", function (req, res) {
  res.render("seeker/index");
});

app.post("/register/company", function (req, res) {
  res.send("Let's Hire");
})
app.post("/register/seeker", function (req, res) {
  res.send("Let's Apply");
})



var port = process.env.PORT || 3000;
app.listen(port, function () {
  console.log("Server has started");
});
