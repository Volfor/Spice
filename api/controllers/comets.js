'use strict';

var util = require('util');

var T = require('../helpers/sql/tables');

module.exports = {  
  listComets: listComets,
  listPlanetarySystemComets: listPlanetarySystemComets,
  createComet: createComet,
  getComet: getComet
};

function listComets(req, res) {
  T.comets.get(null, null).then(info => res.json(info));
}

function listPlanetarySystemComets(req, res) {
  T.comets.get(req.swagger.params.planetarySystemId.value, null).then(info => res.json(info));
}

function createComet(req, res) {
  T.comets.new(req.swagger.params.planetarySystemId.value, req.swagger.params.comet.value).then(data => res.json(data));
}

function getComet(req, res) {
  T.comets.get(req.swagger.params.planetarySystemId.value, req.swagger.params.cometId.value).then(data => res.json(data));
}