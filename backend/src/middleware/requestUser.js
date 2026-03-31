import { env } from '../config/env.js';

export function requestUser(req, _res, next) {
  req.userId = req.header('x-user-id') || env.defaultUserId;
  next();
}

