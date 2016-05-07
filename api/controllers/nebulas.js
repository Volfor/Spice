'use strict';

var util = require('util');

module.exports = {  
  listNebulas: listNebulas,
  listConstellationNebulas: listConstellationNebulas,
  getNebula: getNebula
};

function listNebulas(req, res) {
  tables.nebulas.get(null).then(function(info) { res.json(info) });
}

function listConstellationNebulas(req, res) {
  tables.nebulas.get(req.swagger.params.constellationId.value).then(function(info) { res.json(info) });
}

function getNebula(req, res) {
  tables.nebulas.get(req.swagger.params.constellationId.value, req.swagger.params.nebulaId.value)
  			  .then(function(data) { res.json(data) });
}