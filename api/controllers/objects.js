'use strict';

var util = require('util');

module.exports = {
  listObjects: listObjects  
};

function listObjects(req, res) {
  tables.celestial_objects.get(null).then(function(info) { res.json(info) });
}