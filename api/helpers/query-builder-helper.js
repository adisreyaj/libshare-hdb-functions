'use strict';

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

const buildUpdateQuery = (table, data, opts) => {
  const updateValues = Object.keys(data).reduce((acc, key) => {
    const value = data[key];
    acc.push(`${key} = ${typeof value === 'string' ? `'${value}'` : value}`);
    return acc;
  }, []);
  const { where, limit } = opts;

  const whereConditions = where
    ? Object.keys(opts.where).reduce((acc, key) => {
        const value = opts.where[key];
        acc.push(`${key} = ${typeof value === 'string' ? `'${value}'` : value}`);
        return acc;
      }, [])
    : [];

  const limitClause = limit ? `LIMIT ${limit}` : '';
  const whereClause = where ? `WHERE ${whereConditions.join(' AND ')}` : '';
  return `UPDATE ${table} SET ${updateValues.join(',')} ${whereClause}  ${limitClause}`;
};

const buildGetQuery = (table, fields, opts) => {
  const { where, limit, orderBy } = opts;
  const whereConditions = where
    ? Object.keys(opts.where).reduce((acc, key) => {
        const value = opts.where[key];
        acc.push(`${key} = ${typeof value === 'string' ? `'${value}'` : value}`);
        return acc;
      }, [])
    : [];

  const limitClause = limit ? `LIMIT ${limit}` : '';
  const whereClause = where ? `WHERE ${whereConditions.join(' AND ')}` : '';
  const orderByClause = orderBy ? `ORDER BY ${orderBy}` : '';
  return `SELECT ${fields.join(',')} FROM ${table} ${whereClause} ${orderByClause} ${limitClause}`;
};

module.exports = {
  buildInsertQuery,
  buildGetQuery,
  buildUpdateQuery,
};
