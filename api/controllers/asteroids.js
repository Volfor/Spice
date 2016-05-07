'use strict';

var util = require('util');

module.exports = {  
  listAsteroids: listAsteroids,
  listPlanetarySystemAsteroids: listPlanetarySystemAsteroids,
  getAsteroid: getAsteroid
};

function listAsteroids(req, res) {
  tables.asteroids.get(null, null).then(function(info) { res.json(info) });
}

function listPlanetarySystemAsteroids(req, res) {
  tables.asteroids.get(req.swagger.params.planetarySystemId.value, null).then(function(info) { res.json(info) });
}

function getAsteroid(req, res) {
  tables.asteroids.get(req.swagger.params.planetarySystemId.value, req.swagger.params.asteroidId.value)
  			  .then(function(data) { res.json(data) });
}