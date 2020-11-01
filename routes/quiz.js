var express = require("express");
const {check, validationResult} = require('express-validator');

var router = express.Router();
var Company = require("../models/company");
var Seeker = require("../models/seeker");
var Job = require("../models/job");
var User = require("../models/user");
var Posts = require("../models/posts");
var Quiz = require("../models/quiz");
var Question = require("../models/question");
var Submission = require("../models/submission");
var FeedBack = require("../models/feedback");


var middleware = require("../middleware/index.js");
const { runInContext, isContext } = require("vm");
var path = require("path");
const { networkInterfaces } = require("os");
var async = require("async");
const { where } = require("../models/company");
const { time } = require("console");
////Multer config
router.use(express.static(__dirname+"/public"));


router.get("/quiz", middleware.checkAdminOwnership, function (req, res) {
        Quiz.find({}).exec(function (err, quiz) {
                Quiz.count({}).exec(function (err, count) {
                Quiz.countDocuments({ posted: true }, function (err, countposted) {
                        res.render("quiz/index", { quiz: quiz, count: count,countposted:countposted });
                });
                });
        });
});

router.post("/quiz/quizCount",middleware.checkAdminOwnership,function(req,res){
         User.find({}).exec(function(err,user){
                 if(err)
                 {
                         console.log(err);
                 }
                 else{
                         user.forEach(function(user){
                         user.QuizCount = req.body.QuizCount;
                         user.save();
                         });
                         res.redirect("/quiz");
                 }
         })
});

router.get("/quiz/new",middleware.checkAdminOwnership,function (req, res) {
        res.render("quiz/new");
});
router.post("/quiz/new",middleware.checkAdminOwnership,function (req, res) {
        var newQuiz = new Quiz({
                title: req.body.title,
                time:req.body.time
        })
        Quiz.create(newQuiz, function (err, quiz) {
                req.flash("success", "Successfully Created New Quiz");
                res.redirect("/quiz");
        });
});
router.post("/quiz/post/:quizid",middleware.checkAdminOwnership,function (req, res) {
        //to be posted n seeker side
        //make tobepost == true
        //posted == true
        User.findById({_id:req.user._id}).exec(function(err,user){
        Quiz.findById(req.params.quizid).exec(function (err, quiz) {
                console.log(quiz);
                Quiz.countDocuments({ posted: true }, function (err, count) {
                        console.log("count ")
                        console.log(count);
                        if (Number(count) == Number(user.QuizCount)) {
                                req.flash("error", "You have already posted maximum quiz");
                                res.redirect("/quiz");
                        }
                        else {
                                // quiz.posted = true;
                                quiz.toBeposted = true;
                                quiz.posted = true;
                                quiz.save();
                                console.log(quiz);
                                req.flash("success", "quiz posted");
                                res.redirect("/quiz");
                        }
                });
        });
});
});
router.post("/quiz/unpost/:quizid",middleware.checkAdminOwnership,function (req, res) {
        Quiz.findById(req.params.quizid).exec(function (err, quiz) {
                quiz.posted = false;
                quiz.toBeposted = false;
                quiz.save();
                req.flash("success", "quiz unposted");
                res.redirect("/quiz");
        });
});
router.delete("/quiz/delete/:quizid",middleware.checkAdminOwnership,function (req, res) {
        Quiz.findById(req.params.quizid, function (err, quiz) {
                console.log("remove");
                quiz.questions.forEach(function (question) {
                        Question.findOne({ "_id": question }).exec(function (err, foundQuestion) {
                                foundQuestion.remove();
                        });
                });
                quiz.remove();
                console.log("quiz reove");
                req.flash("success", "Removed Quiz");
                res.redirect("/quiz");
        });
});

router.get("/quiz/show", middleware.checkSeekerOwnership, function (req, res) {
        Quiz.find({ toBeposted: true }).populate('questions').exec(function (err, quiz) {
                console.log(quiz);
                Seeker.findOne({ "seekerBy.id": req.user._id }).exec(function (err, seeker) {
                        quiz.forEach(function (quiz) {
                                quiz.posted = true;
                                quiz.save();
                        });
                        res.render("seeker/quizindex", { quiz: quiz, seeker: seeker });
                });
        });
});

router.get("/quiz/show/:id",middleware.checkAdminOwnership,function (req, res) {
        Quiz.findById(req.params.id).populate('questions').exec(function (err, quiz) {
                res.render("quiz/quiz_index", { quiz: quiz });
        });
});

