const passport = require('passport');
const JwtStrategy = require('passport-jwt').Strategy;
const { ExtractJwt } = require('passport-jwt');
const { User } = require('../models');
const config = require('./config');

// decode and verify that the token that's coming in is valid
passport.use(
  new JwtStrategy(
    {
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: config.authentication.jwtSecret,
    },
    async (jwtPayload, done) => {
      try {
        const user = await User.findOne({
          where: {
            id: jwtPayload.id,
          },
        });
        console.log(user);
        if (!user) {
          return done(new Error(), false);
        }
        return done(null, user);
      } catch (err) {
        return done(new Error(), false);
      }
    }
  )
);

module.exports = null;
