var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var todoSchema = new Schema({
	creator: {type: Schema.Types.ObjectId, ref: 'User'},
	content: String,
	completed: { type: Boolean, default: false},
	created: { type:Date, default: Date.now}
});

module.exports = mongoose.model('todo', todoSchema);