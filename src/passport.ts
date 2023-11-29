import { Strategy, ExtractJwt }  from 'passport-jwt';
import models from './models';

export const SECRET = 'secret-token-20124$·!"·!32JWT-ab112cw1-12312ccr-qweqwe';

export default (passport) => {
  const options = {
    jwtFromRequest: ExtractJwt.fromExtractors([
      ExtractJwt.fromAuthHeaderAsBearerToken(),
      ExtractJwt.fromBodyField('jwt'),
      ExtractJwt.fromHeader('jwt'),
      ExtractJwt.fromHeader('JWT'),
      ExtractJwt.fromUrlQueryParameter('taira'),
    ]),
    secretOrKey: SECRET,
  };

  passport.use(new Strategy(options, function(jwt_payload, done) {
    if (!jwt_payload.id) {
      return done(null, false);
    }

    return models.Users.findOne({
      where: {
        id: jwt_payload.id,
        active: true,
      },
      attributes: {
        exclude: ['password'],
      },
      raw: true,
    }).then((user) => {
      if (!user) {
        return done(null, false);
      }

      return done(null, user);
    }).catch((err) => {
      return done(err, false);
    });
  }));
};
