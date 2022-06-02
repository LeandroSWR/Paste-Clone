const express = require('express');
const router = express.Router();
const connection = require('../services/database');
const isAuth = require('../services/middleware');
const Paste = connection.models.Paste;
const hljs = require('highlight.js');

router.get('/pastes', function isAuth (req, res, next) { next(); }, async (req, res) => {
    var pastes = null;
    // If the user is authenticated
    if (req.isAuthenticated()) {
        // Show all his pastes and all public pastes
        // Get's all pastes that are either public of belong to the user
        pastes = await Paste.find({$or:[{owner: req.user._id}, {status: 'public'}]});
    }
    // If not
    else {
        // Only show public pastes
        pastes = await Paste.find({ status: 'public' }).lean();
    }

    res.render('pastes', {
        status: req,
        pasteList: pastes
    });
});

router.get('/pastes/:id', function isAuth (req, res, next) { next(); }, async (req, res) => {

    const paste = await Paste.findById(req.params.id);

    res.render('display', {
        status: req,
        paste: paste
    });
});

router.get('/create', isAuth(), (req, res) => {
    res.render('create', {
        status: req,
        user: req.user,
        languages: hljs.listLanguages()
    });
});

router.post('/create', isAuth(), async (req, res) => {
    try {
        req.body.author = req.user.displayName;
        req.body.owner = req.user._id;
        await Paste.create(req.body);
        res.redirect('/pastes');
    } catch (err) {
        console.error(err);
        res.render('error', {
            message_tag: 'Could not create paste..'
        });
    }
});

module.exports = router;