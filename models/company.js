var mongoose = require("mongoose");
mongoose.Promise = require("bluebird");

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
    logoId :String,
    company_url:String,
    establishmentDate:String,
    linkedinId:String,
    facebookId:String,
    contactno:String,
   // password:String, //{type:String ,required:true, unique:true},
    // jobs:[
    //      {
    //         type: mongoose.Schema.Types.ObjectId,
    //         ref: "Job"
    //      }
    // ]
     posts: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Posts"
        }],
    createdBy: {
        id: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User"
      },
      username:String
    },
    subscribedBy:[{
            type : mongoose.Schema.Types.ObjectId,
            ref: "User"
        }]
});

//companySchema.plugin(passportLocalMongoose);

module.exports =  mongoose.model("Company", companySchema);