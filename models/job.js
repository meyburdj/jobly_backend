"use strict";

const db = require("../db");
const { BadRequestError, NotFoundError } = require("../expressError");
const { sqlForPartialUpdate, sqlForSelectCompany } = require("../helpers/sql");

/** Related functions for companies. */

class Job {
    /** Create a job (from data), update db, return new job data.
     *
     * data should be { title, salary, equity, company_handle }
     *
     * Returns { title, salary, equity, companyHandle }
     *
     * Throws BadRequestError if company already in database.
     * */

    static async create({ title, salary, equity, company_handle }) {

        const result = await db.query(
            `INSERT INTO jobs(
          title,
          salary,
          equity,
          company_handle,
          )
           VALUES
             ($1, $2, $3, $4)
           RETURNING title, salary, equity, company_handle AS "companyHandle" `,
            [title, salary, equity, company_handle]
        );
        const job = result.rows[0];

        return job;
    }

    /** Find all jobs.
     *
     * Returns [{ title, salary, equity, companyHandle }, ...]
     * */

    //TODO: combine w/ filter
    static async findAll() {
        const jobsRes = await db.query(
            `SELECT title,
                salary,
                equity,
                company_handle AS "companyHandle"                
           FROM jobs
           ORDER BY title`
        );
        return jobsRes.rows;
    }

    /** Given a job id, return data about job.
     *
     * Returns { title, salary, equity, company_handle }
     *
     * Throws NotFoundError if not found.
     **/

    static async get(id) {
        const jobRes = await db.query(
            `SELECT title,
                salary,
                equity,
                company_handle AS "companyHandle",             
           FROM jobs
           WHERE id = $1`,
            [id]
        );

        const job = jobRes.rows[0];

        if (!job) throw new NotFoundError(`No job: ${id}`);

        return job;
    }



    /** Update job data with `data`.
     *
     * This is a "partial update" --- it's fine if data doesn't contain all the
     * fields; this only changes provided ones.
    *
    * Data can include: {title, salary, equity, companyHandle}
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

    // /** Filter for companies by search terms.
    //  *  Search terms are optional.
    //  *
    //  *  {nameLike, minEmployees, maxEmployees}
    //  *
    //  * Returns [{ handle, name, description, numEmployees, logoUrl }, ...]
    //  *
    //  * If no results are found, then return the empty list.
    //  * */
    // static async filterCompanies(searchTerms = {}) {
    //     const { whereStatement, values } = sqlForSelectCompany(searchTerms);

    //     const results = await db.query(
    //         `SELECT handle,
    //           name,
    //           description,
    //           num_employees AS "numEmployees",
    //           logo_url AS "logoUrl"
    //     FROM companies
    //     WHERE ${whereStatement}`,
    //         [...values]
    //     );

    //     return results.rows;
    // }