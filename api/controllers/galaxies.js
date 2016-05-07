'use strict';

var util = require('util');

module.exports = {  
  listGalaxies: listGalaxies,
  getGalaxy: getGalaxy,
  createGalaxy: createGalaxy
};

function listGalaxies(req, res) {
  tables.galaxies.get().then(function(info) { res.json(info) });
}

function getGalaxy(req, res) {
  tables.galaxies.get(req.swagger.params.galaxyId.value).then(function(data) { res.json(data) });
}

function createGalaxy(req, res) {
  tables.galaxies.new(req.swagger.params.galaxy.value).then(function(data) { res.json(data) });
}