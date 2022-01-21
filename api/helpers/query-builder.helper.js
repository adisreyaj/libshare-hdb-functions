const buildInsertQuery = (table, data) => {
  const { keys, values } = Object.keys(data).reduce(
    (acc, key) => {
      acc.keys.push(key);
      const value = data[key];
      acc.values.push(typeof value === 'string' ? `'${value}'` : value);
      return acc;
    },
    { keys: [], values: [] },
  );
  return `INSERT INTO ${table} (${keys.join(',')}) VALUES (${values.join(',')})`;
};

const buildGetQuery = (table, fields, opts) => {
  let query = `SELECT ${fields.join(',')} FROM ${table}`;
  if (opts?.limit) {
    query += ` LIMIT ${opts.limit}`;
  }
  return query;
};

module.exports = {
  buildInsertQuery,
  buildGetQuery,
};
