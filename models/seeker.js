var mongoose = require("mongoose");

mongoose.connect("mongodb://localhost:27017/job_portal", { useNewUrlParser: true, useUnifiedTopology: true });
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);


var seekerSchema = new mongoose.Schema({
    firstname: String,
    lastname: String,
    email: String,
    country: String,
    status: String,
    gradyear: String,
    linkedinId: String,
    resume: String,
    skills: [String],
    password: String,
  })

  module.exports = mongoose.model("Seeker", seekerSchema);