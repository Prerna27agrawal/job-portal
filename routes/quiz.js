var express = require("express");
var router = express.Router();
var Company = require("../models/company");
var  Seeker = require("../models/seeker");
var  Job = require("../models/job");
var User = require("../models/user");
var Posts =require("../models/posts");
var Quiz = require("../models/quiz");
var Question = require("../models/question");
var Submission = require("../models/submission");
var FeedBack =require("../models/feedback");

var middleware = require("../middleware/index.js");
const { runInContext, isContext } = require("vm");
var path= require("path");
const { networkInterfaces } = require("os");
var async = require("async");
const { where } = require("../models/company");
////Multer config
router.use(express.static(__dirname+"./public/"));




router.get("/quiz",middleware.checkAdminOwnership,function(req,res){
        Quiz.find({}).exec(function(err,quiz){
            Quiz.count({}).exec(function(err,count){
        res.render("quiz/index",{quiz:quiz,count:count}); 
            });
    });
    });

    
router.get("/quiz/new",function(req,res){
     res.render("quiz/new");
});
router.post("/quiz/new",function(req,res){
        var newQuiz = new Quiz({
                title: req.body.title
        })
        Quiz.create(newQuiz,function(err,quiz){
           req.flash("success", "Successfully Created New Quiz");
           res.redirect("/quiz");
        });
});
router.post("/quiz/post/:quizid",function(req,res){
       //to be posted n seeker side
       //make tobepost == true
       //posted == true
       Quiz.findById(req.params.quizid).exec(function(err,quiz){
               console.log(quiz);
               Quiz.countDocuments({posted:true},function(err,count){
                console.log("count ")       
                console.log(count);
                       if(count == 3)
                       {
                               req.flash("error","You have already posted 3 quiz");
                               res.redirect("/quiz");
                       }
                       else{
             // quiz.posted = true;
                                quiz.toBeposted =true;
                                quiz.posted = true;
                                quiz.save();
                                console.log(quiz);
                                req.flash("success","quiz posted");
                                res.redirect("/quiz");
                       }
               });
       });
});
router.post("/quiz/unpost/:quizid",function(req,res){
        Quiz.findById(req.params.quizid).exec(function(err,quiz){
                quiz.posted = false;
                quiz.toBeposted =false;
                quiz.save();
                req.flash("success","quiz unposted");
              res.redirect("/quiz");
         });
});
router.delete("/quiz/delete/:quizid",function(req,res){
        Quiz.findById(req.params.quizid,function(err,quiz){
                console.log("remove");      
                quiz.questions.forEach(function(question){
                            Question.findOne({"_id":question}).exec(function(err,foundQuestion){
                                        foundQuestion.remove();
                            });
                      });
                      quiz.remove();
                      console.log("quiz reove");
                      req.flash("success","Removed Quiz");
                      res.redirect("/quiz");
        });

 // res.send("to delte");
        // Quiz.findById(req.params.quizid).exec(function(err,quiz){
        //         quiz.posted = true;
        //         quiz.toBeposted =true;
        //         quiz.save();
        //  });
});

router.get("/quiz/show",middleware.checkSeekerOwnership,function(req,res){
        Quiz.find({toBeposted:true}).populate('questions').exec(function(err,quiz){
                console.log(quiz);
                   Seeker.findOne({"seekerBy.id":req.user._id}).exec(function(err,seeker){
                           quiz.forEach(function(quiz){
                                quiz.posted=true;
                                quiz.save();
                           });
                   res.render("seeker/quizindex",{quiz:quiz,seeker:seeker});
                   });
        });        
});

router.get("/quiz/show/:id",function(req,res){
          Quiz.findById(req.params.id).populate('questions').exec(function(err,quiz){
                res.render("quiz/quiz_index",{quiz:quiz});
          });
});

router.get('/quiz/:id/questions',middleware.checkAdminOwnership,function(req,res){
        Quiz.findById(req.params.id,function(err,quiz){ 
        res.render("quiz/newquestion",{quiz:quiz});
        });  
 });
