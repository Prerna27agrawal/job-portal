var mongoose = require("mongoose");
//var passportLocalMongoose = require('passport-local-mongoose'); 

mongoose.connect("mongodb://localhost:27017/"+process.env.DATABASE_NAME, { useNewUrlParser: true, useUnifiedTopology: true });
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);

var QuestionSchema1 = new mongoose.Schema({
    description : {type:String, required:true},
    answers: {
        correct:String,
        incorrect:[String] 
    },
        entered : {type:Date,default: Date.now}
    });
    // opt1: 
    //     {
    //         text:{type :String, required:true},
    //         isCorrect:{type: Boolean,required:true,default:false}
    //     }
    // ,
    // opt2: 
    //     {
    //         text:{type :String, required:true},
    //         isCorrect:{type: Boolean,required:true,default:false}
    //     },
    // opt3: 
    //     {
    //         text:{type :String, required:true},
    //         isCorrect:{type: Boolean,required:true,default:false}
    //     },
    // opt4: 
    //     {
    //         text:{type :String, required:true},
    //         isCorrect:{type: Boolean,required:true,default:false}
    //     }

module.exports =  mongoose.model("Quiz1", QuestionSchema1);