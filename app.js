var express = require("express");
var app = express();
app.set("view engine", "ejs");
app.get("/", function (req, res) {
  res.render("landing");
});
app.get("/login", function (req, res) {
  res.send("hi this is login page");
});
app.get("/register",function(req,res){
  res.send("hi thi sis register page");
});
var port = process.env.PORT || 3000;
app.listen(port, function () {
  console.log("Game has started");
});
