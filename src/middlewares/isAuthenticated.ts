const passport = require('passport');

export default passport.authenticate('jwt', { session: false });
