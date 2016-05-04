'use strict';

var util = require('util');

module.exports = {
  listStars: listStars,  
  createStar: createStar
};

function listStars(req, res) {
  tables.stars.get(null).then(function(info) { res.json(info) });
}

function createStar(req, res) {
  tables.stars.new(req.swagger.params.star.value).then(function(data) { res.json(data) });
}