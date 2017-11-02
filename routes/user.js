var express = require('express');
var router = express.Router();
var csrf = require('csurf');
var passport = require('passport');
var Challenge = require('../models/challenge');

var csrfProtection = csrf();
router.use(csrfProtection);

router.get('/profile', isLoggedIn, function(req, res, next) {
    res.render('user/profile');
});

router.get('/logout', isLoggedIn, function(req, res, next){
    req.logout();
    res.redirect('/');
});

router.get('/dashboard', isLoggedIn, function(req, res, next){
    var messages = req.flash('error');
    Challenge.find({ "participants.participantID": req.user.id }).exec(function(err, result){
        if(err){
            req.flash('error', 'Error retrieving challenges from database');    
            res.render('dashboard/dashboard-home', {userId: req.user.id, challenges: result, csrfToken: req.csrfToken(), messages: {}, hasErrors: messages.length > 0}); 
        }
        res.render('dashboard/dashboard-home', {userId: req.user.id, challenges: result, csrfToken: req.csrfToken(), messages: messages, hasErrors: messages.length > 0});                
    });
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