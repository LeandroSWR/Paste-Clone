const express = require('express');
const router = express.Router();
const connection = require('../services/database');
const isAuth = require('../services/middleware');
const Paste = connection.models.Paste;
const hljs = require('highlight.js');
const mongoose = require('mongoose');

// Display a list of all the pastes
router.get('/pastes', function f (req, res, next) { next(); }, async (req, res) => {
    var pastes = null;
    // If the user is authenticated
    if (req.isAuthenticated()) {
        // Show all his pastes and all public pastes
        // Get's all pastes that are either public of belong to the user
        pastes = await Paste.find({$or:[{owner: req.user.googleID}, {status: 'public'}]});
    }
    // If not
    else {
        // Only show public pastes
        pastes = await Paste.find({ status: 'public' }).lean();
    }

    // Renders the pastes ejs file
    res.render('pastes', {
        status: req,
        pasteList: pastes
    });
});

// Renders a specific paste in detail
router.get('/pastes/:id', function f (req, res, next) { next(); }, async (req, res) => {
    // Get the paste with the given id
    const paste = await Paste.findById(req.params.id);
    
    // Display it
    res.render('display', {
        status: req,
        paste: paste
    });
});

// Edit a specific paste by ID
router.get('/edit/:id', isAuth(), async (req, res) => {
    // Finds the paste with the given ID
    var paste = await Paste.findById(req.params.id);

    // Render the edit window for the paste
    res.render('edit', {
        status: req,
        user: res.user,
        paste: paste,
        languages: hljs.listLanguages()
    });
});

// Deletes a specific paste by ID
router.post('/delete/:id', isAuth(), (req, res) => {
    // Enter a try block so the web-site doesn't crash
    try {
        // Try to delete a paste for the db with the given ID
        connection.collection("pastes").deleteOne({_id: mongoose.Types.ObjectId(req.params.id)});
        // Redirect the user back to the pastes ejs page
        res.redirect('/pastes');
    
    // On error
    } catch (err) {
        // log the error
        console.error(err);
        // Render the error to the page
        res.render('error', {
            message_tag: 'Could not delete paste..'
        });
    }
});

// Post the edited paste to the db with the given ID
router.post('/edit/:id', isAuth(), (req, res) => {
    // Enter a try block so the web-site doesn't crash
    try {
        // Find the paste with the given ID and update all it's params
        connection.collection("pastes").updateOne({_id: mongoose.Types.ObjectId(req.params.id)}, {
            $set: {
                title: req.body.title,
                type: req.body.type,
                status: req.body.status,
                abstract: req.body.abstract
            }
        });

        // Redirect the user back to the pastes page
        res.redirect('/pastes');

    // On error
    } catch (err) {
        // Log the error to the console
        console.error(err);
        // Display the error on the web-page
        res.render('error', {
            message_tag: 'Could not edit paste..'
        });
    }
});

// Display the page to create a new paste
router.get('/create', isAuth(), (req, res) => {
    // Render the create ejs file
    res.render('create', {
        status: req,
        user: req.user,
        languages: hljs.listLanguages()
    });
});

// Post the created paste to the db
router.post('/create', isAuth(), async (req, res) => {
    // Enter a try block so the web-site doesn't crash
    try {
        // Define the paste's author and owner using data from the current logged user
        req.body.author = req.user.displayName;
        req.body.owner = req.user.googleID;
        // Save the paste on the db
        await Paste.create(req.body);
        // Redirect the user back to the pastes page
        res.redirect('/pastes');
    // On error
    } catch (err) {
        // Log the error to the console
        console.error(err);
        // Display the error on the web-page
        res.render('error', {
            message_tag: 'Could not create paste..'
        });
    }
});

module.exports = router;