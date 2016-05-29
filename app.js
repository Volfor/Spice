'use strict';

var SwaggerExpress = require('swagger-express-mw');
var app = require('express')();
var cors = require('cors');
var tables = require('./api/helpers/sql/tables');

module.exports = app; // for testing

var containsAll = function (original, array) {
  return array.every(function(v,i) {
    return original.indexOf(v) !== -1;
  })
}

var config = {
  appRoot: __dirname // required config
};

SwaggerExpress.create(config, function(err, swaggerExpress) {
  if (err) { throw err; }

  // install middleware
  swaggerExpress.register(app);

  var port = process.env.PORT || 10010;
  app.listen(port);
});

app.use(cors());

if (process.env.DEV) {
  GLOBAL.knex = require('knex')({
    client: 'sqlite3',
    connection: {
      filename: "./db.sqlite"
    },
    // useNullAsDefault: true,
    debug: true
  });
} else if (process.env.JAWSDB_URL) {
  GLOBAL.knex = require('knex')({
    client: 'mysql',
    connection: process.env.JAWSDB_URL,
    // useNullAsDefault: true,
    debug: true
  });
} else if (process.env.JAWSDB_MARIA_URL) {
  GLOBAL.knex = require('knex')({
    client: 'mysql',
    connection: process.env.JAWSDB_MARIA_URL,
    searchPath: 'knex,public',
    // useNullAsDefault: true,
    debug: true
  });
} else if (process.env.CLEARDB_DATABASE_URL) {
  GLOBAL.knex = require('knex')({
    client: 'mysql',
    connection: process.env.CLEARDB_DATABASE_URL,
    searchPath: 'knex,public',
    // useNullAsDefault: true,
    debug: true
  });
} else {
  GLOBAL.knex = require('knex')({
    client: 'pg',
    connection: process.env.DATABASE_URL,
    searchPath: 'knex,public',
    // useNullAsDefault: true,
    debug: true
  });
}

var prepareQuery = Promise.resolve(true);
if (process.env.DROP_TABLES) {
  prepareQuery = prepareQuery.then(data => tables.dropAllTables(knex))
                             .then(data => tables.createAllTables(knex))                               
                             .then(data => tables.fillWithTestData(knex))
} else {
  prepareQuery = prepareQuery.then(data => tables.createAllTables(knex));
}

Date.prototype.addMinutes = function(minutes) {
  var copiedDate = new Date(this.getTime());
  return new Date(copiedDate.getTime() + minutes * 60000);
}