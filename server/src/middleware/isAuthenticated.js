const passport = require('passport');

module.exports = (req, res, next) => {
  passport.authenticate('jwt', (err, user) => {
    if (err || !user) {
      res.status(403).send({
        err: 'You do not have access to this resource.',
      });
    } else {
      req.user = user;
      next();
    }
  })(req, res, next);
};
