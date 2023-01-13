"uses strict";

/** Routes for companies. */

const jsonschema = require("jsonschema");
const express = require("express");

const { BadRequestError, NotFoundError } = require("../expressError");
const { ensureLoggedIn, ensureAdmin } = require("../middleware/auth");
const Job = require("../models/job");

const jobNewSchema = require("../schemas/jobNewSchema.json");
const jobUpdateSchema = require("../schemas/jobUpdateSchema.json");
const selectJobs = require("../schemas/selectJobs.json");

const router = new express.Router();



const db = require("../db");


/** POST / { job } =>  { job }
 *
 * job should be { title, salary, equity, company_handle }
 *
 * Returns { title, salary, equity, companyHandle }
 *
 * Authorization required: login & admin
 */

router.post("/", ensureLoggedIn, ensureAdmin, async function (req, res, next) {
  console.log("I've hit the post route")
  const validator = jsonschema.validate(req.body, jobNewSchema, {
    required: true,
  });
  if (!validator.valid) {
    const errs = validator.errors.map((e) => e.stack);
    throw new BadRequestError(errs);
  }

  const job = await Job.create(req.body);
  return res.status(201).json({ job });
});

/** GET /  =>
 *   { jobs: [{ title, salary, equity, companyHandle }, ...] }
 *
 * Can filter on provided search filters:
 * - salary
 * - equity (boolean, if false or null/undefined will return all equities)
 * - title (will find case-insensitive, partial matches)
 *
 * Authorization required: none
 */

router.get("/", async function (req, res, next) {
  //If there are no query paramaters then return all jobs
  if (
    !(req.query.minSalary || req.query.equity || req.query.titleLike)
  ) {
    const jobs = await Job.findAll();
    return res.json({ jobs });
  }
  //validate query
  let query = req.query;
  console.log("query.equity: ", query.equity)
  console.log("query.equity type: ", typeof query.equity)
  if (query?.minSalary) { query.minSalary = parseInt(query.minSalary) }
  if (query?.equity) {
    query.equity = JSON.parse(query.equity);
    console.log("query.equity jsoned: ", query.equity)
    console.log("query.equity jsoned type: ", typeof query.equity)
  }


  const validator = jsonschema.validate(query, selectJobs, {
    required: true,
  });

  if (!validator.valid) {
    const errs = validator.errors.map((e) => e.stack);
    throw new BadRequestError(errs);
  }

  console.log("query at the end", query)
  // Calls filterCompanies with search query.
  const jobs = await Job.findAll(query);

  return res.json({ jobs });
});

/** gets information on a specific job by id
 * returns:
 * { handle, name, description, numEmployees, logoUrl }
 *
 * Authorization required: none
 */

router.get("/:id", async function (req, res, next) {
  const job = await Job.get(req.params.id);
  return res.json({ job });
});

/** PATCH /[id] { fld1, fld2, ... } => { job }
 *
 * Patches job data.
 *
 * fields can be: { title, salary, equity, company_handle }
 *
 * Returns { id, title, salary, equity, companyHandle }
 *
 * Authorization required: login, admin
 */

router.patch(
  "/:id",
  ensureLoggedIn,
  ensureAdmin,
  async function (req, res, next) {
    console.log("i've hit the patch route")
    const validator = jsonschema.validate(req.body, jobUpdateSchema, {
      required: true,
    });
    if (!validator.valid) {
      const errs = validator.errors.map((e) => e.stack);
      throw new BadRequestError(errs);
    }

    const job = await Job.update(req.params.id, req.body);
    return res.json({ job });
  }
);

/** DELETE /[id]  =>  { deleted: id }
 *
 * Authorization: login, admin
 */

router.delete(
  "/:id",
  ensureLoggedIn,
  ensureAdmin,
  async function (req, res, next) {
    await Job.remove(req.params.id);
    return res.json({ deleted: req.params.id });
  }
);

module.exports = router;
