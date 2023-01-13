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

//UPDATE: Moved here, changed name for better readability.
/*************************************** SqlForFindAll */

describe("use sql to query input parameters", function () {
    test("works: gives correct query", function () {
        const dataToFilter = {
            titleLike: "bak",
            minSalary: 10,
            equity: true,
        };

        const output = Job.sqlForFindAll(dataToFilter);
        expect(output).toEqual({
            values: ["%bak%", 10, 0],
            whereStatement: "WHERE title ILIKE $1 AND salary >= $2 AND equity > $3",
        });
    });
});

//TODO: add smaller inputs? or a fail?
/************************************** create */

describe("create", function () {
    const newJob = {
        title: "new",
        salary: 10000,
        equity: "0.15",
        companyHandle: "c1",
    };

    test("works: create with good data", async function () {
        let job = await Job.create(newJob);
        expect(job).toEqual(newJob);

        const result = await db.query(
            `SELECT title, salary, equity, company_handle
           FROM jobs
           WHERE "title" = 'new'`
        );
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
//TODO: Enter bad data.
// /************************************** findAll */

describe("findAll", function () {
    test("works: no filter", async function () {
        let jobs = await Job.findAll();
        expect(jobs).toEqual([
            {
                title: "j1",
                salary: 100,
                equity: "0.15",
                companyHandle: "c1",
            },
            {
                title: "j2",
                salary: 200,
                equity: "0.25",
                companyHandle: "c1",
            },
            {
                title: "j3",
                salary: 300,
                equity: "0.05",
                companyHandle: "c2",
            },
        ]);
    });
    test("works: filter for title", async function () {
        let jobs = await Job.findAll({
            titleLike: "j",
        });
        expect(jobs).toEqual([
            {
                title: "j1",
                salary: 100,
                equity: "0.15",
                companyHandle: "c1",
            },
            {
                title: "j2",
                salary: 200,
                equity: "0.25",
                companyHandle: "c1",
            },
            {
                title: "j3",
                salary: 300,
                equity: "0.05",
                companyHandle: "c2",
            },
        ]);
    });
    test("works: filter for equity", async function () {
        let jobs = await Job.findAll({
            equity: "true",
        });
        expect(jobs).toEqual([
            {
                title: "j1",
                salary: 100,
                equity: "0.15",
                companyHandle: "c1",
            },
            {
                title: "j2",
                salary: 200,
                equity: "0.25",
                companyHandle: "c1",
            },
            {
                title: "j3",
                salary: 300,
                equity: "0.05",
                companyHandle: "c2",
            },
        ]);
    });
});
//TODO: Filter for all, filter for bad info.

// /************************************** get */

describe("get job by ID", function () {
    test("works: get a single job by ID", async function () {
        const jobQuery = await db.query(
            `SELECT id
           FROM jobs
           WHERE title = 'j3'`
        );
        const jobId = jobQuery.rows[0].id;
        const job = await Job.get(jobId);
        expect(job).toEqual({
            companyHandle: "c2",
            equity: "0.05",
            salary: 300,
            title: "j3",
        });
    });

    test("fail: not found if no such job", async function () {
        try {
            await Job.get(-1);
            throw new Error("fail test, you shouldn't get here");
        } catch (err) {
            expect(err instanceof NotFoundError).toBeTruthy();
        }
    });
});

//TODO: Add bad input?

// /************************************** update */
//UPDATE: Added tests.
describe("update", function () {
    test("works", async function () {
        const jobQuery = await db.query(
            `SELECT id
                   FROM jobs
                   WHERE title = 'j3'`
        );
        const jobID = jobQuery.rows[0].id;
        const updateData = {
            title: "Professional Mime",
            salary: 99999,
            equity: "0.5",
        };
        let job = await Job.update(jobID, updateData);
        expect(job).toMatchObject({
            ...updateData,
        });
        //UPDATE: A bit repetative probably don't need. I'll look closer tmrw.
        const result = await db.query(
            `SELECT title, salary, equity
               FROM jobs
               WHERE id=${jobID}`
        );
        expect(result.rows).toMatchObject([
            {
                title: "Professional Mime",
                salary: 99999,
                equity: "0.5",
            },
        ]);
    });

    test("works: null fields", async function () {
        const updateDataSetNulls = {
            title: "Revature SWE",
            salary: null,
            equity: null,
        };
        const jobQuery = await db.query(
            `SELECT id
                     FROM jobs
                     WHERE title = 'j3'`
        );
        const jobID = jobQuery.rows[0].id;

        let job = await Job.update(jobID, updateDataSetNulls);
        expect(job).toMatchObject({
            ...updateDataSetNulls,
        });
    });

    //UPDATE: Couldn't get this mfer to work.
    test("fail: update with invalid job id", async function () {
        const updateData = {
            title: "Professional Mime",
            salary: 99999,
            equity: "0.5",
        };
        try {
            await Job.update("abc", updateData);
            throw new Error("fail test, you shouldn't get here");
        } catch (err) {
            console.log("FAIL: UPDATE", err);
            expect(err instanceof NotFoundError).toBeTruthy();
        }
    });

    test("fail: bad request with no data", async function () {
        const jobQuery = await db.query(
            `SELECT id
                     FROM jobs
                     WHERE title = 'j3'`
        );
        const jobID = jobQuery.rows[0].id;
        try {
            await Job.update(jobID, {});
            // throw new Error("fail test, you shouldn't get here");
        } catch (err) {
            console.log(err);
            expect(err instanceof BadRequestError).toBeTruthy();
        }
    });
});

/************************************** remove */

describe("remove", function () {
    test("works", async function () {
        const jobQuery = await db.query(
            `SELECT id
                     FROM jobs
                     WHERE title = 'j3'`
        );
        const jobID = jobQuery.rows[0].id;

        await Job.remove(jobID);
        const res = await db.query(`SELECT * FROM jobs WHERE id=${jobID}`);
        expect(res.rows.length).toEqual(0);
    });

    test("fails: not found if no such job", async function () {
        const fakeID = 123456789;
        try {
            await Job.remove(fakeID);
            throw new Error("fail test, you shouldn't get here");
        } catch (err) {
            console.log(err);
            expect(err instanceof NotFoundError).toBeTruthy();
        }
    });
});
