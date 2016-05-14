'use strict';

var util = require('util');

var T = require('../helpers/sql/tables');

module.exports = {  
  listGalaxies: listGalaxies,
  getGalaxy: getGalaxy,
  createGalaxy: createGalaxy
};

function listGalaxies(req, res) {
  T.galaxies.get().then(info => res.json(info));
}

function getGalaxy(req, res) {
  T.galaxies.get(req.swagger.params.galaxyId.value).then(data => res.json(data));
}

function createGalaxy(req, res) {
  T.galaxies.new(req.swagger.params.galaxy.value).then(data => res.json(data));
}