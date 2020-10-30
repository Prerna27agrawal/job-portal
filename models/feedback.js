var mongoose = require("mongoose");
mongoose.connect("mongodb://localhost:27017/"+process.env.DATABASE_NAME, { useNewUrlParser: true, useUnifiedTopology: true });
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);

var feedbackSchema = new mongoose.Schema({
    FirstName:String,
    LastName:String,
    email:String,
    message:String,
    createdAt:{type:Date , default: Date.now},
    isPosted: {type:Boolean,default:false}
});
module.exports = mongoose.model("FeedBack",feedbackSchema);