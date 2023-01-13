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

/************************************** POST /jobs */

describe("POST /jobs", function () {
  const newJob = {
    title: "testJob",
    salary: 350,
    equity: "0.01",
    companyHandle: "c1",
  };

  test("ok for users", async function () {
    const resp = await request(app)
      .post("/jobs")
      .send(newJob)
      .set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(201);
    expect(resp.body).toEqual({
      job: newJob,
    });
  });
  test("unauth for anom", async function () {
    const resp = await request(app).post("/jobs").send(newJob);
    expect(resp.statusCode).toEqual(401);
    expect(resp.body).toEqual({
      error: {
        message: "Must be logged in",
        status: 401,
      },
    });
  });
  test("unauth for user not admin", async function () {
    const resp = await request(app)
      .post("/jobs")
      .send(newJob)
      .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(401);
    expect(resp.body).toEqual({
      error: {
        message: "Requires admin",
        status: 401,
      },
    });
  });
  test("bad request with missing data", async function () {
    const resp = await request(app)
      .post("/jobs")
      .send({
        title: "testTitle",
      })
      .set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(400);
  });
  test("bad request with invalid data", async function () {
    const resp = await request(app)
      .post("/jobs")
      .send({
        title: "testJob",
        salary: 350,
        equity: 5,
        company_handle: "c1",
      })
      .set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(400);
  });
});

/************************************** GET /jobs */

describe("GET /jobs", function () {
  test("ok for anon", async function () {
    const resp = await request(app).get("/jobs");
    expect(resp.body).toEqual({
      jobs: [
        {
          title: "j1",
          salary: 1000,
          equity: "0.1",
          companyHandle: "c1",
        },
        {
          title: "j2",
          salary: 2000,
          equity: "0.12",
          companyHandle: "c1",
        },
        {
          title: "j3",
          salary: 3000,
          equity: "0.13",
          companyHandle: "c2",
        },
        {
          title: "j4",
          salary: 4000,
          equity: "0.0",
          companyHandle: "c2",
        },
      ],
    });
  });

  test("ok for titleLike", async function () {
    const resp = await request(app).get("/jobs").query({ titleLike: "1" });
    expect(resp.body).toEqual({
      jobs: [
        {
          title: "j1",
          salary: 1000,
          equity: "0.1",
          companyHandle: "c1",
        },
      ],
    });
  });

  test("ok for salary", async function () {
    const resp = await request(app).get("/jobs").query({ minSalary: 1500 });
    expect(resp.body).toEqual({
      jobs: [
        {
          title: "j2",
          salary: 2000,
          equity: "0.12",
          companyHandle: "c1",
        },
        {
          title: "j3",
          salary: 3000,
          equity: "0.13",
          companyHandle: "c2",
        },
        {
          title: "j4",
          salary: 4000,
          equity: "0.0",
          companyHandle: "c2",
        },
      ],
    });
  });

  test("ok for equity", async function () {
    const resp = await request(app).get("/jobs").query({ equity: true });
    expect(resp.body).toEqual({
      jobs: [
        {
          title: "j1",
          salary: 1000,
          equity: "0.1",
          companyHandle: "c1",
        },
        {
          title: "j2",
          salary: 2000,
          equity: "0.12",
          companyHandle: "c1",
        },
        {
          title: "j3",
          salary: 3000,
          equity: "0.13",
          companyHandle: "c2",
        },
      ],
    });
  });

  test("salary fails validation", async function () {
    const resp = await request(app).get("/jobs").query({ minSalary: "test1" });
    expect(resp.statusCode).toEqual(400);
    expect(resp.body).toEqual({
      error: {
        message: ["instance.minSalary is not of a type(s) integer"],
        status: 400,
      },
    });
  });

  test("equity fail validation", async function () {
    const resp = await request(app).get("/jobs").query({ equity: "test1" });
    expect(resp.statusCode).toEqual(400);
    expect(resp.body).toEqual({
      error: {
        message: ["instance.equity is not of a type(s) boolean"],
        status: 400,
      },
    });
  });

  test("fails: test next() handler", async function () {
    // there's no normal failure event which will cause this route to fail ---
    // thus making it hard to test that the error-handler works with it. This
    // should cause an error, all right :)
    await db.query("DROP TABLE jobs CASCADE");
    const resp = await request(app)
      .get("/jobs")
      .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(500);
  });
});

