"use strict";

const jsonschema = require("jsonschema");
const { BadRequestError, NotFoundError } = require("../expressError");

/**
 * Will validate data given a schema to run validation against.
 *
 * Returns true if validation passes.
 * On fail will throw error with error stack.
 */
function validate(dataToValidate, schema) {
  const validator = jsonschema.validate(dataToValidate, schema, {
    required: true,
  });

  if (!validator.valid) {
    const errs = validator.errors.map((e) => e.stack);
    throw new BadRequestError(errs);
  }

  return true;
}

module.exports = validate;
