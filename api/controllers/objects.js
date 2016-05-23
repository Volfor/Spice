'use strict';

var util = require('util');

var T = require('../helpers/sql/tables');

module.exports = {
  listObjects: listObjects
};

function listObjects(req, res) {
  T.celestial_objects.get(null).then(info => res.json(info));
}