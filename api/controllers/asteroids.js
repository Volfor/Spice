'use strict';

var util = require('util');

var T = require('../helpers/sql/tables');

module.exports = {  
  listAsteroids: listAsteroids,
  listPlanetarySystemAsteroids: listPlanetarySystemAsteroids,
  createAsteroid: createAsteroid,
  getAsteroid: getAsteroid
};

function listAsteroids(req, res) {
  T.asteroids.get(null, null).then(info => res.json(info));
}

function listPlanetarySystemAsteroids(req, res) {
  T.asteroids.get(req.swagger.params.planetarySystemId.value, null).then(info => res.json(info));
}

function createAsteroid(req, res) {
  T.asteroids.new(req.swagger.params.planetarySystemId.value, req.swagger.params.asteroid.value)
  			 .then(data => res.json(data));
}

function getAsteroid(req, res) {
  T.asteroids.get(req.swagger.params.planetarySystemId.value, req.swagger.params.asteroidId.value)
  			 .then(data => res.json(data));
}