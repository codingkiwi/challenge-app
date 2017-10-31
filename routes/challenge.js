var express = require('express');
var router = express.Router();
var csrf = require('csurf');
var passport = require('passport');

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