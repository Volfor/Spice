'use strict';

var util = require('util');

module.exports = {  
  listPlanets: listPlanets,
  listPlanetarySystemPlanets: listPlanetarySystemPlanets,
  getPlanet: getPlanet
};

function listPlanets(req, res) {
  tables.planets.get(null, null).then(function(info) { res.json(info) });
}

function listPlanetarySystemPlanets(req, res) {
  tables.planets.get(req.swagger.params.planetarySystemId.value, null).then(function(info) { res.json(info) });
}

function getPlanet(req, res) {
  tables.planets.get(req.swagger.params.planetarySystemId.value, req.swagger.params.planetId.value)
  			  .then(function(data) { res.json(data) });
}