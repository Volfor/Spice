'use strict';

var util = require('util');

module.exports = {  
  listPlanetarySystems: listPlanetarySystems,
  getPlanetarySystem: getPlanetarySystem
};

function listPlanetarySystems(req, res) {
  tables.planetary_systems.get().then(function(info) { res.json(info) });
}

function getPlanetarySystem(req, res) {
  tables.planetary_systems.get(req.swagger.params.planetarySystemId.value).then(function(data) { res.json(data) });
}