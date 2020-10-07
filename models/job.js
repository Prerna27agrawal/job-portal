var mongoose = require("mongoose");

mongoose.connect("mongodb://localhost:27017/job_portal", { useNewUrlParser: true, useUnifiedTopology: true });
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);


var jobSchema = new mongoose.Schema({
    title: String,
    company: String,
    location: String,
    experience: String,
    description: String,
   // employementype: String,
    //createdAt: { type: Date, default: Date.now },
    //appliedBy: [{
      //id: {
  //       type: mongoose.Schema.Types.ObjectId,
  //       ref: "Seeker"
  //     }
  //   }],
  //   postedBy: {
  //     id: {
  //         type: mongoose.Schema.Types.ObjectId,
  //         ref: "Company"
  //     }
  // }
  });

  module.exports = mongoose.model("Job", jobSchema);