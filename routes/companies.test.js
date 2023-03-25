"use strict";

const request = require("supertest");

const db = require("../db");
const app = require("../app");

const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
  u1Token,
  adminToken,
} = require("./_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

/************************************** POST /companies */

describe("POST /companies", function () {
  const newCompany = {
    handle: "new",
    name: "New",
    logoUrl: "http://new.img",
    description: "DescNew",
    numEmployees: 10,
  };

  test("ok for users", async function () {
    const resp = await request(app)
      .post("/companies")
      .send(newCompany)
      .set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(201);
    expect(resp.body).toEqual({
      company: newCompany,
    });
  });

  test("unauth for anom", async function () {
    const resp = await request(app)
      .post("/companies")
      .send(newCompany)
    expect(resp.statusCode).toEqual(401);
    expect(resp.body).toEqual({
      "error": {
        "message": "Must be logged in",
        "status": 401
      }
    });
  });

  test("unauth for user not admin", async function () {
    const resp = await request(app)
      .post("/companies")
      .send(newCompany)
      .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(401);
    expect(resp.body).toEqual({
      "error": {
        "message": "Requires admin",
        "status": 401
      }
    });
  });

  test("bad request with missing data", async function () {
    const resp = await request(app)
      .post("/companies")
      .send({
        handle: "new",
        numEmployees: 10,
      })
      .set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(400);
  });

  test("bad request with invalid data", async function () {
    const resp = await request(app)
      .post("/companies")
      .send({
        ...newCompany,
        logoUrl: "not-a-url",
      })
      .set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(400);
  });
});

/************************************** GET /companies */

describe("GET /companies", function () {
  test("ok for anon", async function () {
    const resp = await request(app).get("/companies");
    expect(resp.body).toEqual({
      companies: [
        {
          handle: "c1",
          name: "C1",
          description: "Desc1",
          numEmployees: 1,
          logoUrl: "http://c1.img",
        },
        {
          handle: "c2",
          name: "C2",
          description: "Desc2",
          numEmployees: 2,
          logoUrl: "http://c2.img",
        },
        {
          handle: "c3",
          name: "C3",
          description: "Desc3",
          numEmployees: 3,
          logoUrl: "http://c3.img",
        },
        {
          handle: "c33",
          name: "C33",
          numEmployees: 50,
          description: "Desc33",
          logoUrl: "http://c33.img",
        },
        {
          handle: "c34",
          name: "C4",
          numEmployees: 1,
          description: "Desc34",
          logoUrl: "http://c34.img",
        },
        {
          handle: "c35",
          name: "C44",
          numEmployees: 999,
          description: "Desc35",
          logoUrl: "http://c35.img",
        },
        {
          handle: "a",
          name: "a",
          numEmployees: 999,
          description: "a",
          logoUrl: "http://c35.img",
        },
      ],
    });
  });

  test("works: nameLike", async function () {
    const resp = await request(app).get("/companies").query({ nameLike: "a" });
    expect(resp.body).toEqual({
      companies: [
        {
          handle: "a",
          name: "a",
          numEmployees: 999,
          description: "a",
          logoUrl: "http://c35.img",
        },
      ],
    });
  });

  test("works: minEmployees", async function () {
    const resp = await request(app)
      .get("/companies")
      .query({ minEmployees: 500 });
    expect(resp.body).toEqual({
      companies: [
        {
          handle: "c35",
          name: "C44",
          numEmployees: 999,
          description: "Desc35",
          logoUrl: "http://c35.img",
        },
        {
          handle: "a",
          name: "a",
          numEmployees: 999,
          description: "a",
          logoUrl: "http://c35.img",
        },
      ],
    });
  });

  test("works: maxEmployees", async function () {
    const resp = await request(app)
      .get("/companies")
      .query({ maxEmployees: 10 });
    expect(resp.body).toEqual({
      companies: [
        {
          handle: "c1",
          name: "C1",
          description: "Desc1",
          numEmployees: 1,
          logoUrl: "http://c1.img",
        },
        {
          handle: "c2",
          name: "C2",
          description: "Desc2",
          numEmployees: 2,
          logoUrl: "http://c2.img",
        },
        {
          handle: "c3",
          name: "C3",
          description: "Desc3",
          numEmployees: 3,
          logoUrl: "http://c3.img",
        },
        {
          handle: "c34",
          name: "C4",
          numEmployees: 1,
          description: "Desc34",
          logoUrl: "http://c34.img",
        },
      ],
    });
  });

  test("fails: minEmployees non-int input", async function () {
    const resp = await request(app)
      .get("/companies")
      .query({ minEmployees: "test1" });
    expect(resp.statusCode).toEqual(400);
    expect(resp.body).toEqual({
      "error": {
        "message": [
          "instance.minEmployees is not of a type(s) integer"
        ],
        "status": 400
      }
    });
  });

  test("fails: maxEmployees non-int input", async function () {
    const resp = await request(app)
      .get("/companies")
      .query({ maxEmployees: "test1" });
    expect(resp.statusCode).toEqual(400);
    expect(resp.body).toEqual({
      "error": {
        "message": [
          "instance.maxEmployees is not of a type(s) integer"
        ],
        "status": 400
      }
    });
  });

  test("fails: minEmployees > maxEmployee", async function () {
    const resp = await request(app)
      .get("/companies")
      .query({ minEmployees: 100, maxEmployees: 5 });
    expect(resp.statusCode).toEqual(400);
    expect(resp.body).toEqual({
      "error": {
        "message": "Maximum Employees must be greater than minimum employees",
        "status": 400
      }
    });
  });

  test("fails: maxEmployees non-int input", async function () {
    const resp = await request(app)
      .get("/companies")
      .query({ maxEmployees: "test2" });
    expect(resp.statusCode).toEqual(400);
    expect(resp.body).toEqual({
      "error": {
        "message": [
          "instance.maxEmployees is not of a type(s) integer"
        ],
        "status": 400
      }
    });
  });
});

/************************************** GET /companies/:handle */

describe("GET /companies/:handle", function () {
  test("works for anon", async function () {
    const resp = await request(app).get(`/companies/c1`);
    expect(resp.body).toEqual({
      company: {
        handle: "c1",
        name: "C1",
        description: "Desc1",
        numEmployees: 1,
        logoUrl: "http://c1.img",
        jobs: [
          { id: testJobIds[0], title: "J1", equity: "0.1", salary: 1 },
          { id: testJobIds[1], title: "J2", equity: "0.2", salary: 2 },
          { id: testJobIds[2], title: "J3", equity: null, salary: 3 },
        ],
      },
    });
  });

  test("works for anon: company w/o jobs", async function () {
    const resp = await request(app).get(`/companies/c2`);
    expect(resp.body).toEqual({
      company: {
        handle: "c2",
        name: "C2",
        description: "Desc2",
        numEmployees: 2,
        logoUrl: "http://c2.img",
        jobs: [],
      },
    });
  });

  test("not found for no such company", async function () {
    const resp = await request(app).get(`/companies/nope`);
    expect(resp.statusCode).toEqual(404);
  });
});

/************************************** PATCH /companies/:handle */

describe("PATCH /companies/:handle", function () {
  test("works for admin", async function () {
    const resp = await request(app)
      .patch(`/companies/c1`)
      .send({
        name: "C1-new",
      })
      .set("authorization", `Bearer ${adminToken}`);
    expect(resp.body).toEqual({
      company: {
        handle: "c1",
        name: "C1-new",
        description: "Desc1",
        numEmployees: 1,
        logoUrl: "http://c1.img",
      },
    });
  });

  test("fails: unauth for anon", async function () {
    const resp = await request(app).patch(`/companies/c1`).send({
      name: "C1-new",
    });
    expect(resp.statusCode).toEqual(401);
  });

  test("unauth for non admin user", async function () {
    const resp = await request(app)
      .patch(`/companies/c1`)
      .send({
        name: "C1-new",
      })
      .set("authorization", `Bearer ${u1Token}`);
    expect(resp.body).toEqual({
      error: {
        message: "Requires admin",
        status: 401,
      },
    });
  });

  test("not found on no such company", async function () {
    const resp = await request(app)
      .patch(`/companies/nope`)
      .send({
        name: "new nope",
      })
      .set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(404);
  });

  test("fails: bad request on handle change attempt", async function () {
    const resp = await request(app)
      .patch(`/companies/c1`)
      .send({
        handle: "c1-new",
      })
      .set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(400);
  });

  test("fails: bad request on invalid data", async function () {
    const resp = await request(app)
      .patch(`/companies/c1`)
      .send({
        logoUrl: "not-a-url",
      })
      .set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(400);
  });
});

/************************************** DELETE /companies/:handle */

describe("DELETE /companies/:handle", function () {
  test("works for admin", async function () {
    const resp = await request(app)
      .delete(`/companies/c1`)
      .set("authorization", `Bearer ${adminToken}`);
    expect(resp.body).toEqual({ deleted: "c1" });
  });

  test("unauth for anon", async function () {
    const resp = await request(app).delete(`/companies/c1`);

    expect(resp.statusCode).toEqual(401);
  });

  test("unauth for logged in but not admin", async function () {
    const resp = await request(app)
      .delete(`/companies/c1`)
      .set("authorization", `Bearer ${u1Token}`);

    expect(resp.body).toEqual({
      error: {
        message: "Requires admin",
        status: 401,
      },
    });
  });

  test("not found for no such company", async function () {
    const resp = await request(app)
      .delete(`/companies/nope`)
      .set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(404);
  });
});
