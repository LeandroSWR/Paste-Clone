# Paste Clone

## Authorship
__Leandro Brás__ > __a22100770__ 

## Brief

The main idea behind this project was to build a simple clone of Paste Bin, to test
and improve my skills using NodeJs, MongoDB, Google Auth and EJS.

## Description

This project was started of the base code [auth-google-passport](!https://github.com/jrogado/auth-google-passport)
provided by our teacher [Jose Rogado](!https://github.com/jrogado). I used this base
code as a learning platform to test what could be done and how the code worked. The
base code came with `app.js` that initializes everything and allows the server to run,
`authRoutes.js` allows us to "route" the user trough the available web-pages of our
site that are built using ejs allowing us to send and retrieve data more easily, the
`passport.js` script allows us to use the google auth and save the user session to mongoDB,
the `server.js` creates a new server and handles certificates in case it's a local server
and `middleware.js` checks if the user is authenticated.

From this base code I started expanding making use of the `database.js` and `passport.js` to
be able to save the user data on mongoDB instead of only saving the current session, this
was done by creating a user schema and a connection model to post to the server, once this
was working I wanted to try my hand at saving custom items to the server, I initially did
this by adding a new item schema on `database.js` and creating new ejs files as needed to
let the user create a new item and post it to the server, when doing this I noticed I
needed to add specific routes for items so i created the `itemRoutes.js` to do just this
route the user trough the item creation and visualization pages as well as posting the
created items to the server.

I wanted to have public and private items, so i needed a way to get all the items and are
public and all the items that belong to the user, this was done by using the available
`find()` method and using $or so we can retrieve every paste that's either from the user
or public:

```javascript
router.get('/pastes', function f (req, res, next) { next(); }, async (req, res) => {
    var pastes = null;
    if (req.isAuthenticated()) {
        pastes = await Paste.find({$or:[{owner: req.user.googleID}, {status: 'public'}]});
    }
    else {
        pastes = await Paste.find({ status: 'public' }).lean();
    }
    res.render('pastes', {
        status: req,
        pasteList: pastes
    });
});
```

Using EJS made displaying all these items incredibly easy just needing to do a foreach:

```html
<% pasteList.forEach(paste => { %>
    <tr>
        <td><a href="/pastes/<%= paste._id %> " style="color:dodgerblue"><%= paste.title %></a> </td>
        <td> <%= paste.author %> </td>
        <td> <%= paste.createdAt.toGMTString(); %> </td>
        <td style="text-align: center;">
        <span class="dash-status"><%= paste.status %></span>
        </td>
    </tr>
<% }); %>
```

After completing this first faze and being able to save items to mongoDB, I started
looking into creative option that would allow me to explore ejs and nodejs a bit more
with this work eventually deciding to try and create a simple clone of Paste Bin, allowing
the user to create/edit/delete pastes and highlighting the text based on the paste's chosen
language.

The first step was to rename all "Items" to "Pastes" to better represent what it was i was
referencing in the code. After this I changed the Item schema to match what a paste needed
to have (Title, Author, Language, Status, Abstract and Date), form here I started to look
into ways i could highlight the text like in Paste Bin, I found a JS Library called
`Highlight.js`, that is able to do most things automatically making my life really easy,
checking their API showed me I could use the method `listLanguages()` to get an array with
all the languages supported by the library, this array allowed me to easily create a choice
menu to allow the user to chose what language their paste was written in, this was all done
using ejs making it extra easy without the need to hardcode languages:

```html
<select id="type" name="type">
    <% languages.forEach(language => { %> 
        <option value="<%= language %>" <% if (language == 'plaintext') { %> selected <% } %> style="color: azure;">
            <%= language.charAt(0).toUpperCase() + language.slice(1); %>
        </option>
    <% }); %> 
</select>
```

After everything was working it was time for the finally touches to allow the user to
edit/delete their pastes, this was one of the easiest parts to implement just needing
to create another ejs file for paste editing and a single route for deleting files:

```javascript
router.post('/delete/:id', isAuth(), (req, res) => {
    try {
        connection.collection("pastes").deleteOne({_id: mongoose.Types.ObjectId(req.params.id)});
        res.redirect('/pastes');
    } catch (err) {
        console.error(err);
        res.render('error', {
            message_tag: 'Could not delete paste..'
        });
    }
});

router.post('/edit/:id', isAuth(), (req, res) => {
    try {
        connection.collection("pastes").updateOne({_id: mongoose.Types.ObjectId(req.params.id)}, {
            $set: {
                title: req.body.title,
                type: req.body.type,
                status: req.body.status,
                abstract: req.body.abstract
            }
        });
        res.redirect('/pastes');
    } catch (err) {
        console.error(err);
        res.render('error', {
            message_tag: 'Could not edit paste..'
        });
    }
});
```

## Conclusions

Overall I think this was a really good project to get me into nodejs. I was able to
learn new  things like EJS and I am really happy with the final result, even tho it
was my first time working with the google authentication and with mongoDB, I think i
was able to understand clearly how everything works, and I'm already thinking about
using this new knowledge to improve my portfolio that was previously built using only
HTML and CSS.

## References


## Thanks
I'm very tankful to my teacher who was always available to answer any questions i had
and was always really fast!