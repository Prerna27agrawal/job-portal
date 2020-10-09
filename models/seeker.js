var mongoose = require("mongoose");
var passportLocalMongoose = require('passport-local-mongoose'); 

mongoose.connect("mongodb://localhost:27017/jobportalnew", { useNewUrlParser: true, useUnifiedTopology: true });
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);


var seekerSchema = new mongoose.Schema({
    username:String,
    firstname: String,
    lastname: String,
    email: String ,
    country: String,
    status: String,
    gradyear: String,
    linkedinId:String ,
    // resume: String,
    skills: [String],
    password: String ,
    // appliedJobs:[{
    //   id: {
    //     type: mongoose.Schema.Types.ObjectId,
    //     ref: "Job"
    //   },
    // }]
  });
  
seekerSchema.plugin(passportLocalMongoose)

  module.exports = mongoose.model("Seeker", seekerSchema);