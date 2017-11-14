var mongoose = require('mongoose');

var participantSchema = mongoose.Schema({
    participantID : {type: mongoose.Schema.Types.ObjectId},
    participantRole: {type: String},
    participantUsername: {type: String}
});

var progressSchema = mongoose.Schema({
    progressParticipantId : {type: mongoose.Schema.Types.ObjectId},
    progressParticipantName : {type: String, required: true},
    progressDate : {type: Date, required: true},
    progressAmounts : {type: Number, required: true},
    progressLikes : {type: Number, required: true}
});

var challengeSchema = mongoose.Schema({
    name : {type: String, required: true},
    description : {type: String, required: true},
    startDate: {type: Date, required: true},
    endDate: {type: Date, required: true},
    creationDate: {type: Date, required: true},
    goalType : {type: String, required: true},
    goalAmount: {type: Number, required: true},
    participants : {type : [participantSchema], required: true},
    progress : {type: [progressSchema], required: false},
    categories : {type: [String], required: true}
});

module.exports = mongoose.model('Challenge', challengeSchema);