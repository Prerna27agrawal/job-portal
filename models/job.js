var mongoose = require("mongoose");
mongoose.connect("mongodb://localhost:27017/"+process.env.DATABASE_NAME,
 { useNewUrlParser: true, useUnifiedTopology: true });
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);


var jobSchema = new mongoose.Schema({
    name: String,
    location: String,
    experience: Number,
    description: String,
    ctc:Number,
    employementType:String,
    ppo:Boolean,
    stipend:Number,
    reqSkills:[String],
    postedBy: {
      id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    username:String
  },
    appliedBy: [
      {
       isStatus: String,
       postedBy:
       {
       type: mongoose.Schema.Types.ObjectId,
       ref: "User",
       }
     }]
  },
  {
    timestamps:true, 
  });
  module.exports = mongoose.model("Job", jobSchema);
  module.exports = mongoose.model("Job2", jobSchema);