router.get('/quiz/:id/questions', middleware.checkAdminOwnership, function (req, res) {
        Quiz.findById(req.params.id, function (err, quiz) {
                res.render("quiz/newquestion", { quiz: quiz });
        });
});
//add a new question
router.post('/quiz/:id/questions', middleware.checkAdminOwnership, function (req, res) {
        // var num = req.params.num;
        var description = req.body.description;
        var correctAnswer = req.body.correctAnswer;
        var options = [req.body.opt1, req.body.opt2, req.body.opt3, req.body.opt4];
        //if(num == 1)
        // {
        newQuestion = new Question({
                description: description,
                correct: correctAnswer,
                options: options
        });
        Quiz.findById(req.params.id, function (err, quiz) {
                Question.create(newQuestion, function (err, question) {
                        quiz.questions.push(question);
                        quiz.save();
                        console.log(quiz);
                        req.flash("success", "Question added");
                        res.redirect("/quiz/show/" + quiz._id);
                });
        });
});
router.get("/quiz/:id/edit/:quesid", middleware.checkAdminOwnership, function (req, res) {
        //         var num = req.params.num;
        //       if(num == 1)
        //       {
        Quiz.findById(req.params.id, function (err, quiz) {
                Question.findById(req.params.quesid, function (err, foundQuestion) {
                        res.render("quiz/editquestion", { question: foundQuestion, quiz: quiz });
                });
        });
});

router.put('/quiz/:id/edit/:quesid', middleware.checkAdminOwnership, function (req, res) {
        // var num = req.params.num;
        // if(num == 1){
        Question.findById(req.params.quesid, function (err, foundQuestion) {
                if (err) {
                        console.log(err);
                        req.flash("error", err.message);
                        return res.redirect("back");
                }
                else {
                        var description = req.body.description;
                        var correctAnswer = req.body.correctAnswer;
                        var options = [req.body.opt1, req.body.opt2, req.body.opt3, req.body.opt4];
                        foundQuestion.description = description;
                        foundQuestion.correct = correctAnswer;
                        foundQuestion.options = options;
                        foundQuestion.save();
                        req.flash("success", "Question updated");
                        res.redirect("/quiz/show/" + req.params.id);
                }
        });

});
router.delete('/quiz/:id/delete/:quesid', middleware.checkAdminOwnership, function (req, res) {
        Question.findByIdAndRemove(req.params.quesid, function (err) {
                if (err) {
                        console.log(err);
                        req.flash("error", err.message);
                        return res.redirect("back");
                }
                res.redirect("/quiz/show/" + req.params.id);
        });
});

router.get("/quiz/:id/instructions", middleware.isLoggedInAdminSeeker, function (req, res) {
        Quiz.findOne({ "_id": req.params.id }).populate('questions').exec(function (err, quiz) {
                if (err) {
                        req.flash("error", err.message);
                        res.redirect("back");
                }
                else {
                        console.log(quiz);
                        res.render("seeker/quizinstructions", { quiz: quiz });
                }
        });
});


router.get("/quiz/:id/takequiz", middleware.isLoggedInAdminSeeker, function (req, res) {
        Quiz.findOne({ "_id": req.params.id }).populate('questions').exec(function (err, quiz) {
                if (err) {
                        req.flash("error", err.message);
                        res.redirect("back");
                }
                else {
                        console.log(quiz);
                        res.render("quiz/show", { quiz: quiz });
                }
        });
});

router.post("/quiz/:id/takequiz", middleware.checkSeekerOwnership, function (req, res) {
        Seeker.findOne({ "seekerBy.id": req.user._id }).exec(function (err, seeker) {
                var map = new Map();
                for (var key in req.body) {
                        item = req.body[key];
                        map.set(key, item);

                }
                let count = 0;
                let score = 0;
                map.forEach((values, keys) => {
                        var newSubmission = new Submission(
                                {
                                        "submissionOf.id": keys,
                                        answer: values,
                                        "submissionOfQuiz.id": req.params.id
                                }
                        )
                        Submission.create(newSubmission, function (err, submission) {
                                if (err) {
                                        console.log(err);
                                        req.flash("error", err.message);
                                        return res.redirect("back");
                                }
                                else {
                                        Question.findOne({ "_id": submission.submissionOf.id }, function (err, question) {
                                                console.log("question matching");
                                                console.log(question);
                                                if (String(submission.answer) == String(question.correct)) {
                                                        score++;
                                                }
                                                console.log("created");
                                                count++;
                                                console.log(count);
                                                console.log(map.size);
                                                submission.submittedBy.id = req.user._id;
                                                submission.save();
                                                if (count == map.size) {
                                                        re();
                                                }
                                        });

                                }


                        });
                });
                function re() {

                        console.log("after");
                        var newScore = {
                                score: score,
                                test_id: req.params.id
                        }
                        seeker.ScoreStatus.push(newScore);
                        seeker.ScoreCount++;
                        if (score > seeker.Score) {
                                seeker.Score = score;
                        }
                        seeker.save();
                        console.log(seeker);
                        console.log(seeker.Score);
                        req.flash("success", "Your response has been submitted");
                        res.redirect("/seeker/index");
                     
                }
               
        });
});
module.exports = router;

