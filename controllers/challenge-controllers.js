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

    //Create challenge from Challenge model and save to DB
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
        req.checkBody('categories', 'No categories entered').notEmpty();
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
                image: req.body.defaultImage,
                participants : [
                    {
                        participantID: req.user.id,
                        participantRole: "admin",
                        participantUsername: res.locals.username
                    }
                ],
                categories :  [req.body.categories],
                progress: []      
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

    //retrieve challenge details and relevant participant information
    this.getChallengeDetails = function(req, res, next){

        Challenge.findOne({"_id": req.params.challengeId}).exec(function(err, result){
            if(err){
                res.redirect('/challenge/discover');            
            }
            else {
                if(!result){
                    res.redirect('/challenge/discover'); 
                }
                else{
                    if(result.progress){
                        //sort progress listings by highest progression amount
                        result.progress.sort(function(a, b){
                            var keyA = a.progressAmounts,
                                keyB = b.progressAmounts;
                            if(keyA < keyB) return 1;
                            if(keyA > keyB) return -1;
                            return 0;
                        });

                        //put top 5 unique progress logs in a new array, add rank number and progress remaining
                        //if goal is surpassed, show 0 remaining
                        var progressRankings = [];
                        var goalReachedFlag = false;

                        for(var progressPoint of result.progress){
                            var userAlreadyHasRanking = false;
                            if (progressRankings.length >= 5){
                                break;
                            }
                            else{
                                for(var ranking of progressRankings){
                                    if(ranking.progressParticipantId.equals(progressPoint.progressParticipantId)){
                                        userAlreadyHasRanking = true;
                                    }
                                }
                                if(!userAlreadyHasRanking){   
                                    if(progressPoint.progressParticipantId == req.user.id){
                                        progressPoint.progressThisUserFlag = "true";
                                    }      
                                    progressRankings.push(progressPoint);

                                    //check if progress is above goal amount
                                    if(progressPoint.progressAmounts >= result.goalAmount){
                                        goalReachedFlag = true;
                                    }
                                }
                            }
                        }

                        for(var i = 0; i < progressRankings.length; i++){
                            if(progressRankings[i].progressParticipantId == req.user.id){
                                progressRankings[i].progressThisUserFlag = true;
                            }  
                            else{

                            }
                            progressRankings[i].rank = i+1;
                            progressRankings[i].progressRemaining = (result.goalAmount - progressRankings[i].progressAmounts) < 0 ? 0 : (result.goalAmount - progressRankings[i].progressAmounts);
                        }

                        var userProgress = [];
                        for(var progressPoint of result.progress){
                            if(progressPoint.progressParticipantId.equals(req.user.id)){
                                userProgress.push(progressPoint);
                            }
                        }
                    }
 
                    //check if user is already participating in challenge
                    var challengeAlreadyJoined = false;
                    var challengeRole = null; 
                    var challengeAdmin = false;

                    for(var participant of result.participants){
                        if(participant.participantID == req.user.id){
                            challengeAlreadyJoined = true;
                            challengeRole = participant.participantRole;
                            if(challengeRole == "admin"){
                                challengeAdmin = true;
                            }
                        }
                    }
                    
                    //render challenge detail page depending on what goal type the challenge is
                    if(result.goalType == "getToGoal"){
                        console.log("render get to goal" + goalReachedFlag);
                        res.render('challenges/challenge-detail-getToGoal', {goalReachedFlag: goalReachedFlag, challengeRole: challengeRole, challengeAdmin: challengeAdmin, challengeJoined: challengeAlreadyJoined, participantNumber: result.participants.length, csrfToken: req.csrfToken(), userId: req.user.id, message: req.flash('error'), hasErrors: req.flash('error').length > 0, challenge: result, rankings: progressRankings, progress: userProgress, hasRankings: progressRankings.length > 0, hasProgress: userProgress.length > 0});
                    }
                    else if(result.goalType == "firstToGoal"){
                        console.log("render first to goal" + goalReachedFlag);
                        res.render('challenges/challenge-detail-firstToGoal', {goalReachedFlag: goalReachedFlag, challengeRole: challengeRole, challengeAdmin: challengeAdmin, challengeJoined: challengeAlreadyJoined, participantNumber: result.participants.length, csrfToken: req.csrfToken(), userId: req.user.id, message: req.flash('error'), hasErrors: req.flash('error').length > 0, challenge: result, rankings: progressRankings, progress: userProgress, hasRankings: progressRankings.length > 0, hasProgress: userProgress.length > 0});
                    }
                    else{
                        console.log("render highest to goal" + goalReachedFlag);
                        res.render('challenges/challenge-detail-highestGoal', {goalReachedFlag: goalReachedFlag, challengeRole: challengeRole, challengeAdmin: challengeAdmin, challengeJoined: challengeAlreadyJoined, participantNumber: result.participants.length, csrfToken: req.csrfToken(), userId: req.user.id, message: req.flash('error'), hasErrors: req.flash('error').length > 0, challenge: result, rankings: progressRankings, progress: userProgress, hasRankings: progressRankings.length > 0, hasProgress: userProgress.length > 0});                        
                    }
                }
            }
        }); 
    }

    this.getChallengeParticipants = function(req, res, next){
        Challenge.findOne({"_id": req.params.challengeId}).exec(function(err, result){
            if(err){
                res.redirect('/challenge/discover');            
            }
            else {
                if(!result){
                    res.redirect('/challenge/discover'); 
                }
                else{
                    var challengeAdmin = false;
                    
                    for(var participant of result.participants){
                        if(participant.participantID == req.user.id){
                            challengeAlreadyJoined = true;
                            challengeRole = participant.participantRole;
                            if(challengeRole == "admin"){
                                challengeAdmin = true;
                            }
                        }
                    }
                    res.render('challenges/challenge-participants', {participants: result.participants, challengeName: result.name, challengeId: result._id, challengeAdmin: challengeAdmin});
                }
            }
        });        
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

    this.getDiscoveryChallenges = function(req, res, next){
        var messages = req.flash('error');
        Challenge.find({}).exec(function(err, result){
            if(err){
                req.flash('error', 'Error retrieving challenges from database'); 
                res.render('challenges/discover', {challenges: {}, messages: messages});
            }
            var challengeChunk = [];
            var chunkSize = 3;
            for (var i = 0; i < result.length; i += chunkSize) {
                challengeChunk.push(result.slice(i, i + chunkSize));
            }
            res.render('challenges/discover', {challenges: challengeChunk, messages: messages});
        });
        
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

    this.addProgress = function(req, res, next){
        req.checkBody('amount', 'Not a valid amount').notEmpty();
        var errors = req.validationErrors();
        if(errors){
            errors.forEach(function(error) {
                req.flash('error', error);
            });
            url = '/challenge/' + req.body.challengeId;
            //TODO: fix redirect to render so errors are displayed
            res.redirect(url);
        }
        else{
            Challenge.update({
                "_id" : req.body.challengeId
            },
            {
                $push: {progress:
                    {
                        "progressParticipantId" : req.user.id,
                        "progressParticipantName" : res.locals.username,
                        "progressDate" : new Date(),
                        "progressAmounts" : req.body.amount,
                        "progressLikes" : 0
                    }
                },
            },
            function(err, result){
                if (err){
                    console.log(err);
                    res.redirect('/user/dashboard');
                }
                else {
                    url = '/challenge/' + req.body.challengeId;
                    res.redirect(url);               
                }
            })
        }

    }

    this.removeProgress = function(req, res, next){
        Challenge.update({
            "_id" : req.params.challengeId
            },
            {
                $pull: {progress:
                    {
                        "_id" : req.params.progressId
                    }
                }
            },
            function(err, result){
                if(err){
                    console.log(err);
                    url = '/challenge/' + req.params.challengeId
                    res.redirect(url)
                }
                else {
                    url = '/challenge/' + req.params.challengeId
                    res.redirect(url)
                }
            }
        )
    }

    //retrieve challenge details and relevant participant information
    this.editChallenge = function(req, res, next){

        Challenge.findOne({"_id": req.params.challengeId}).exec(function(err, result){
            if(err){
                res.redirect('/challenge/discover');            
            }
            else {
                if(!result){
                    res.redirect('/challenge/discover'); 
                }
                else{    
                    //check if user is participating in challenge & admin
                    var challengeAlreadyJoined = false;
                    var challengeRole = null; 

                    for(var participant of result.participants){
                        if(participant.participantID == req.user.id){
                            challengeAlreadyJoined = true;
                            challengeRole = participant.participantRole;
                            if(challengeRole == "admin"){
                                challengeAdmin = true;
                            }
                        }
                    }

                    if((challengeAlreadyJoined == false) || challengeRole != "admin"){
                        url = '/challenge/' + req.params.challengeId;
                        res.redirect(url); 
                    }
                    else{
                        res.render('challenges/challenge-edit', {csrfToken: req.csrfToken(), userId: req.user.id, message: req.flash('error'), hasErrors: req.flash('error').length > 0, challenge: result});
                    }
                }
            }
        }); 
    }

    this.submitChallengeEdits = function(req, res, next){
        //Form validation using express-validator
        req.checkBody('name', 'No challenge name entered').notEmpty();
        req.checkBody('description', 'No description entered').notEmpty();
        req.checkBody('goalType', 'No goal type entered').notEmpty();
        req.checkBody('goalAmount', 'Not a valid goal amount').notEmpty();
        req.checkBody('categories', 'No categories entered').notEmpty()
        var errors = req.validationErrors();
        if (errors) {
            var messages = [];
            errors.forEach(function(error) {
                messages.push(error.msg);
            });
            //should redirect to correct challenge...
            res.render('challenges/create-challenge', {csrfToken: req.csrfToken(), messages: messages, hasErrors: messages.length > 0})
        }
        else{
            Challenge.update({
                "_id" : req.params.challengeId
                },
                {
                    $set:
                    {
                        name : req.body.name,
                        description: req.body.description,
                        goalType : req.body.goalType,
                        goalAmount : req.body.goalAmount,
                        categories :  [req.body.categories]
                    }
                },
                function(err, result){
                    if(err){
                        console.log(err);
                        url = '/challenge/' + req.params.challengeId
                        res.redirect(url)
                    }
                    else {
                        url = '/challenge/' + req.params.challengeId
                        res.redirect(url)
                    }
                }
            )
        }
    }
};

