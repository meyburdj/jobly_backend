"use strict";

const request = require("supertest");
const validate = require("./schema");
const selectCompanies = require("../schemas/selectCompanies.json");
const app = require("../app");
const { BadRequestError } = require("../expressError");

describe("test validation", function () {
  test("passes validation", function () {
    const output = validate(
      {
        nameLike: "a",
        minEmployees: 100,
        maxEmployees: 5,
      },
      selectCompanies
    );
    expect(output).toEqual(true);
  });

  // test("fails validation", async function () {
  //   const resp = await request(app)
  //     .get("/companies")
  //     .query({
  //       nameLike: "a",
  //       minEmployees: "abc",
  //       maxEmployees: "abc",
  //     });
  //   // console.log("RESP:", resp, resp.query, "REQ", req.query)
  //   const output = validate(req.query,selectCompanies)

  //   expect(output).toEqual({
  //     error: {
  //       message: 'invalid input syntax for type integer: "test"',
  //       status: 500,
  //     },
  //   });
  // });
});
