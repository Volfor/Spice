'use strict';

var util = require('util');

var T = require('../helpers/sql/tables');

module.exports = {  
  listPlanets: listPlanets,
  listPlanetarySystemPlanets: listPlanetarySystemPlanets,
  createPlanet: createPlanet,
  getPlanet: getPlanet,
  updatePlanet: updatePlanet
};

function listPlanets(req, res) {
  T.planets.get(null, null).then(info => res.json(info));
}

function listPlanetarySystemPlanets(req, res) {
  T.planets.get(req.swagger.params.planetarySystemId.value, null).then(info => res.json(info));
}

function createPlanet(req, res) {
  T.planets.new(req.swagger.params.planetarySystemId.value, req.swagger.params.planet.value).then(data => res.json(data));
}

function getPlanet(req, res) {
  T.planets.get(req.swagger.params.planetarySystemId.value, req.swagger.params.planetId.value)
  		     .then(data => res.json(data));
}

function updatePlanet(req, res) {
  req.swagger.params.planet.value.id = req.swagger.params.planetId.value;
  T.planets.update(req.swagger.params.planetarySystemId.value, req.swagger.params.planet.value)
           .then(data => res.json(data));
}