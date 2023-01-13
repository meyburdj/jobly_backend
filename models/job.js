"use strict";

const db = require("../db");
const { BadRequestError, NotFoundError } = require("../expressError");
const { sqlForPartialUpdate } = require("../helpers/sql");

/** Related functions for companies. */

class Job {
  /** TODO: Add docstrings. */
  // INPUT {titleLike: "A", minSalary: 90000, hasEquity: true}
  static sqlForFindAll(dataToFilter) {
    const keys = Object.keys(dataToFilter);

    const statements = {
      titleLike: "title ILIKE ",
      minSalary: "salary >= ",
      hasEquity: "equity > ",
    };

    const whereStatements = keys.map((queryParams, idx) => {
      if (idx === 0) {
        // added WHERE use is more flexible.
        return `WHERE ${statements[[queryParams]]}$${idx + 1}`;

      } else if (dataToFilter[queryParams] === 'false' || !dataToFilter[queryParams]) {
        return null
      } else {
        return `${statements[[queryParams]]}$${idx + 1}`;
      }
    })?.filter(items => items !== null);


    const values = Object.keys(dataToFilter).map((key) => {
      if (key === 'titleLike') {
        dataToFilter[key] = `%${dataToFilter[key]}%`;
      } else if (key === 'hasEquity') {
        dataToFilter[key] = 0;
      }

      return dataToFilter[key];
    });

    return {
      whereStatement: whereStatements.join(" AND "),
      values,
    };
  }

  /** Create a job (from data), update db, return new job data.
   *
   * data should be { title, salary, equity, company_handle }
   *
   * Returns { title, salary, equity, companyHandle }
   *
   * Throws BadRequestError if company already in database.
   * */

  static async create({ title, salary, equity, companyHandle }) {
    const result = await db.query(
      `INSERT INTO jobs(
          title,
          salary,
          equity,
          company_handle)
           VALUES
             ($1, $2, $3, $4)
           RETURNING title, salary, equity, company_handle AS "companyHandle" `,
      [title, salary, equity, companyHandle]
    );
    const job = result.rows[0];

    return job;
  }

  /** Find all jobs.
   *
   * Returns [{ title, salary, equity, companyHandle }, ...]
   * */

  //TODO: Add better docstrings.
  static async findAll(searchTerms={}) {
    const { whereStatement, values } = Job.sqlForFindAll(searchTerms);

    const jobsRes = await db.query(
      `SELECT title,
                salary,
                equity,
                company_handle AS "companyHandle"
           FROM jobs
           ${whereStatement}
           ORDER BY title`,
      [...values]
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
                company_handle AS "companyHandle"
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
   * Data can include: {title, salary, equity}
   *
   * Returns {id, title, salary, equity, companyHandle}
   *
   * Throws NotFoundError if not found.
   */

  static async update(id, data) {
    try {
      //To pass/fail (I GIVE UP ON THIS ONE! ARG)
      await Job.get(id);
      parseInt(id)
    } catch(err) {
        throw new NotFoundError(`No job with id ${id}`)
    }
    const { setCols, values } = sqlForPartialUpdate(data, {
      companyHandle: "company_handle",
    });

    const idVarIdx = "$" + (values.length + 1);

    const querySql = `
      UPDATE jobs
      SET ${setCols}
      WHERE id = ${idVarIdx}
        RETURNING id, title, salary, equity, company_handle AS "companyHandle"`;
    const result = await db.query(querySql, [...values, id]);
    const job = result.rows[0];


    if (!job) throw new NotFoundError(`No job: ${id}`);

    return job;
  }

  /** Delete given job from database; returns undefined.
   *
   * Throws NotFoundError if job not found.
   **/

  static async remove(id) {
    const result = await db.query(
      `DELETE
           FROM jobs
           WHERE id = $1
           RETURNING id`,
      [id]
    );
    const job = result.rows[0];

    if (!job) throw new NotFoundError(`No job: ${id}`);
  }
}

module.exports = Job;
