var express = require("express");
var router = express.Router();
var async = require("async");
var crypto = require("crypto");

var Company = require("../models/company");
var User = require("../models/user");
const {check, validationResult} = require('express-validator');



var middleware = require("../middleware/index.js");
const { emitWarning } = require("process");

var passport   = require("passport");
var path= require("path");
router.use(express.static(__dirname+"./public/"));

//Multer and cloudinary config
var multer = require('multer');
var storage = multer.diskStorage({
    filename: function(req, file, callback) {
  callback(null, Date.now() + file.originalname);
}
});
var imageFilter = function (req, file, cb) {
  if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/i)) {
      return cb(new Error('Only image files are allowed!'), false);
  }
  cb(null, true);
};
var upload = multer({ storage: storage, fileFilter: imageFilter})
var cloudinary = require('cloudinary');
const company = require("../models/company");
cloudinary.config({ 
cloud_name: process.env.CLOUD_NAME, 
api_key: process.env.CLOUDINARY_API_KEY,
api_secret: process.env.CLOUDINARY_API_SECRET
});
////////////
router.post("/company/:id/images",middleware.checkCompanyOwnership,upload.single('image'),function(req,res){
    cloudinary.uploader.upload(req.file.path, function(result) {
      req.body.image = result.secure_url;
      req.body.imageId = result.public_id;
      var newimage={
          image:req.body.image,
          imageId:req.body.imageId,
          caption:req.body.caption,
      }
      Company.findById(req.params.id,function(err,foundcompany){
          if(err)
          {
            console.log(err);
            req.flash("error",err.message);
            return res.redirect("back");
          }
          else{
                foundcompany.photos.push(newimage);
                foundcompany.save();
                console.log("successfully added image");
                req.flash("success","Successfully added image");
                res.redirect('/company/'+foundcompany.createdBy.id+'/myprofile');
          }
      });
    });
  });

  module.exports = router;