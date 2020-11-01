const { Timestamp } = require("mongodb");
var mongoose = require("mongoose");


mongoose.connect("mongodb://localhost:27017/"+process.env.DATABASE_NAME, { useNewUrlParser: true, useUnifiedTopology: true });
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);

var quizSchema = new mongoose.Schema({
    title: String,
    time:{type:Number,default:15},
    toBeposted: {type:Boolean,default:false},
    posted: {type:Boolean,default:false},
    questions:[
            {
                type : mongoose.Schema.Types.ObjectId,
                ref: "Question"
            }
    ]
   
},
{
timestamps:true,});
module.exports = mongoose.model("Quiz",quizSchema);