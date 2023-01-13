"use strict";

/** Routes for companies. */

const jsonschema = require("jsonschema");
const express = require("express");

const { BadRequestError, NotFoundError } = require("../expressError");
const { ensureLoggedIn, ensureAdmin } = require("../middleware/auth");
const Company = require("../models/company");

const companyNewSchema = require("../schemas/companyNew.json");
const companyUpdateSchema = require("../schemas/companyUpdate.json");
const selectCompanies = require("../schemas/selectCompanies.json");

const router = new express.Router();



const db = require("../db");
const { search } = require("superagent");

/** POST / { company } =>  { company }
 *
 * company should be { handle, name, description, numEmployees, logoUrl }
 *
 * Returns { handle, name, description, numEmployees, logoUrl }
 *
 * Authorization required: login & admin
 */

router.post("/", ensureLoggedIn, ensureAdmin, async function (req, res, next) {
  const validator = jsonschema.validate(req.body, companyNewSchema, {
    required: true,
  });
  if (!validator.valid) {
    const errs = validator.errors.map((e) => e.stack);
    throw new BadRequestError(errs);
  }

  const company = await Company.create(req.body);
  return res.status(201).json({ company });
});

/** GET /  =>
 *   { companies: [ { handle, name, description, numEmployees, logoUrl }, ...] }
 *
 * Can filter on provided search filters:
 * - minEmployees
 * - maxEmployees
 * - nameLike (will find case-insensitive, partial matches)
 *
 * Authorization required: none
 */

router.get("/", async function (req, res, next) {
  //If there are no query paramaters then return all companies
  if (
    !(req.query.nameLike || req.query.minEmployees || req.query.maxEmployees)
  ) {
    const companies = await Company.findAll();
    return res.json({ companies });
  }
  //validate query
  let query = req.query;
  if (query?.minEmployees) { query.minEmployees = parseInt(query.minEmployees) }
  if (query?.maxEmployees) { query.maxEmployees = parseInt(query.maxEmployees) }

  const validator = jsonschema.validate(query, selectCompanies, {
    required: true,
  });

  if (!validator.valid) {
    const errs = validator.errors.map((e) => e.stack);
    throw new BadRequestError(errs);
  }

  if (parseInt(req.query?.minEmployees) > parseInt(req.query?.maxEmployees)) {
    throw new BadRequestError(
      "Maximum Employees must be greater than minimum employees"
    );
  }

  // Calls filterCompanies with search query.
  const companies = await Company.findAll(req.query);

  return res.json({ companies });
});

//TODO: added docstring
/** gets information on a specific company by handle
 * returns:
 * { handle, name, description, numEmployees, logoUrl }
 *
 * Authorization required: none
 */
router.get("/:handle", async function (req, res, next) {
  const company = await Company.get(req.params.handle);
  return res.json({ company });
});

/** PATCH /[handle] { fld1, fld2, ... } => { company }
 *
 * Patches company data.
 *
 * fields can be: { name, description, numEmployees, logo_url }
 *
 * Returns { handle, name, description, numEmployees, logo_url }
 *
 * Authorization required: login, admin
 */

router.patch(
  "/:handle",
  ensureLoggedIn,
  ensureAdmin,
  async function (req, res, next) {
    const validator = jsonschema.validate(req.body, companyUpdateSchema, {
      required: true,
    });
    if (!validator.valid) {
      const errs = validator.errors.map((e) => e.stack);
      throw new BadRequestError(errs);
    }

    const company = await Company.update(req.params.handle, req.body);
    return res.json({ company });
  }
);

/** DELETE /[handle]  =>  { deleted: handle }
 *
 * Authorization: login, admin
 */

router.delete(
  "/:handle",
  ensureLoggedIn,
  ensureAdmin,
  async function (req, res, next) {
    await Company.remove(req.params.handle);
    return res.json({ deleted: req.params.handle });
  }
);

module.exports = router;
