'use strict';

var util = require('util');

module.exports = {  
  listStars: listStars,
  listConstellationStars: listConstellationStars,
  getStar: getStar,
  createStar: createStar
};

function listStars(req, res) {
  tables.stars.get(null, null).then(function(info) { res.json(info) });
}

function listConstellationStars(req, res) {
  tables.stars.get(req.swagger.params.constellationId.value, null).then(function(info) { res.json(info) });
}

function getStar(req, res) {
  tables.stars.get(req.swagger.params.constellationId.value, req.swagger.params.starId.value)
  			  .then(function(data) { res.json(data) });
}

function createStar(req, res) {
  tables.stars.new(req.swagger.params.constellationId.value, req.swagger.params.star.value)
  			  .then(function(data) { res.json(data) });
}