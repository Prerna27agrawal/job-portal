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
            ref: "Question"
        },
    },
    submissionOfQuiz:
    { 
        id:{
            type: mongoose.Schema.Types.ObjectId,
            ref: "Quiz"
        }
    },
    answer: String
});
//var submissionSchema2 = new mongoose.Schema({
//     submittedBy: 
//     {
//         id:{
//             type: mongoose.Schema.Types.ObjectId,
//             ref: "User"
//         }
//     },
//     submissionOf:
//     {
//         id:{
//             type: mongoose.Schema.Types.ObjectId,
//             ref: "Quiz1"
//         },
//     },
//     answer: String
// });var submissionSchema3 = new mongoose.Schema({
//     submittedBy: 
//     {
//         id:{
//             type: mongoose.Schema.Types.ObjectId,
//             ref: "User"
//         }
//     },
//     submissionOf:
//     {
//         id:{
//             type: mongoose.Schema.Types.ObjectId,
//             ref: "Quiz1"
//         },
//     },
//     answer: String
// });
// module.exports = mongoose.model("Submission1",submissionSchema);
module.exports = mongoose.model("Submission",submissionSchema);
//module.exports = mongoose.model("Submission3",submissionSchema3);
