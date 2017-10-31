var mongoose = require('mongoose');

var challengeSchema = mongoose.Schema({
    name : {type: String, required: true},
    description : {type: String, required: true},
    startDate: {type: Date, required: true},
    endDate: {type: Date, required: true},
    creationDate: {type: Date, required: true},
    goal : {type: String, required: true},
    participants : {type : [], required: true},
    categories : {type: [String], required: true}
});

module.exports = mongoose.model('Challenge', challengeSchema);