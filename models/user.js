var mongoose = require("mongoose");
var passportLocalMongoose = require('passport-local-mongoose'); 

mongoose.connect("mongodb://localhost:27017/"+process.env.DATABASE_NAME, { useNewUrlParser: true, useUnifiedTopology: true });
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);

var userSchema = new mongoose.Schema({
    username:String,
   password:String, //{type:String ,required:true, unique:true},
   isCompany :{type: Boolean,default: false},
   isVerified :{type: Boolean,default: false},
   isFill :{type: Boolean,default: false},
   email: String,
   role:String,
   isAdmin: {type:Boolean,default:false},
   adminCode :{type: String,default:''},
      resetLink :{type: String,default:''}
});

userSchema.plugin(passportLocalMongoose);

module.exports =  mongoose.model("User", userSchema);