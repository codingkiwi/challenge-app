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
    console.log('redirected to dashboard');
});

router.get('/create-challenge', function(req, res, next){
    var messages = req.flash('error');
    res.render('challenges/create-challenge', {csrfToken: req.csrfToken(), messages: messages, hasErrors: messages.length > 0});
});

router.post('/create-challenge', function(req, res, next){
    challengeController.createChallenge(req, res, next);
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