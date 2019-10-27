'use strict';

/**
 * @fileOverview _db.js
 *
 * @author Motone Adachi (@waricoma)
 * @version 1.0.0
 */

const Nedb = require('nedb-async').default;

/**
 * main
 * @param {string} dbFilePath db file path
 * @param {string} systemMode system mode
 * @returns {object}
 */
const main = (dbFilePath, systemMode) => {
  if (systemMode === 'test') {
    return new Nedb();
  }

  return new Nedb({
    filename: dbFilePath,
    autoload: true
  });
};

module.exports = main;
