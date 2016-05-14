'use strict';

var util = require('util');

var T = require('../helpers/sql/tables');

module.exports = {  
  listPlanetarySystems: listPlanetarySystems,
  listGalaxyPlanetarySystems: listGalaxyPlanetarySystems,
  createPlanetarySystem: createPlanetarySystem,
  getPlanetarySystem: getPlanetarySystem
};

function listPlanetarySystems(req, res) {
  T.planetary_systems.get(null, null).then(info => res.json(info));
}

function listGalaxyPlanetarySystems(req, res) {
  T.planetary_systems.get(req.swagger.params.galaxyId.value, null).then(info => res.json(info));
}

function createPlanetarySystem(req, res) {
  T.planetary_systems.new(req.swagger.params.galaxyId.value, req.swagger.params.planetarySystem.value)
  					 .then(data => res.json(data));
}

function getPlanetarySystem(req, res) {
  T.planetary_systems.get(req.swagger.params.galaxyId.value, req.swagger.params.planetarySystemId.value)
  					 .then(data => res.json(data));
}