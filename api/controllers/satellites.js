'use strict';

var util = require('util');

var T = require('../helpers/sql/tables');

module.exports = {  
  listSatellites: listSatellites,
  listPlanetSatellites: listPlanetSatellites,
  createSatellite: createSatellite,
  getSatellite: getSatellite
};

function listSatellites(req, res) {
  T.satellites.get(null, null).then(info => res.json(info));
}

function listPlanetSatellites(req, res) {
  T.satellites.get(req.swagger.params.planetId.value, null).then(info => res.json(info));
}

function createSatellite(req, res) {
  T.satellites.new(req.swagger.params.planetId.value, req.swagger.params.satellite.value).then(data => res.json(data));
}

function getSatellite(req, res) {
  T.satellites.get(req.swagger.params.planetId.value, req.swagger.params.satelliteId.value).then(data => res.json(data));
}