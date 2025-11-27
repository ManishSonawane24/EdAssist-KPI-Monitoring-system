const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err);
  }
});

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
    },
    async (_accessToken, _refreshToken, profile, done) => {
      try {
        const email = profile.emails?.[0]?.value;
        const existingUser = await User.findOne({ email });
        if (existingUser) {
          existingUser.provider = 'google';
          existingUser.oauthId = profile.id;
          existingUser.avatar = profile.photos?.[0]?.value;
          await existingUser.save();
          return done(null, existingUser);
        }

        const user = await User.create({
          name: profile.displayName || profile.name?.givenName,
          email,
          provider: 'google',
          oauthId: profile.id,
          avatar: profile.photos?.[0]?.value,
          password: null,
        });
        done(null, user);
      } catch (err) {
        done(err);
      }
    }
  )
);

module.exports = passport;

