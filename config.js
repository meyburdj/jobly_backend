"use strict";

/** Shared config for application; can be required many places. */

require("dotenv").config();
require("colors");

const SECRET_KEY = process.env.SECRET_KEY || "secret-dev";

const PORT = +process.env.PORT || 3009;

/* Chalon's version **/
// // Use dev database, testing database, or via env var, production database
// function getDatabaseUri() {
//   return (process.env.NODE_ENV === "test")
//       ? "jobly_test"
//       : process.env.DATABASE_URL || "jobly";
// }


/* Jesse's bum WSL version **/
// Use dev database, testing database, or via env var, production database
function getDatabaseUri() {
  return (process.env.NODE_ENV === "test")
    ? "postgresql://meyburdj:meyburdj@localhost/jobly_test"
    : "postgresql://meyburdj:meyburdj@localhost/jobly";
}

// Speed up bcrypt during tests, since the algorithm safety isn't being tested
//
// WJB: Evaluate in 2021 if this should be increased to 13 for non-test use
const BCRYPT_WORK_FACTOR = process.env.NODE_ENV === "test" ? 1 : 12;

console.log("Jobly Config:".green);
console.log("SECRET_KEY:".yellow, SECRET_KEY);
console.log("PORT:".yellow, PORT.toString());
console.log("BCRYPT_WORK_FACTOR".yellow, BCRYPT_WORK_FACTOR);
console.log("Database:".yellow, getDatabaseUri());
console.log("---");

module.exports = {
  SECRET_KEY,
  PORT,
  BCRYPT_WORK_FACTOR,
  getDatabaseUri,
};


// {
// 	"token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6Ikplc3NlTG92ZXNUcmFzaCIsImlzQWRtaW4iOmZhbHNlLCJpYXQiOjE2NzM0NjI0OTR9.v5vzE8pBg8_VdQ-nleAr-6ReGWTQ7s1T9Y-FENkMZSo"
// }
// {
// 	"username": "JesseLovesTrash",
// 	"password": "abc123",
// 	"firstName": "Jesse",
// 	"lastName": "Trash",
// 	"email": "Jesse@trash.com"
// }