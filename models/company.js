var mongoose = require("mongoose");
var passportLocalMongoose = require('passport-local-mongoose'); 

mongoose.connect("mongodb://localhost:27017/jobportal4", { useNewUrlParser: true, useUnifiedTopology: true });
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);

var companySchema = new mongoose.Schema({
    name: String,
    email: {type:String ,required:true, unique:true},
    tagline: String,
    description: String,
    logo : String,
    password: {type:String ,required:true, unique:true},
    jobs:[
         {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Job"
         }
    ]
});

companySchema.plugin(passportLocalMongoose);

module.exports =  mongoose.model("Company", companySchema);



