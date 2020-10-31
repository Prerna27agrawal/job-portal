var mongoose = require("mongoose");
//var passportLocalMongooseS = require('passport-local-mongoose'); 

mongoose.connect("mongodb://localhost:27017/"+process.env.DATABASE_NAME, { useNewUrlParser: true, useUnifiedTopology: true });
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);


var seekerSchema = new mongoose.Schema({
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
    cgpa:mongoose.Decimal128,
    phone:String,
    country:String,
    state:String,
    city:String,
    resume: String,
    skills: [String],
    image :{type:String,default:"https://i0.wp.com/www.mvhsoracle.com/wp-content/uploads/2018/08/default-avatar.jpg?ssl=1"},
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
  }],
Score:{type:Number,default:0},
ScoreStatus:[{
         score:Number,
         test_id:String,
}]
//   test_title:String,

//   isattempted:{type:Boolean,default:false},
// }
//   Score: Number,
//   Score1: Number,
//   Score2: Number,
//   Score3:Number,
//   istest1:{type:Boolean,default:false},
//   istest2:{type:Boolean,default:false},
//   istest3:{type:Boolean,default:false},
  });
  
  module.exports = mongoose.model("Seeker", seekerSchema);