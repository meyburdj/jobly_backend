const { BadRequestError } = require("../expressError");

/**
 *  Prevents sql injection by taking in key value pairs for datatoUpdate
 *  and provides inputs useable in a sql querry to sanitize the data
 *
 *  Takes in dataToUpdate and jsToSql:
 *  dataToUpdate can include:
 * {columName1: columnName1Value, columnName2: columnName2Value...}
 *
 *  jsToSql will have the conversion of these keys from camelCase to snake_case:
 * {columnName1: "column_name_1", columnName2: "column_name_2"...}
 *
 * Takes keys from jsToSql and creates string that will have a SET query string
 * with the column equal to the correct $int
 *
 *  Returns an object with two keys:
 *    {SetCol: 'column_name_1' = $1, 'column_name_2' = $2, ...,
 *    Values: [columnName1Value, columnName2Value...] }
 */

function sqlForPartialUpdate(dataToUpdate, jsToSql) {
  const keys = Object.keys(dataToUpdate);
  if (keys.length === 0) throw new BadRequestError("No data");

  // {firstName: 'Aliya', age: 32} => ['"first_name"=$1', '"age"=$2']
  const cols = keys.map(
    (colName, idx) => `"${jsToSql[colName] || colName}"=$${idx + 1}`
  );

  return {
    setCols: cols.join(", "),
    values: Object.values(dataToUpdate),
  };
}


module.exports = { sqlForPartialUpdate};
