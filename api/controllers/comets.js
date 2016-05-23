'use strict';

var util = require('util');

var T = require('../helpers/sql/tables');

module.exports = {  
  listComets: listComets,
  listPlanetarySystemComets: listPlanetarySystemComets,
  createComet: createComet,
  getComet: getComet,
  updateComet: updateComet,
  deleteComet: deleteComet
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

function updateComet(req, res) {
  req.swagger.params.comet.value.id = req.swagger.params.cometId.value;
  T.comets.update(req.swagger.params.planetarySystemId.value, req.swagger.params.comet.value)
          .then(data => res.json(data));
}

function deleteComet(req, res) {
  T.comets.remove(req.swagger.params.cometId.value).then(data => res.json({message: "Success"}));
}