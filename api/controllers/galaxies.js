'use strict';

var util = require('util');

var T = require('../helpers/sql/tables');

module.exports = {  
  listGalaxies: listGalaxies,
  createGalaxy: createGalaxy,
  getGalaxy: getGalaxy,
  updateGalaxy: updateGalaxy,
  deleteGalaxy: deleteGalaxy
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

function updateGalaxy(req, res) {
  req.swagger.params.galaxy.value.id = req.swagger.params.galaxyId.value;
  T.galaxies.update(req.swagger.params.galaxy.value).then(data => res.json(data));
}

function deleteGalaxy(req, res) {
  T.galaxies.remove(req.swagger.params.galaxyId.value).then(data => res.json({message: "Success"}));
}