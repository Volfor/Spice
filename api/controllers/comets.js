'use strict';

var util = require('util');

module.exports = {  
  listComets: listComets,
  listPlanetarySystemComets: listPlanetarySystemComets,
  getComet: getComet
};

function listComets(req, res) {
  tables.comets.get(null, null).then(function(info) { res.json(info) });
}

function listPlanetarySystemComets(req, res) {
  tables.comets.get(req.swagger.params.planetarySystemId.value, null).then(function(info) { res.json(info) });
}

function getComet(req, res) {
  tables.comets.get(req.swagger.params.planetarySystemId.value, req.swagger.params.cometId.value)
  			  .then(function(data) { res.json(data) });
}