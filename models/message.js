var mongoose = require("mongoose");
mongoose.Promise = require("bluebird");



mongoose.connect("mongodb://localhost:27017/jobportalnew", { useNewUrlParser: true, useUnifiedTopology: true });
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);

var messageSchema = new mongoose.Schema({
    chatroom: {
        type: mongoose.Schema.Types.ObjectId,
        required: "Chatroom is required!",
        ref: "Chatroom",
      },
      user: {
        type: mongoose.Schema.Types.ObjectId,
        required: "Chatroom is required!",
        ref: "User",
      },
      message: {
        type: String,
        required: "Message is required!",
      },
    });
module.exports = mongoose.model("Message",messageSchema);