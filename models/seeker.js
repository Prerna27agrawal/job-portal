var mongoose = require("mongoose");
var passportLocalMongoose = require('passport-local-mongoose'); 

mongoose.connect("mongodb://localhost:27017/jobportal4", { useNewUrlParser: true, useUnifiedTopology: true });
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);


var seekerSchema = new mongoose.Schema({
    firstname: String,
    lastname: String,
    email: {type:String ,required:true, unique:true},
    country: String,
    status: String,
    gradyear: String,
    linkedinId: {type:String ,required:true, unique:true},
    resume: String,
    skills: [String],
    password: {type:String ,required:true, unique:true},
  })

  companySchema.plugin(passportLocalMongoose);

  module.exports = mongoose.model("Seeker", seekerSchema);