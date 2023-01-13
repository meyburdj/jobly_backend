"uses strict";

/** Routes for companies. */

const jsonschema = require("jsonschema");
const express = require("express");

const { BadRequestError, NotFoundError } = require("../expressError");
const { ensureLoggedIn, ensureAdmin } = require("../middleware/auth");
const Job = require("../models/job");

const jobNewSchema = require("../schemas/jobNew.json");
const jobUpdateSchema = require("../schemas/companyUpdate.json");
const selectJobs = require("../schemas/selectCompanies.json");

const router = new express.Router();

const { sqlForPartialUpdate } = require("../helpers/sql.js");

const db = require("../db");


/** POST / { job } =>  { job }
 *
 * company should be { title, salary, equity, company_handle }
 *
 * Returns { title, salary, equity, companyHandle }
 *
 * Authorization required: login & admin
 */

router.post("/", ensureLoggedIn, ensureAdmin, async function (req, res, next) {
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
    !(req.query.salary || req.query.equity || req.query.title)
  ) {
    const jobs = await Job.findAll();
    return res.json({ jobs });
  }
  //validate query
  let query = req.query;
  if (query?.salary) { query.salary = parseInt(query.salary) }


  const validator = jsonschema.validate(query, selectJobs, {
    required: true,
  });

  if (!validator.valid) {
    const errs = validator.errors.map((e) => e.stack);
    throw new BadRequestError(errs);
  }


  // Calls filterCompanies with search query.
  const jobs = await Job.findAll(req.query);

  return res.json({ jobs });
});

/** gets information on a specific job by id
 * returns:
 * { handle, name, description, numEmployees, logoUrl }
 *
 * Authorization required: none
 */

router.get("/:id", async function (req, res, next) {
  const job = await Job.get(req.params.handle);
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
