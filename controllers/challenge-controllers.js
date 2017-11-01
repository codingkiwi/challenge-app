var express = require('express');
var Challenge = require('../models/challenge');

module.exports = function ChallengeController(){
    this.createChallenge = function(){
        var newChallenge = new Challenge({
            name : req.body.name,
            description: req.body.description,
            startDate : req.body.startDate,
            endDate : req.body.endDate,
            creationDate : req.body.startDate,
            goal : req.body.goal,
            participants : [
                {
                    participantID: req.user.id,
                    participantName: req.user.name,
                    participantRole: "admin"
                }
            ],
            categories :  [req.body.categories]      
        });
        return newChallenge;
    }
};

