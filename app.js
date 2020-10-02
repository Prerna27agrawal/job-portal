var express = require("express");
var app = express();
app.set("view engine", "ejs");
app.get("/", function (req, res) {
  res.render("landing");
});
app.get("/login", function (req, res) {
  res.render("login");
});
app.get("/login/employee",function(req,res){
  res.render("employeeLogin");
})
app.get("/login/seeker",function(req,res){
  res.render("seekerLogin");
})

app.get("/register/employee",function(req,res){
  res.render("employeeRegister");
})
app.get("/register/seeker",function(req,res){
  res.render("seekerRegister");
})

app.get("/register",function(req,res){
  res.render("register");
});

app.post("/login/employee",function(req,res){
  res.send("Let's Hire");
});
app.post("/login/seeker",function(req,res){
  res.send("Let's Apply");
});

app.post("/register/employee",function(req,res){
  res.send("Let's Hire");
})
app.post("/register/seeker",function(req,res){
  res.send("Let's Apply");
})

var port = process.env.PORT || 3000;
app.listen(port, function () {
  console.log("Server has started");
});
