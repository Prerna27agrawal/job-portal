// "C:\Program Files\MongoDB\Server\4.4\bin\mongo.exe"

//////////////////chaeck use of async and await used in update of profile
//////////delet se phle confirm krne ka

//for keeping the cloud api secret
//https://www.npmjs.com/package/dotenv

require('dotenv').config();
var express = require("express");
var app = express();
var bodyParser = require('body-parser');
const mongoose = require("mongoose");
mongoose.Promise = require("bluebird");
var passport   = require("passport");
var LocalStrategy= require("passport-local");
var path= require("path");
var passportLocalMongoose = require('passport-local-mongoose'); 
var methodOverride = require("method-override");
var flash = require('connect-flash');
const bcrypt = require('bcryptjs');
var async = require("async");

const dateTime = require("simple-datetime-formater");


//require the http module
const http = require("http").Server(app);

// require the socket.io module
const io = require("socket.io");

var Company = require("./models/company");
var Seeker = require("./models/seeker");
var Job = require("./models/job");
var User = require("./models/user");
var Posts =require("./models/posts");
var Quiz1 = require("./models/quiz1");
var Message = require("./models/message");

var Companyroutes = require("./routes/company");
var Seekerroutes = require("./routes/seeker");
var Jobroutes = require("./routes/job");
var Postsroutes = require("./routes/posts");
var Indexroutes = require("./routes/index");
var quizroutes = require("./routes/quiz");
var messageroutes = require("./routes/message");


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
 passport.use(new LocalStrategy({ usernameField: 'username' }, (username, password, done) => {
        //------------ User Matching ------------//
        User.findOne({
            username: username
        }).then(user => {
            if (!user) {
                return done(null, false, { message: 'This email ID is not registered' });
            }

            //------------ Password Matching ------------//
            bcrypt.compare(password, user.password, (err, isMatch) => {
                if (err) throw err;
                if (isMatch) {
                    return done(null, user);
                } else {
                    return done(null, false, { message: 'Password incorrect! Please try again.' });
                }
            });
        });
        })); 
passport.serializeUser(function (user, done) {
        done(null, user.id);
        });

 passport.deserializeUser(function (id, done) {
        User.findById(id, function (err, user) {
            done(err, user);
        });
    });
 //so that current user data is avialable to every route
app.use(function(req,res,next){
	res.locals.currentUser = req.user;
	res.locals.error = req.flash("error");
	res.locals.success = req.flash("success");
	next();
});

app.use(Indexroutes);
app.use(Companyroutes);
app.use(Seekerroutes);
app.use(Jobroutes);
app.use(Postsroutes);
app.use(quizroutes);
app.use(messageroutes);
//integrating socketio
socket = io(http);

socket.use(async (socket, next) => {
    try {
      socket.userId = req.user._id;
      next();
    } catch (err) {}
  });

  socket.on("connection", (socket) => {
    console.log("Connected: " + socket.userId);
  
    socket.on("disconnect", () => {
      console.log("Disconnected: " + socket.userId);
    });
  });
  

// //samjhna hai yeah abhi
// socket.on("connection",socket=>{
//     console.log("User Connected");

//     socket.on("disconnect",function(){
//         console.log("User disconnected");
//     });

//     //Someone is typing
//     socket.on("typing",data=>{
//         socket.broadcast.emit("notifyTyping",{
//              user: data.user,
//              message: data.message
//         });
//     });
     
//     //when soemone stops typing
//     socket.on("stopTyping", () => {
//         socket.broadcast.emit("notifyStopTyping");
//     });

//     socket.on("chat message", function(msg) {
//         console.log("message: " + msg);

//     //broadcast message to everyone in port:5000 except yourself.
//     socket.broadcast.emit("received", { message: msg });

//     //save chat to the database
//     connect.then(db => {
//         console.log("connected correctly to the server");
//         let chatMessage = new Chat({ message: msg, sender: "Anonymous" });

//         chatMessage.save();
//   });
// });

// });




var port = process.env.PORT || 3000;
http.listen(port, function () {
  console.log("Server has started");
});