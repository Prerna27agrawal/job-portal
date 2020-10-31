var mongoose = require("mongoose");
//var passportLocalMongoose = require('passport-local-mongoose'); 

mongoose.connect("mongodb://localhost:27017/"+process.env.DATABASE_NAME, { useNewUrlParser: true, useUnifiedTopology: true });
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);

var QuestionSchema1 = new mongoose.Schema({
    description : {type:String, required:true},
    options:[String],
    correct: String,
        entered : {type:Date,default: Date.now}
    });
    
// var QuestionSchema2 = new mongoose.Schema({
//     description : {type:String, required:true},
//     options:[String],
//     correct: String,
//         entered : {type:Date,default: Date.now}
//     });

//     var QuestionSchema3 = new mongoose.Schema({
//         description : {type:String, required:true},
//         options:[String],
//         correct: String,
//             entered : {type:Date,default: Date.now}
//         });
module.exports =  mongoose.model("Question", QuestionSchema1);
// module.exports =  mongoose.model("Quiz3", QuestionSchema3);
// module.exports =  mongoose.model("Quiz2", QuestionSchema2);

