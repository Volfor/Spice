'use strict';

var util = require('util');

module.exports = {  
  listSatellites: listSatellites,
  listPlanetSatellites: listPlanetSatellites,
  getSatellite: getSatellite
};

function listSatellites(req, res) {
  tables.satellites.get(null, null).then(function(info) { res.json(info) });
}

function listPlanetSatellites(req, res) {
  tables.satellites.get(req.swagger.params.planetId.value, null).then(function(info) { res.json(info) });
}

function getSatellite(req, res) {
  tables.satellites.get(req.swagger.params.planetId.value, req.swagger.params.satelliteId.value)
  			  .then(function(data) { res.json(data) });
}