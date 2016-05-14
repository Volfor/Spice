'use strict';

var util = require('util');

var T = require('../helpers/sql/tables');

module.exports = {  
  listDwarfPlanets: listDwarfPlanets,
  listPlanetarySystemDwarfPlanets: listPlanetarySystemDwarfPlanets,
  createDwarfPlanet: createDwarfPlanet,
  getDwarfPlanet: getDwarfPlanet
};

function listDwarfPlanets(req, res) {
  T.dwarf_planets.get(null, null).then(info => res.json(info));
}

function listPlanetarySystemDwarfPlanets(req, res) {
  T.dwarf_planets.get(req.swagger.params.planetarySystemId.value, null).then(info => res.json(info));
}

function createDwarfPlanet(req, res) {
  T.dwarf_planets.new(req.swagger.params.planetarySystemId.value, req.swagger.params.dwarfPlanet.value)
  				 .then(data => res.json(data));
}

function getDwarfPlanet(req, res) {
  T.dwarf_planets.get(req.swagger.params.planetarySystemId.value, req.swagger.params.dwarfPlanetId.value)
  				 .then(data => res.json(data));
}