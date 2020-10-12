// "C:\Program Files\MongoDB\Server\4.4\bin\mongo.exe"


//for keeping the cloud api secret
//https://www.npmjs.com/package/dotenv
require('dotenv').config();

var express = require("express");
var app = express();
var bodyParser = require('body-parser');
const mongoose = require("mongoose");
var passport   = require("passport");
var LocalStrategy= require("passport-local");
var path= require("path");
var passportLocalMongoose = require('passport-local-mongoose'); 
var methodOverride = require("method-override");
var flash = require('connect-flash');


var Company = require("./models/company");
var Seeker = require("./models/seeker");
var Job = require("./models/job");
var User = require("./models/user");


var Companyroutes = require("./routes/company");
var Seekerroutes = require("./routes/seeker");
var Jobroutes = require("./routes/job");




mongoose.connect("mongodb://localhost:27017/jobportalnew", { useNewUrlParser: true ,useUnifiedTopology: true});
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname+"/public")));
app.use(methodOverride("_method"));
app.use(flash());

app.locals.moment= require("moment");


// ////////passport-authenticate
app.use(require("express-session")({
     secret: "It is a Job Portal",
     resave :false,
     saveUninitialized: false	
 }));
 app.use(passport.initialize());
 app.use(passport.session());
 passport.use(new LocalStrategy(User.authenticate())); 
 //passport.use(new LocalStrategy(Seeker.authenticate())); 
 //passport.serializeUser(Seeker.serializeUser());
 //passport.deserializeUser(Seeker.deserializeUser());
 passport.serializeUser(User.serializeUser());
 passport.deserializeUser(User.deserializeUser());
// ////////////////////////////////////////

//so that current user data is avialable to every route
app.use(function(req,res,next){
	res.locals.currentUser = req.user;
	res.locals.error = req.flash("error");
		res.locals.success = req.flash("success");
	next();
});


app.use(Companyroutes);
app.use(Seekerroutes);
app.use(Jobroutes);


//GET Request




var port = process.env.PORT || 3000;
app.listen(port, function () {
  console.log("Server has started");
});