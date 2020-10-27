var mongoose = require("mongoose");
mongoose.Promise = require("bluebird");



mongoose.connect("mongodb://localhost:27017/jobportalnew", { useNewUrlParser: true, useUnifiedTopology: true });
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);

var chatroomSchema = new mongoose.Schema({
    name: {
        type: String,
        required: "Name is required!",
        unique:true
    },
});
module.exports = mongoose.model("Chatroom",chatroomSchema);