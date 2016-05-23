'use strict';

var util = require('util');

var T = require('../helpers/sql/tables');

module.exports = {  
  listStars: listStars,
  listConstellationStars: listConstellationStars,
  createStar: createStar,
  getStar: getStar,
  updateStar: updateStar
};

function listStars(req, res) {
  T.stars.get(null, null).then(info => res.json(info));
}

function listConstellationStars(req, res) {
  T.stars.get(req.swagger.params.constellationId.value, null).then(info => res.json(info));
}

function createStar(req, res) {
  T.stars.new(req.swagger.params.constellationId.value, req.swagger.params.star.value).then(data => res.json(data));
}

function getStar(req, res) {
  T.stars.get(req.swagger.params.constellationId.value, req.swagger.params.starId.value).then(data => res.json(data));
}

function updateStar(req, res) {
  req.swagger.params.star.value.id = req.swagger.params.starId.value;
  T.stars.update(req.swagger.params.constellationId.value, req.swagger.params.star.value).then(data => res.json(data));
}