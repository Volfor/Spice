'use strict';

var util = require('util');

var T = require('../helpers/sql/tables');

module.exports = {  
  listNebulas: listNebulas,
  listConstellationNebulas: listConstellationNebulas,  
  createNebula: createNebula,
  getNebula: getNebula,
  updateNebula: updateNebula
};

function listNebulas(req, res) {
  T.nebulas.get(null, null).then(info => res.json(info));
}

function listConstellationNebulas(req, res) {
  T.nebulas.get(req.swagger.params.constellationId.value, null).then(info => res.json(info));
}

function createNebula(req, res) {
  T.nebulas.new(req.swagger.params.constellationId.value, req.swagger.params.nebula.value).then(data => res.json(data));
}

function getNebula(req, res) {
  T.nebulas.get(req.swagger.params.constellationId.value, req.swagger.params.nebulaId.value).then(data => res.json(data));
}

function updateNebula(req, res) {
  req.swagger.params.nebula.value.id = req.swagger.params.nebulaId.value;
  T.nebulas.update(req.swagger.params.constellationId.value, req.swagger.params.nebula.value)
           .then(data => res.json(data));
}