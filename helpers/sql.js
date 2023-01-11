const { BadRequestError } = require("../expressError");

/**
 *  Prevents sql injection by taking in key value pairs for datatoUpdate
 *  and provides keys to use that are secure.
 *
 *  Takes in dataToUpdate and jsToSql:
 *  dataToUpdate can include: {name, description, numEmployees, logoUrl}
 *  jsToSql will convert camelCase to snake_case.
 *
 *
 *  Returns an object with two keys:
 *    {SetCol:
 *    Values:
 */


function sqlForPartialUpdate(dataToUpdate, jsToSql) {
  const keys = Object.keys(dataToUpdate);
  if (keys.length === 0) throw new BadRequestError("No data");

  // {firstName: 'Aliya', age: 32} => ['"first_name"=$1', '"age"=$2']
  const cols = keys.map((colName, idx) =>
      `"${jsToSql[colName] || colName}"=$${idx + 1}`,
  );

  return {
    setCols: cols.join(", "),
    values: Object.values(dataToUpdate),
  };
}

module.exports = { sqlForPartialUpdate };
