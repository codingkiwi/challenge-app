//
// challenge-controller
// Contains helper functions and logic for actions that manipulate challenges
// Exports a function to be used as a contructor and then the member functions 
// invoked as middleware by passing (req, res, next)
//
//

var express = require('express');
var Challenge = require('../models/challenge');
var User = require('../models/user');

module.exports = function ChallengeController(){
    //create challenge from Challenge model and save to DB
    //ON ERROR - flash error and return to challenge creation
    //ON SUCCESS - redirect to dashboard
    this.storeCurrentUser = function(req, res, next){
        User.findOne({"_id" : req.user.id}, function(err, result){
            if(err){
                res.locals.username = "Not Logged In";
                next();
            }
            if(!result){
                res.locals.username = "Not Logged In";
                next();
            }
            res.locals.username = result.username;
            next();
        });
    }

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
                        participantRole: "admin",
                        participantUsername: res.locals.username
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
        Challenge.findOneAndRemove({"_id" : req.params.challengeId, "participants" : {
            $elemMatch : {participantID : req.user.id, participantRole : "admin"}
        }},function(err, challenge){
            if (err){
                console.log(err);
                res.redirect('/user/dashboard');
            }
            if (!challenge){
                console.log("no challenge found");
                req.flash('error', 'Action not allowed'); 
                res.redirect('/user/dashboard');
            }
            else {
                console.log("challenge deleted");
                res.redirect('/user/dashboard');
            }
        })
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
                    "participantRole" : "participant",
                    "participantUsername" : res.locals.username
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

