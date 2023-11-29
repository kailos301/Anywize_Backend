import bcrypt from 'bcrypt';
import omit from 'lodash/omit';
import jwt from 'jsonwebtoken';
import { DateTime } from 'luxon';
import { SECRET } from '../passport';

export function encryptPassword({ password }: { password: string }) {
  return new Promise((resolve, reject) => {
    return resolve(bcrypt.hashSync(password, 10));
  });
}

export function comparePasswords(hash, input) {
  return new Promise((resolve) => {
    return resolve(bcrypt.compareSync(input, hash));
  });
}

export function getJWT(user: User) {
  return jwt.sign(getPublicInfo(user), SECRET, {
    expiresIn: 604800 // in seconds
  });
}

export function getDriverJWT(route: Route): string {
  return jwt.sign({
    uuid: route.uuid,
    time: DateTime.now().toMillis(),
  }, SECRET, {
    expiresIn: 60 * 60 * 12,
  });
}

export function getPublicInfo(user: User): PublicUser {
  return omit(user, [
    'created_at',
    'updated_at',
    'password',
    // 'admin',
    'token',
  ]);
}

