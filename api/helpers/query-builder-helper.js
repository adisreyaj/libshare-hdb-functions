'use strict';

const buildInsertQuery = (table, data) => {
  const { keys, values } = Object.keys(data).reduce(
    (acc, key) => {
      acc.keys.push(key);
      const value = data[key];
      let valueToPush = value;
      if (typeof value === 'string') {
        valueToPush = `'${value}'`;
      } else if (Array.isArray(value)) {
        valueToPush = `'[${value.map((item) => `"${item}"`).join(',')}]'`;
      }
      acc.values.push(valueToPush);
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
    ? Object.keys(where).reduce((acc, key) => {
        const value = where[key];
        let valueToPush = null;
        if (typeof value === 'string') {
          valueToPush = `${key} = '${value}'`;
        } else if (Array.isArray(value) && value?.length > 0) {
          valueToPush = `${key} IN (${value.map((item) => `'${item}'`).join(',')})`;
        } else {
          valueToPush = `${key} = ${value}`;
        }
        if (valueToPush != null) acc.push(valueToPush);
        return acc;
      }, [])
    : [];

  const limitClause = limit ? `LIMIT ${limit}` : '';
  const whereClause = where ? `WHERE ${whereConditions.join(' AND ')}` : '';
  return `UPDATE ${table} SET ${updateValues.join(',')} ${whereClause}  ${limitClause}`;
};

const buildGetQuery = (table, fields, opts) => {
  const { where, limit, orderBy, join } = opts;
  const whereConditions = where
    ? Object.keys(opts.where).reduce((acc, key) => {
        const value = opts.where[key];
        let valueToPush = null;
        if (typeof value === 'string') {
          valueToPush = `${key} = '${value}'`;
        } else if (Array.isArray(value) && value?.length > 0) {
          valueToPush = `${key} IN (${value.map((item) => `'${item}'`).join(',')})`;
        } else {
          valueToPush = `${key} = ${value}`;
        }
        if (valueToPush != null) acc.push(valueToPush);
        return acc;
      }, [])
    : [];

  const limitClause = limit ? `LIMIT ${limit}` : '';
  const whereClause = where ? `WHERE ${whereConditions.join(' AND ')}` : '';
  const orderByClause = orderBy ? `ORDER BY ${orderBy}` : '';
  const joinClause = join ? `${join.type} ${join.table} ON ${join.condition}` : '';
  return `SELECT ${fields.join(
    ',',
  )} FROM ${table} ${joinClause} ${whereClause} ${orderByClause} ${limitClause}`;
};

module.exports = {
  buildInsertQuery,
  buildGetQuery,
  buildUpdateQuery,
};
