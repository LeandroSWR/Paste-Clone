const express = require('express');
const router = express.Router();
const connection = require('../services/database');
const isAuth = require('../services/middleware');
const Item = connection.models.Item;
const hljs = require('highlight.js');

router.get('/item', function isAuth (req, res, next) { next(); }, async (req, res) => {
    var items = null;
    // If the user is authenticated
    if (req.isAuthenticated()) {
        // Show all his items and all public items
        // Get's all items that are either public of belong to the user
        items = await Item.find({$or:[{owner: req.user._id}, {status: 'public'}]});
    }
    // If not
    else {
        // Only show public items
        items = await Item.find({ status: 'public' }).lean();
    }

    res.render('item', {
        status: req,
        itemList: items
    });
});

router.get('/item/:id', function isAuth (req, res, next) { next(); }, async (req, res) => {

    const item = await Item.findById(req.params.id);

    res.render('display', {
        status: req,
        item: item
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
        await Item.create(req.body);
        res.redirect('/item');
    } catch (err) {
        console.error(err);
        res.render('error', {
            message_tag: 'Could not create item..'
        });
    }
});

module.exports = router;