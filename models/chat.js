var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var chatSchema = new Schema({
	message: String,
	username: String,
	to : { type: String, default: null},
	date: { type: Date, default: Date.now}
	
});

module.exports = mongoose.model('chat',chatSchema);

