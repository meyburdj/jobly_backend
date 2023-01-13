"use strict";

const db = require("../db.js");
const { BadRequestError, NotFoundError } = require("../expressError");
const Job = require("./job.js");
const {
    commonBeforeAll,
    commonBeforeEach,
    commonAfterEach,
    commonAfterAll,
} = require("./_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

/************************************** create */

describe("create", function () {
    const newJob = {
        title: "new",
        salary: 10000,
        equity: '0.15',
        companyHandle: "c1",
    };
    console.log("newJob", newJob)

    test("works", async function () {
        let job = await Job.create(newJob);
        console.log("job", job)
        console.log("newJob", newJob)
        expect(job).toEqual(newJob);

        const result = await db.query(
            `SELECT title, salary, equity, company_handle
           FROM jobs
           WHERE "title" = 'new'`
        );
        console.log("result.rows", result.rows)
        expect(result.rows).toEqual([
            {
                title: "new",
                salary: 10000,
                equity: "0.15",
                company_handle: "c1",
            },
        ]);
    });
});

// /************************************** findAll */

// describe("findAll", function () {
//     test("works: no filter", async function () {
//         let jobs = await Job.findAll();
//         expect(jobs).toEqual([
//             {
//                 handle: "c1",
//                 name: "C1",
//                 description: "Desc1",
//                 numEmployees: 1,
//                 logoUrl: "http://c1.img",
//             },
//             {
//                 handle: "c2",
//                 name: "C2",
//                 description: "Desc2",
//                 numEmployees: 2,
//                 logoUrl: "http://c2.img",
//             },
//             {
//                 handle: "c3",
//                 name: "C3",
//                 description: "Desc3",
//                 numEmployees: 3,
//                 logoUrl: "http://c3.img",
//             },
//         ]);
//     });
// });

// /************************************** get */

describe("get", function () {
    test("works", async function () {
        const jobQuery = await db.query(
            `SELECT id            
           FROM jobs
           WHERE title = 'j3'`
        );
        const jobId = jobQuery.rows[0].id;
        const job = await Job.get(jobId)
        console.log(jobId)
        console.log("job = ", job)
        expect(job).toEqual({
            "companyHandle": "c2",
            "equity": "0.05",
            "salary": 300,
            "title": "j3",
        });
    });

    test("not found if no such job", async function () {
        try {
            await Job.get(-1);
            throw new Error("fail test, you shouldn't get here");
        } catch (err) {
            expect(err instanceof NotFoundError).toBeTruthy();
        }
    });
});

    // /** UPDATE: Added these model tests here. */
    // /************************************** filterCompaies */

    // describe("filterCompanies", function () {
    //     test("works", async function () {
    //         let company = await Company.filterCompanies({
    //             nameLike: "c1",
    //             minEmployees: "1",
    //             maxEmployees: "2",
    //         });
    //         expect(company).toEqual([
    //             {
    //                 handle: "c1",
    //                 name: "C1",
    //                 description: "Desc1",
    //                 numEmployees: 1,
    //                 logoUrl: "http://c1.img",
    //             },
    //         ]);
    //     });

    //     test("Invalid Input", async function () {
    //         try {
    //             await Company.get({
    //                 nameLIke: "c",
    //                 minEmployees: "a",
    //                 maxEmployees: "c",
    //             });
    //             throw new Error("fail test, you shouldn't get here");
    //         } catch (err) {
    //             expect(err instanceof NotFoundError).toBeTruthy();
    //         }
    //     });
    // });

    // /************************************** update */

    // describe("update", function () {
    //     const updateData = {
    //         name: "New",
    //         description: "New Description",
    //         numEmployees: 10,
    //         logoUrl: "http://new.img",
    //     };

    //     test("works", async function () {
    //         let company = await Company.update("c1", updateData);
    //         expect(company).toEqual({
    //             handle: "c1",
    //             ...updateData,
    //         });

    //         const result = await db.query(
    //             `SELECT handle, name, description, num_employees, logo_url
    //            FROM companies
    //            WHERE handle = 'c1'`
    //         );
    //         expect(result.rows).toEqual([
    //             {
    //                 handle: "c1",
    //                 name: "New",
    //                 description: "New Description",
    //                 num_employees: 10,
    //                 logo_url: "http://new.img",
    //             },
    //         ]);
    //     });

    //     test("works: null fields", async function () {
    //         const updateDataSetNulls = {
    //             name: "New",
    //             description: "New Description",
    //             numEmployees: null,
    //             logoUrl: null,
    //         };

    //         let company = await Company.update("c1", updateDataSetNulls);
    //         expect(company).toEqual({
    //             handle: "c1",
    //             ...updateDataSetNulls,
    //         });

    //         const result = await db.query(
    //             `SELECT handle, name, description, num_employees, logo_url
    //            FROM companies
    //            WHERE handle = 'c1'`
    //         );
    //         expect(result.rows).toEqual([
    //             {
    //                 handle: "c1",
    //                 name: "New",
    //                 description: "New Description",
    //                 num_employees: null,
    //                 logo_url: null,
    //             },
    //         ]);
    //     });

    //     test("not found if no such company", async function () {
    //         try {
    //             await Company.update("nope", updateData);
    //             throw new Error("fail test, you shouldn't get here");
    //         } catch (err) {
    //             expect(err instanceof NotFoundError).toBeTruthy();
    //         }
    //     });

    //     test("bad request with no data", async function () {
    //         try {
    //             await Company.update("c1", {});
    //             throw new Error("fail test, you shouldn't get here");
    //         } catch (err) {
    //             expect(err instanceof BadRequestError).toBeTruthy();
    //         }
    //     });
    // });

    // /************************************** remove */

    // describe("remove", function () {
    //     test("works", async function () {
    //         await Company.remove("c1");
    //         const res = await db.query(
    //             "SELECT handle FROM companies WHERE handle='c1'"
    //         );
    //         expect(res.rows.length).toEqual(0);
    //     });

    //     test("not found if no such company", async function () {
    //         try {
    //             await Company.remove("nope");
    //             throw new Error("fail test, you shouldn't get here");
    //         } catch (err) {
    //             expect(err instanceof NotFoundError).toBeTruthy();
    //         }
    //     });
// });
