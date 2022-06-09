// Get the configuration values
require('dotenv').config();

const passport = require('passport');
const connection = require('./database');
const User = connection.models.User;
var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;

/*
 * After a successful authentication, store the user in the session
 * as req.session.passport.user so that it persists across accesses.
 * See: https://stackoverflow.com/questions/27637609/understanding-passport-serialize-deserialize
 * Here, since no database is used, the full user profile has to be stored in the session.
 */
passport.serializeUser((user, done) => {
    console.log('Serialiazing user:', user);
    done(null, user._id);
});

/*
* On each new access, retrieve the user profile from the session and provide it as req.user
* so that routes detect if there is a valid user context. 
*/
passport.deserializeUser(async (id, done) => {
    User.findById(id, (err, user) => {
        done(err, user);
    });
});

/*  Google AUTH  */
passport.use(
    new GoogleStrategy(
        // Strategy Parameters
        {
            clientID: process.env.CLIENT_ID,
            clientSecret: process.env.CLIENT_SECRET,
            callbackURL: process.env.REDIRECT_URL
            // Tell passport to trust the HTTPS proxy
            // callbackURL: process.env.REDIRECT_URL,
            // proxy: true
        },
        // Verify callback
        (accessToken, refreshToken, params, profile, done) => {

            User.findOne({googleID: profile.id}).then((user) => {
                if (!user) { 
                    const newUser = new User({
                        googleID: profile.id,
                        displayName: profile.displayName,
                        emails: profile.emails
                    });
                    newUser.save()
                        .then((user) => {
                            console.log('Registered user:', user);
                        });

                    return done(null, newUser);
                }

                return done(null, user);
            });

            console.log('OAuth2 params:', params);
        }
    ));
