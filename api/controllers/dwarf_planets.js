'use strict';

var util = require('util');

module.exports = {  
  listDwarfPlanets: listDwarfPlanets,
  listPlanetarySystemDwarfPlanets: listPlanetarySystemDwarfPlanets,
  getDwarfPlanet: getDwarfPlanet
};

function listDwarfPlanets(req, res) {
  tables.dwarf_planets.get(null, null).then(function(info) { res.json(info) });
}

function listPlanetarySystemDwarfPlanets(req, res) {
  tables.dwarf_planets.get(req.swagger.params.planetarySystemId.value, null).then(function(info) { res.json(info) });
}

function getDwarfPlanet(req, res) {
  tables.dwarf_planets.get(req.swagger.params.planetarySystemId.value, req.swagger.params.dwarfPlanetId.value)
  			  .then(function(data) { res.json(data) });
}