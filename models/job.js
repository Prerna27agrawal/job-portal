var mongoose = require("mongoose");
mongoose.connect("mongodb://localhost:27017/jobportalnew",
 { useNewUrlParser: true, useUnifiedTopology: true });
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);


var jobSchema = new mongoose.Schema({
    name: String,
    //company: String,
    location: String,
    experience: String,
    description: String,
   //employementype: String,
    //createdAt: { type: Date, default: Date.now },
    appliedBy: [
       {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
      }
    ],
    postedBy: {
       id: {
         type: mongoose.Schema.Types.ObjectId,
         ref: "User"
     },
     username:String
   }
  });

  module.exports = mongoose.model("Job", jobSchema);