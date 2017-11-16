var express = require('express');
var router = express.Router();
var csrf = require('csurf');
var passport = require('passport');
var Challenge = require('../models/challenge');

var ChallengeController = require('../controllers/challenge-controllers');

var challengeController = new ChallengeController();
var csrfProtection = csrf();
router.use(csrfProtection);

router.use('/', isLoggedIn, challengeController.storeCurrentUser, function(req, res, next) {
    next();
})

router.get('/', function(req, res, next){
    res.redirect('/user/dashboard');
});

router.get('/remove-from-challenge/:userId/:challengeId', function(req, res, next){
    challengeController.removeFromChallenge(req, res, next);
});

router.get('/delete-challenge/:challengeId', function(req, res, next){
    challengeController.deleteChallenge(req, res, next);
});

router.get('/create-challenge', function(req, res, next){
    var messages = req.flash('error');
    res.render('challenges/create-challenge', {csrfToken: req.csrfToken(), messages: messages, hasErrors: messages.length > 0});
});

router.post('/create-challenge', challengeController.createChallenge)

router.get('/discover', function(req, res, next){
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
    
});

router.post('/add-progress', challengeController.addProgress);

router.get('/add-progress', function(req, res, next){
    res.redirect('/challenge/discover');
});

router.get('/join-challenge/:challengeId', challengeController.joinChallenge);

router.get('/:challengeId', function(req, res, next){
    Challenge.findOne({"_id": req.params.challengeId}).exec(function(err, result){
        if(err){
            res.redirect('challenge/discover');            
        }
        else {
            //sort progress listings by highest progression amount s
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
            for(var progressPoint of result.progress){
                var userAlreadyHasRanking = false;
                if (progressRankings.length >= 4){
                    break;
                }
                else{
                    for(var ranking of progressRankings){
                        if(ranking.progressParticipantName === progressPoint.progressParticipantName){
                            userAlreadyHasRanking = true;
                        }
                    }
                    if(!userAlreadyHasRanking){             
                        progressRankings.push(progressPoint);
                    }
                }
            }
            for(var i = 0; i < progressRankings.length; i++){
                progressRankings[i].rank = i+1;
                progressRankings[i].progressRemaining = (result.goalAmount - progressRankings[i].progressAmounts) < 0 ? 0 : (result.goalAmount - progressRankings[i].progressAmounts);
            }
            res.render('challenges/challenge-detail', {message: req.flash('error'), hasErrors: req.flash('errpr').length > 0, challenge: result, rankings: progressRankings, csrfToken: req.csrfToken()});
        }
    }); 
});

module.exports = router;

function isLoggedIn(req, res, next){
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect('/');
}

function notLoggedIn(req, res, next){
    if (!req.isAuthenticated()) {
        return next();
    }
    res.redirect('/');
}