var express = require('express');
var router = express.Router();
var csrf = require('csurf');
var passport = require('passport');
var Challenge = require('../models/challenge');

var ChallengeController = require('../controllers/challenge-controllers');

var challengeController = new ChallengeController();
var csrfProtection = csrf();
router.use(csrfProtection);

router.use('/', isLoggedIn, function(req, res, next) {
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

router.post('/create-challenge', challengeController.storeCurrentUser, challengeController.createChallenge)

router.get('/discover', function(req, res, next){
    var messages = req.flash('error');
    Challenge.find({}).exec(function(err, result){
        if(err){
            req.flash('error', 'Error retrieving challenges from database'); 
            res.render('challenges/discover', {challenges: {}, messages: messages});
        }
        res.render('challenges/discover', {challenges: result, messages: messages});
    });
    
});

router.get('/:challengeId', function(req, res, next){
    Challenge.findOne({"_id": req.params.challengeId}).exec(function(err, result){
        if(err){
            res.redirect('/challenge/discover');            
        }
        else {
            res.render('challenges/challenge-detail', {challenge: result});
        }
    }); 
});

router.get('/join-challenge/:challengeId', challengeController.storeCurrentUser, challengeController.joinChallenge);

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