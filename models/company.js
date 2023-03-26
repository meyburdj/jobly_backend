"use strict";

const db = require("../db");
const { BadRequestError, NotFoundError } = require("../expressError");
const { sqlForPartialUpdate } = require("../helpers/sql");

/** Related functions for companies. */

class Company {
  /**
   *  Prevents sql injection by taking in key value pairs for datatoFilter
   *  and provides inputs useable in a sql query to sanitize the data.
   *
   *  Takes in dataToFilter:
   *    can include:
   *    {name: 'Jane', minEmployees: 100, maxEmployees: 500}
   *
   *  Returns an object with two keys:
   *    {whereStatement: "name ilike %$1% AND "num_employees > $2 AND num_employees < $3"
   *    Values: [%jane%, 100, 500] }
   */
  static sqlForFindAll(dataToFilter) {
    const keys = Object.keys(dataToFilter);

    const statements = {
      nameLike: "name ILIKE ",
      minEmployees: "num_employees >= ",
      maxEmployees: "num_employees <= ",
    };

    // {name: 'Jane', minEmployees: 100, maxEmployees: 500} returns:
    //  ["WHERE name ilike %$1%", "num_employees > $2", num_employees < $3]

    const whereStatements = keys.map((queryParams, idx) => {
      if (idx === 0) {
        return `WHERE ${statements[[queryParams]]}$${idx + 1}`;
      } else {
        return `${statements[[queryParams]]}$${idx + 1}`;
      }
    });

    const values = Object.keys(dataToFilter).map((key) => {
      if (key === "nameLike") {
        dataToFilter[key] = `%${dataToFilter[key]}%`;
      }
      return dataToFilter[key];
    });

    return {
      whereStatement: whereStatements.join(" AND "),
      values,
    };
  }

  /**
   * Create a company (from data), update db, return new company data.
   *
   * data should be { handle, name, description, numEmployees, logoUrl }
   *
   * Returns { handle, name, description, numEmployees, logoUrl }
   *
   * Throws BadRequestError if company already in database.
   * */
  static async create({ handle, name, description, numEmployees, logoUrl }) {
    const duplicateCheck = await db.query(
      `SELECT handle
           FROM companies
           WHERE handle = $1`,
      [handle]
    );

    if (duplicateCheck.rows[0])
      throw new BadRequestError(`Duplicate company: ${handle}`);

    const result = await db.query(
      `INSERT INTO companies(
          handle,
          name,
          description,
          num_employees,
          logo_url)
           VALUES
             ($1, $2, $3, $4, $5)
           RETURNING handle, name, description, num_employees AS "numEmployees",
            logo_url AS "logoUrl"`,
      [handle, name, description, numEmployees, logoUrl]
    );
    const company = result.rows[0];

    return company;
  }

  /**
   * Filter for companies by search terms.
   *
   *  Search terms are optional.
   *
   *  {nameLike, minEmployees, maxEmployees}
   *
   * Returns [{ handle, name, description, numEmployees, logoUrl }, ...]
   *
   * If no results are found, then return the empty array.
   *
   * If no search terms are given, then return all companies.
   * */
  static async findAll(searchTerms = {}) {

    const { whereStatement, values } = Company.sqlForFindAll(searchTerms);

    const companiesRes = await db.query(
      `SELECT handle,
              name,
              description,
              num_employees AS "numEmployees",
              logo_url AS "logoUrl"
        FROM companies
        ${whereStatement}
        ORDER BY name`,
      [...values]
    );
    return companiesRes.rows;
  }

  /** Given a company handle, return data about company.
   *
   * Returns { handle, name, description, numEmployees, logoUrl, jobs }
   *   where jobs is [{ id, title, salary, equity, companyHandle }, ...]
   *
   * Throws NotFoundError if not found.
   **/
  static async get(handle) {
    const companyRes = await db.query(
      `SELECT handle,
                name,
                description,
                num_employees AS "numEmployees",
                logo_url AS "logoUrl"
           FROM companies
           WHERE handle = $1`,
      [handle]
    );

    const company = companyRes.rows[0];

    if (!company) throw new NotFoundError(`No company: ${handle}`);

    const jobsRes = await db.query(
      `SELECT id, title, salary, equity
         FROM jobs
         WHERE company_handle = $1
         ORDER BY id`,
      [handle],
    );

    company.jobs = jobsRes.rows;

    return company;
  }

  /** Update company data with `data`.
   *
   * This is a "partial update" --- it's fine if data doesn't contain all the
   * fields; this only changes provided ones.
   *
   * Data can include: {name, description, numEmployees, logoUrl}
   *
   * Returns {handle, name, description, numEmployees, logoUrl}
   *
   * Throws NotFoundError if not found.
   */

  static async update(handle, data) {
    const { setCols, values } = sqlForPartialUpdate(data, {
      numEmployees: "num_employees",
      logoUrl: "logo_url",
    });

    const handleVarIdx = "$" + (values.length + 1);

    const querySql = `
      UPDATE companies
      SET ${setCols}
        WHERE handle = ${handleVarIdx}
        RETURNING handle, name, description, num_employees AS "numEmployees", logo_url AS "logoUrl"`;
    const result = await db.query(querySql, [...values, handle]);
    const company = result.rows[0];

    if (!company) throw new NotFoundError(`No company: ${handle}`);

    return company;
  }

  /** Delete given company from database; returns undefined.
   *
   * Throws NotFoundError if company not found.
   **/

  static async remove(handle) {
    const result = await db.query(
      `DELETE
           FROM companies
           WHERE handle = $1
           RETURNING handle`,
      [handle]
    );
    const company = result.rows[0];

    if (!company) throw new NotFoundError(`No company: ${handle}`);
  }
}

module.exports = Company;
