var express = require('express');
var router = express.Router();
var csrf = require('csurf');
var passport = require('passport');
var Challenge = require('../models/challenge');
var User = require('../models/user');

var csrfProtection = csrf();
router.use(csrfProtection);

router.get('/logout', isLoggedIn, function(req, res, next){
    req.logout();
    res.redirect('/');
});

router.get('/dashboard', isLoggedIn, function(req, res, next){
    Challenge.find({ "participants.participantID": req.user.id }).exec(function(err, result){
        if(err){
            var messages = req.flash('error');
            req.flash('error', 'Error retrieving challenges from database');    
            res.render('dashboard/dashboard-home', {userId: req.user.id, challenges: {}, csrfToken: req.csrfToken(), messages: messages, hasErrors: messages.length > 0}); 
        }
        var challengeChunk = [];
        var chunkSize = 3;
        for (var i = 0; i < result.length; i += chunkSize) {
        challengeChunk.push(result.slice(i, i + chunkSize));
    }
        var messages = req.flash('error');
        res.render('dashboard/dashboard-home', {userId: req.user.id, challenges: challengeChunk, csrfToken: req.csrfToken(), messages: messages, hasErrors: messages.length > 0});                
    });
});

router.get('/profile/:userId', isLoggedIn, findUserProfile, function(req, res, next) {
    res.render('user/profile', {messages: {}, hasErrors: false});
});

router.get('/profile', isLoggedIn, function(req, res, next){
    var redirectUrl = "profile/" + req.user.id;
    res.redirect(redirectUrl);
});

router.use('/', notLoggedIn, function(req, res, next) {
    next();
})

router.get('/signup', function(req, res, next){
    var messages = req.flash('error');
    res.render('user/signup', {csrfToken: req.csrfToken(), messages: messages, hasErrors: messages.length > 0});
})

router.post('/signup', passport.authenticate('local.signup', {
    successRedirect: '/user/dashboard',
    failureRedirect: '/user/signup',
    failureFlash: true
}));

router.get('/signin', function(req, res, next){
    var messages = req.flash('error');
    res.render('user/signin', {csrfToken: req.csrfToken(), messages: messages, hasErrors: messages.length > 0});
});

router.post('/signin', passport.authenticate('local.signin', {
    successRedirect: '/user/dashboard',
    failureRedirect: '/user/signin',
    failureFlash: true
}));


module.exports = router;

function isLoggedIn(req, res, next){
    if (req.isAuthenticated()) {
        User.findOne({"_id" : req.user.id}, function(err, result){
            if(err){
                res.locals.username = "error retrieving username";
            }
            if(!result){
                res.locals.username = "error retrieving username";
            }
            res.locals.username = result.username;
            console.log('ping');
        });
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

function storeCurrentUser(req, res, next){
    User.findOne({"_id" : req.user.id}, function(err, result){
        if(err){
            res.locals.username = "Not Logged In";
            res.locals.userFull = "Not Logged In"
            next();
        }
        if(!result){
            res.locals.username = "Not Logged In";
            res.locals.userFull = "Not Logged In"
            next();
        }
        res.locals.username = result.username;
        res.locals.userFull = result;
        next();
    });
}

