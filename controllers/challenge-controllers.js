//
// challenge-controller
// Contains helper functions and logic for actions that manipulate challenges
// Exports a function to be used as a contructor and then the member functions 
// invoked as middleware by passing (req, res, next)
//
//

var express = require('express');
var Challenge = require('../models/challenge');

module.exports = function ChallengeController(){
    //create challenge from Challenge model and save to DB
    //ON ERROR - flash error and return to challenge creation
    //ON SUCCESS - redirect to dashboard
    this.createChallenge = function(req, res, next){
        //Form validation using express-validator
        req.checkBody('name', 'No challenge name entered').notEmpty();
        req.checkBody('description', 'No description entered').notEmpty();
        req.checkBody('startDate', 'Not a valid start date').notEmpty();
        req.checkBody('endDate', 'Not a valid end date').notEmpty();
        req.checkBody('goalType', 'No goal type entered').notEmpty();
        req.checkBody('goalAmount', 'Not a valid goal amount').notEmpty();
        req.checkBody('categories', 'No categories entered').notEmpty()
        var errors = req.validationErrors();
        if (errors) {
            var messages = [];
            errors.forEach(function(error) {
                messages.push(error.msg);
            });
            req.flash('error', messages);
            res.render('challenges/create-challenge', {csrfToken: req.csrfToken(), messages: messages, hasErrors: messages.length > 0})
        }
        else {
            var newChallenge = new Challenge({
                name : req.body.name,
                description: req.body.description,
                startDate : req.body.startDate,
                endDate : req.body.endDate,
                creationDate : req.body.startDate,
                goalType : req.body.goalType,
                goalAmount : req.body.goalAmount,
                participants : [
                    {
                        participantID: req.user.id,
                        participantRole: "admin"
                    }
                ],
                categories :  [req.body.categories]      
            });
            newChallenge.save(function(err, result) {
                if (err){
                    console.log(err);
                    req.flash('error', 'Error saving to database');  
                    var messages = req.flash('error');
                    res.render('challenges/create-challenge', {csrfToken: req.csrfToken(), messages: messages, hasErrors: messages.length > 0})
                }
                else {
                    res.redirect('/user/dashboard');
                    console.log("redirected to dashboard");
                }
            });
        }
    }

    this.deleteChallenge = function(req, res, next){
        Challenge.remove({"_id" : req.params.challengeId}, function(err, result){
            if (err){
                console.log(err);
                res.redirect('/user/dashboard');
            }
            else {
                res.redirect('/user/dashboard');
            }
        })
        console.log("challenge removed");
    }

    this.removeFromChallenge = function(req, res, next){
        Challenge.update({
            "_id" : req.params.challengeId
        },
        {
            $pull: {participants : { "participantID" : req.params.userId} },
        }, 
        function(err, result){
            if (err){
                console.log(err);
                res.redirect('/user/dashboard');
            }
            else {
                console.log("challenge removed");
                res.redirect('/user/dashboard');                
            }
        })
    }

    this.joinChallenge = function(req, res, next){
        Challenge.update({
            "_id" : req.params.challengeId
        },
        {
            $addToSet: {participants : 
                { 
                    "participantID" : req.user.id,
                    "participantRole" : "admin"
                }
            },
        }, 
        function(err, result){
            if (err){
                console.log(err);
                res.redirect('/user/dashboard');
            }
            else {
                console.log("user joined challenge" + req.params.challengeId);
                res.redirect('/user/dashboard');                
            }
        })
    }
};