/************************************** GET /jobs/:id */

describe("GET /jobs/:id", function () {
  test("works: for anon", async function () {
    const j1Query = await db.query(
      `SELECT id
                 FROM jobs
                 WHERE title = 'j1'`
    );
    let jobId = j1Query.rows[0].id;
    console.log("jobId:", jobId);
    const resp = await request(app).get(`/jobs/${jobId}`);
    expect(resp.body).toEqual({
      job: {
        title: "j1",
        salary: 1000,
        equity: "0.1",
        companyHandle: "c1",
      },
    });
  });

  test("not found for no such company", async function () {
    const fakeId = 1234567
    const resp = await request(app).get(`/jobs/${fakeId}`);
    expect(resp.statusCode).toEqual(404);
  });
});

// /************************************** PATCH /companies/:handle */

// describe("PATCH /companies/:handle", function () {
//     test("works for admin", async function () {
//         const resp = await request(app)
//             .patch(`/companies/c1`)
//             .send({
//                 name: "C1-new",
//             })
//             .set("authorization", `Bearer ${adminToken}`);
//         expect(resp.body).toEqual({
//             company: {
//                 handle: "c1",
//                 name: "C1-new",
//                 description: "Desc1",
//                 numEmployees: 1,
//                 logoUrl: "http://c1.img",
//             },
//         });
//     });

//     test("unauth for anon", async function () {
//         const resp = await request(app).patch(`/companies/c1`).send({
//             name: "C1-new",
//         });
//         expect(resp.statusCode).toEqual(401);
//     });

//     test("unauth for non admin user", async function () {
//         const resp = await request(app)
//             .patch(`/companies/c1`)
//             .send({
//                 name: "C1-new",
//             })
//             .set("authorization", `Bearer ${u1Token}`);
//         expect(resp.body).toEqual({
//             error: {
//                 message: "Requires admin",
//                 status: 401,
//             },
//         });
//     });

//     test("not found on no such company", async function () {
//         const resp = await request(app)
//             .patch(`/companies/nope`)
//             .send({
//                 name: "new nope",
//             })
//             .set("authorization", `Bearer ${adminToken}`);
//         expect(resp.statusCode).toEqual(404);
//     });

//     test("bad request on handle change attempt", async function () {
//         const resp = await request(app)
//             .patch(`/companies/c1`)
//             .send({
//                 handle: "c1-new",
//             })
//             .set("authorization", `Bearer ${adminToken}`);
//         expect(resp.statusCode).toEqual(400);
//     });

//     test("bad request on invalid data", async function () {
//         const resp = await request(app)
//             .patch(`/companies/c1`)
//             .send({
//                 logoUrl: "not-a-url",
//             })
//             .set("authorization", `Bearer ${adminToken}`);
//         expect(resp.statusCode).toEqual(400);
//     });
// });

// /************************************** DELETE /companies/:handle */

// describe("DELETE /companies/:handle", function () {
//     test("works for admin", async function () {
//         const resp = await request(app)
//             .delete(`/companies/c1`)
//             .set("authorization", `Bearer ${adminToken}`);
//         expect(resp.body).toEqual({ deleted: "c1" });
//     });

//     test("unauth for anon", async function () {
//         const resp = await request(app).delete(`/companies/c1`);

//         expect(resp.statusCode).toEqual(401);
//     });

//     test("unauth for logged in but not admin", async function () {
//         const resp = await request(app)
//             .delete(`/companies/c1`)
//             .set("authorization", `Bearer ${u1Token}`);

//         expect(resp.body).toEqual({
//             error: {
//                 message: "Requires admin",
//                 status: 401,
//             },
//         });
//     });

//     test("not found for no such company", async function () {
//         const resp = await request(app)
//             .delete(`/companies/nope`)
//             .set("authorization", `Bearer ${adminToken}`);
//         expect(resp.statusCode).toEqual(404);
//     });
// });
