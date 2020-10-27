var express = require("express");
var router = express.Router();
var Company = require("../models/company");
var  Seeker = require("../models/seeker");
var  Job = require("../models/job");
var User = require("../models/user");
var Posts =require("../models/posts");
var Quiz1 = require("../models/quiz1");
var FeedBack =require("../models/feedback");

var middleware = require("../middleware/index.js");
const { runInContext, isContext } = require("vm");
var path= require("path");
const { networkInterfaces } = require("os");
////Multer config
router.use(express.static(__dirname+"./public/"));


// router.get("/admin/index",middleware.checkAdminOwnership,function(req,res){
//         res.render("quiz/index",{admin:req.user}); 
// });

router.get("/quiz1/index",middleware.checkAdminOwnership,function(req,res){
         //show total number of questions on 1 page in count variable
         //create option for more questions
         //update existing question
         //delete existing question
Quiz1.find({}).exec(function(err,questions){
        Quiz1.count().exec(function(err,count){
                 //console.log(questions);
                res.render("quiz/quiz1index",{count:count,questions:questions});
                 });
         });

});
//get route for new question
router.get('/quiz1/questions',middleware.checkAdminOwnership,function(req,res){
        res.render("quiz/newquestion1");
});
//add a new question
router.post('/quiz1/questions',middleware.checkAdminOwnership,function(req,res){
       
        var description= req.body.description;
        var correctAnswer = req.body.correctAnswer;
        var wrongAnswers = [req.body.wrongAnswer1,req.body.wrongAnswer2,req.body.wrongAnswer3];
        newQuestion = new Quiz1({
                description:description,
                answers: { correct:correctAnswer,incorrect: wrongAnswers}
        }).save();
        // newQuestion.correctAnswer
        // if(req.body.opt1isCorrect == "Yes")
        // newQuestion.opt1.isCorrect=true;
        // if(req.body.opt2isCorrect == "Yes")
        // newQuestion.opt2.isCorrect=true;   
        // if(req.body.opt3isCorrect == "Yes")
        // newQuestion.opt3.isCorrect=true;
        // if(req.body.opt4isCorrect == "Yes")
        // newQuestion.opt4.isCorrect=true;
        // newQuestion.opt1.text=req.body.opt1text;
        // newQuestion.opt2.text=req.body.opt2text;
        // newQuestion.opt3.text=req.body.opt3text;
        // newQuestion.opt4.text=req.body.opt4text;
        // Quiz1.create(newQuestion,function(err,newQuestion){
        //         if (err) {
        //                 console.log(err);
        //                 req.flash("error",err.message);;
        //                 return res.redirect("back");
        //             }
                      req.flash("success","Question added");
                      res.redirect("/quiz1/index");
       // });
});
router.get("/quiz1/edit/:id",middleware.checkAdminOwnership,function(req,res){
        Quiz1.findById(req.params.id,function(err,foundQuestion){
            res.render("quiz/editquestion1",{question:foundQuestion});
        });
  //res.send("to edit");
});

router.put('/quiz1/edit/:id',middleware.checkAdminOwnership,function(req,res){
Quiz1.findById(req.params.id,function(err,foundQuestion){
        if (err) {
                console.log(err);
                req.flash("error",err.message);
                return res.redirect("back");
            }
            else{
                   // console.log("after put");
                var description= req.body.description;
               // console.log(description);
                var correctAnswer = req.body.correctAnswer;
                //console.log(correctAnswer);
                var wrongAnswers = [req.body.wrongAnswer1,req.body.wrongAnswer2,req.body.wrongAnswer3];
               //console.log(wrongAnswers);
                foundQuestion.description=description;
                foundQuestion.answers.correct = correctAnswer;
                foundQuestion.answers.incorrect = wrongAnswers;
                foundQuestion.save();
                // console.log(foundQuestion);
                // console.log("end of put");
                req.flash("success","Question updated");
                res.redirect("/quiz1/index");
           }
});
});
router.delete('/quiz1/delete/:id',middleware.checkAdminOwnership,function(req,res){
   Quiz1.findByIdAndRemove(req.params.id,function(err,foundQuestion){
        if (err) {
                console.log(err);
                req.flash("error",err.message);
                return res.redirect("back");
            }
        else{
                console.log("deleted question");
                req.flash("success","Deleted question");
                res.redirect("/quiz1/index");
        }
   });
//res.send("to delete");
});
router.get("/quiz1/showquiz",function(req,res){
     Quiz1.find({}).exec(function(err,questions){
     if(err)
     {
             req.flash("error",err.message);
             res.redirect("back");
     }
     else{
           res.render("quiz/show1",{questions:questions});
     }
});
});
router.post("/quiz1/showquiz",function(req,res){
        res.send("to calculate total");
        console.log(req.body);
        console.log(req.body.ans);
        console.log(typeof(req.body));
        console.log(typeof(req.body.ans));
        for (var key in req.body) {
                if (req.body.hasOwnProperty(key)) {
                  item = req.body[key];
                  console.log(key);
                  console.log(item);
                }
              }
});
module.exports = router;