'use strict';

var util = require('util');

var T = require('../helpers/sql/tables');

module.exports = {  
  listConstellations: listConstellations,
  createConstellation: createConstellation,
  getConstellation: getConstellation,
  updateConstellation: updateConstellation
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

function updateConstellation(req, res) {
  req.swagger.params.constellation.value.id = req.swagger.params.constellationId.value;
  T.constellations.update(req.swagger.params.constellation.value).then(data => res.json(data));
}