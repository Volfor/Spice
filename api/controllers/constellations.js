'use strict';

var util = require('util');

var T = require('../helpers/sql/tables');

module.exports = {  
  listConstellations: listConstellations,
  createConstellation: createConstellation,
  getConstellation: getConstellation
};

function listConstellations(req, res) {
  T.constellations.get(null).then(function(info) { res.json(info) });
}

function getConstellation(req, res) {
  T.constellations.get(req.swagger.params.constellationId.value).then(data => res.json(data));
}

function createConstellation(req, res) {
  T.constellations.new(req.swagger.params.constellation.value).then(function(data) { res.json(data) });
}