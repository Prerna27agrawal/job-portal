var mongoose = require("mongoose");

mongoose.connect("mongodb://localhost:27017/job_portal", { useNewUrlParser: true, useUnifiedTopology: true });
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);


var jobSchema = new mongoose.Schema({
    title: String,
    company: String,
    location: String,
    workexp: String,
    description: String,
    employementype: String,
    skillsRequired: [String],
    createdAt: { type: Date, default: Date.now }
  })

  module.exports = mongoose.model("Job", jobSchema);