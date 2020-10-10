var mongoose = require("mongoose");
//var passportLocalMongoose = require('passport-local-mongoose'); 

mongoose.connect("mongodb://localhost:27017/jobportalnew", { useNewUrlParser: true, useUnifiedTopology: true });
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);

var companySchema = new mongoose.Schema({
    //username:String,
    name: String,
//{type:String ,required:true, unique:true},
    email: String,
    //{type:String ,required:true, unique:true},
    tagline: String,
    description: String,
    logo : String,
   // password:String, //{type:String ,required:true, unique:true},
    // jobs:[
    //      {
    //         type: mongoose.Schema.Types.ObjectId,
    //         ref: "Job"
    //      }
    // ]
    createdBy: {
        id: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User"
      },
      username:String
    }
});

//companySchema.plugin(passportLocalMongoose);

module.exports =  mongoose.model("Company", companySchema);