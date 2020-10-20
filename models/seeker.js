var mongoose = require("mongoose");
//var passportLocalMongooseS = require('passport-local-mongoose'); 

mongoose.connect("mongodb://localhost:27017/jobportalnew", { useNewUrlParser: true, useUnifiedTopology: true });
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);


var seekerSchema = new mongoose.Schema({
   // username:String,
    firstname:String,
    lastname: String,
    email: String ,
    status: String,
    gradyear: String,
    gender:String,
    linkedinId:String ,
    githubId:String,
    website:String,
    education:String,
    degree:String,
    stream:String,
    studyYear:String,
    cgpa:String,
    phone:String,
    country:String,
    state:String,
    city:String,
    resume: String,
    skills: [String],
    image :{type:String,default:"https://i0.wp.com/www.mvhsoracle.com/wp-content/uploads/2018/08/default-avatar.jpg?ssl=1"},
   // password: String ,
    // appliedJobs:[{
    //   id: {
    //     type: mongoose.Schema.Types.ObjectId,
    //     ref: "Job"
    //   },
    // }]
    seekerBy: {
      id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    username:String
  },
  projects:[{
          title:String,
          url:String,
          starttime:String,
          endtime:String,
          description:String,
  }]
  });
  
//seekerSchema.plugin(passportLocalMongooseS)

  module.exports = mongoose.model("Seeker", seekerSchema);