//add a new question
router.post('/quiz/:id/questions',middleware.checkAdminOwnership,function(req,res){
      // var num = req.params.num;
        var description= req.body.description;
        var correctAnswer = req.body.correctAnswer;
        var options = [req.body.opt1,req.body.opt2,req.body.opt3,req.body.opt4];
        //if(num == 1)
       // {
                newQuestion = new Question({
                        description:description,
                        correct:correctAnswer,
                        options: options
                });
                Quiz.findById(req.params.id,function(err,quiz){
                    Question.create(newQuestion,function(err,question){
                      quiz.questions.push(question);
                      quiz.save();
                      console.log(quiz);
                      req.flash("success","Question added");
                      res.redirect("/quiz/show/"+quiz._id);
                });
        });
});
router.get("/quiz/:id/edit/:quesid",middleware.checkAdminOwnership,function(req,res){
//         var num = req.params.num;
//       if(num == 1)
//       {
        Quiz.findById(req.params.id,function(err,quiz){
        Question.findById(req.params.quesid,function(err,foundQuestion){
                res.render("quiz/editquestion",{question:foundQuestion,quiz:quiz});
            });
        });
});

router.put('/quiz/:id/edit/:quesid',middleware.checkAdminOwnership,function(req,res){
       // var num = req.params.num;
       // if(num == 1){
               Question.findById(req.params.quesid,function(err,foundQuestion){
                        if (err) {
                                console.log(err);
                                req.flash("error",err.message);
                                return res.redirect("back");
                            }
                            else{
                                var description= req.body.description;
                                var correctAnswer = req.body.correctAnswer;
                        var options = [req.body.opt1,req.body.opt2,req.body.opt3,req.body.opt4];
                                foundQuestion.description=description;
                                foundQuestion.correct = correctAnswer;
                                foundQuestion.options= options;
                                foundQuestion.save();
                                req.flash("success","Question updated");
                      res.redirect("/quiz/show/"+req.params.id);
                           }            
                        });
        
});
router.delete('/quiz/:id/delete/:quesid',middleware.checkAdminOwnership,function(req,res){
        Question.findByIdAndRemove(req.params.quesid,function(err){
                if (err) {
                        console.log(err);
                        req.flash("error",err.message);
                        return res.redirect("back");
                    }
                res.redirect("/quiz/show/"+req.params.id);
        });
});
router.get("/quiz/:id/takequiz",middleware.isLoggedIn,function(req,res){
                Quiz.findOne({"_id":req.params.id}).populate('questions').exec(function(err,quiz){
                        if(err)
                        {
                                req.flash("error",err.message);
                                res.redirect("back");
                        }
                        else{
                               console.log(quiz);
                              res.render("quiz/show",{quiz:quiz});
                        }
                   });
                });
       
