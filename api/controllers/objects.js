'use strict';

var util = require('util');

var T = require('../helpers/sql/tables');

module.exports = {
  listObjects: listObjects,
  listPlanetoids: listPlanetoids
};

function listObjects(req, res) {
  T.celestial_objects.get(null).then(info => res.json(info));
}

function listPlanetoids(req, res) {
  T.planetoids.get(null).then(info => res.json(info));
}