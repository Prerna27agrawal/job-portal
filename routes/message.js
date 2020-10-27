var express = require("express");
var router = express.Router();
var async = require("async");
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
var Quiz1= require("../models/quiz1");




router.post("/chatroom",function(req,res){
    var name=req.body.name;
  const nameRegex = /^[A-Za-z\s]+$/;
  if (!nameRegex.test(name)) throw "Chatroom name can contain only alphabets.";
  const chatroom = new Chatroom({
    name,
  });
  chatroom.save();
  req.flash("success","Chatroom created");
  res.redirect("back");
});











module.exports = router;