router.post("/quiz/:id/takequiz",middleware.checkSeekerOwnership,function(req,res){
        Seeker.findOne({"seekerBy.id":req.user._id}).exec(function(err,seeker){
         var map = new Map();
        for (var key in req.body) {
                item = req.body[key];
                map.set(key,item);
        
        }
         let count=0;
         let score=0;
                map.forEach((values,keys)=>{
                        var newSubmission = new Submission(
                                {
                                "submissionOf.id": keys,
                                 answer: values,
                                "submissionOfQuiz.id":req.params.id
                                }
                        )
                        Submission.create(newSubmission, function(err,submission){
                                if (err) {
                                console.log(err);
                                req.flash("error", err.message);
                                return res.redirect("back");
                                }
                                else{
                                        Question.findOne({"_id":submission.submissionOf.id},function(err,question){
                                                console.log("question matching");
                                                console.log(question);
                                         if(String(submission.answer) == String(question.correct)){
                                                 score++;
                                          }
                                         console.log("created");
                                         count++;
                                         console.log(count);
                                         console.log(map.size);
                                         submission.submittedBy.id =req.user._id;
                                         submission.save();
                                         if(count == map.size)
                                            {
                                               re();
                                              }
                                        });
                                        
                                }
                                

                        }); 
        });
                function re(){

                console.log("after");
                var newScore ={
                        score:score,
                        test_id:req.params.id
                }
                seeker.ScoreStatus.push(newScore);
                if(score > seeker.Score)
                {
                        seeker.Score = score;
                }
                seeker.save();
                console.log(seeker);
                console.log(seeker.Score);
                req.flash("success","Your response has been submitted");
                res.redirect("/seeker/index");
                // Member.aggregate([
                //         { "$match": { "_id": userid } },
                //         { "$unwind": "$friends" },
                //         { "$match": { "friends.status": 0 } }],
                //         function( err, data ) {
                      
                //           if ( err )
                //             throw err;
                      
                //           console.log( JSON.stringify( data, undefined, 2 ) );
                      
                //         }
                //       );
                // Seeker.aggregate([{"$match":{"seekerBy.id":req.user._id}},{$project:{len:{$size: '$ScoreStatus'}}}],function(err,data){
                //       console.log( JSON.stringify( data, undefined, 2 ) );       
                //         console.log(data);
                // });
               //console.log("len of array");
               //console.log(len);
        //        var len=15;
        //         var avg=0;
        //         seeker.ScoreStatus.forEach(function(test,index){
        //            avg = avg+ test.score;
        //            console.log("avg");
        //            console.log(avg);
        //            if(index == (len-1))
        //            {
        //                     var avg_act = calculate(avg,len);
        //                     console.log("actual average");
        //                     console.log(avg_act);
        //                       seeker.Score = avg_act;
        //                       seeker.save();
        //            }
        //         });
              
               // res.redirect("/score/"+req.params.id+"/cal/5f99694ad045515b9836b31d");
                }
                // function calculate(avg, len)
                // {
                //         return (avg/len);
                // }
        });
});
module.exports = router;

        
// router.get("/score/:quizid/cal/:userid",function(req,res){
//                 Seeker.findOne({"seekerBy.id":req.params.userid}).exec(function(err,seeker){
//                         let score=0;
//                         let count=0;
//                 Submission.find({"submittedBy.id":req.params.userid,"submissionOfQuiz.id":req.params.quizid}).populate('submissionOf').
//                 exec(function(err,submission){
//                         console.log(submission);
//                         // Submission.countDocuments({}).exec(function(err,count){
//                              submission.forEach(function(submission,index){
//                                         count++;
//                                      Question.findOne({"_id":submission.submissionOf.id}).exec(function(err,question){
//                                     if(String(submission.answer) == String(question.correct)){
//                                             score++;
//                                             if(index == (count-1)){
//                                                    check();
//                                               }  
//                                     } 
//                                 });
//                              });
//                 function check(){
//                         var newScore ={
//                                 score:score,
//                                 test_id:req.params.quizid
//                         }
//                         seeker.ScoreStatus.push(newScore);
//                         console.log(seeker);
//                         seeker.save();
//                         req.flash("success","Your response has been submitted");
//                         res.redirect("/login");
//                  }
//                 });
//              });
//         });


  // console.log(key);
                // console.log(typeof(map.get(key)));
                // console.log(map.get(key));
        //         var myDocument = Quiz1.findOne({"_id":"key","answers.correct":"map.get(key)"});
        //         if(myDocument)
        //         {
        //                 console.log(score);
        //                 score++;
        //         }
//   Quiz1.find({_id:key,"answers.correct":item}).exec(function(err,Question){
        //             console.log(Question);
        //             i++;
        //         //   console.log('check');
        // //           if(Question == 1)
        // //           {
        // //                   console.log("hi");
        // //                   score++;
        // //                   console.log(score);
        // //           }
        // // console.log(score);

        //         //   score= Number(score) + Number(Question);
        //         //   console.log(typeof(Question));
        //         //   if( String(Question.answers.correct) == String(item) )
        //         //   {
        //         //           console.log("hi");
        //         //           score++;
        //         //   }
        //    });
        // console.log(score);