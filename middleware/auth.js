"use strict";

/** Convenience middleware to handle common auth cases in routes. */

const jwt = require("jsonwebtoken");
const { SECRET_KEY } = require("../config");
const { UnauthorizedError } = require("../expressError");

/** Middleware: Authenticate user.
 *
 * If a token was provided, verify it, and, if valid, store the token payload
 * on res.locals (this will include the username and isAdmin field.)
 *
 * It's not an error if no token was provided or if the token is not valid.
 */

function authenticateJWT(req, res, next) {
  try {
    const authHeader = req.headers && req.headers.authorization;
    if (authHeader) {
      const token = authHeader.replace(/^[Bb]earer /, "").trim();
      res.locals.user = jwt.verify(token, SECRET_KEY);
    }
    return next();
  } catch (err) {
    return next();
  }
}

/** Middleware to use when they must be logged in.
 *
 * If not, raises Unauthorized.
 */

function ensureLoggedIn(req, res, next) {
  if (!res.locals.user?.username)
    throw new UnauthorizedError("Must be logged in");

  return next();
}

/** Middleware to use when they must be adminn.
 *
 * If not, raises Unauthorized.
 */

function ensureAdmin(req, res, next) {
  if (!res.locals.user?.isAdmin) throw new UnauthorizedError("Requires admin");

  return next();
}
function ensureSelfOrAdmin(req, res, next) {
  const user = res.locals.user;
  // // const checks = [req.params.username, req.body.username, req]
  // // check if admin || check if user is the

  if (!user.isAdmin && user.username !== req.params.username) {
    throw new UnauthorizedError("Access denied.");
  }
  return next();
}

module.exports = {
  authenticateJWT,
  ensureLoggedIn,
  ensureAdmin,
  ensureSelfOrAdmin
};
