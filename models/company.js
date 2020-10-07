var mongoose = require("mongoose");

mongoose.connect("mongodb://localhost:27017/job_portal", { useNewUrlParser: true, useUnifiedTopology: true });
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);

var companySchema = new mongoose.Schema({
    name: String,
    email: String,
    tagline: String,
    description: String,
    website: String,
    //image: {
        // data:Buffer,
        // contentType:String
    //},
    logo : String,
    imageId: String,
    password: String,
    jobsPosted:[ {
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Job"
        }
    }]
});

module.exports =  mongoose.model("Company", companySchema);






