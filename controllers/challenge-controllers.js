var express = require('express');
var Challenge = require('../models/challenge');

module.exports = function ChallengeController(){
    this.createChallenge = function(req, res, next){
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
        newChallenge.save(function(err, result) {
            if (err) {
                console.log(err);
                req.flash('error', 'Data not valid');  
                var messages = req.flash('error');
                res.render('challenges/create-challenge', {csrfToken: req.csrfToken(), messages: messages, hasErrors: messages.length > 0})
            }
            else {
                res.redirect('/user/dashboard');
                console.log("redirected to dashboard")
            }
        });
    }
    return next();
};

