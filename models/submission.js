mongoose = require("mongoose");


mongoose.connect("mongodb://localhost:27017/"+process.env.DATABASE_NAME, { useNewUrlParser: true, useUnifiedTopology: true });
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);

var submissionSchema = new mongoose.Schema({
    submittedBy: 
    {
        id:{
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        }
    },
    submissionOf:
    {
        id:{
            type: mongoose.Schema.Types.ObjectId,
            ref: "Quiz1"
        },
    },
    answer: String
});
module.exports = mongoose.model("Submission",submissionSchema);