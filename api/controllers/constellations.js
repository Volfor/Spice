'use strict';

var util = require('util');

module.exports = {  
  listConstellations: listConstellations,
  createConstellation: createConstellation,
  getConstellation: getConstellation
};

function listConstellations(req, res) {
  tables.constellations.get(null).then(function(info) { res.json(info) });
}

function getConstellation(req, res) {
  tables.constellations.get(req.swagger.params.constellationId.value).then(function(data) { res.json(data) });
}

function createConstellation(req, res) {
  tables.constellations.new(req.swagger.params.constellation.value).then(function(data) { res.json(data) });
}