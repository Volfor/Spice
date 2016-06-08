'use strict';

var util = require('util');

var T = require('../helpers/sql/tables');

module.exports = {
  listObjects: listObjects,
  addImage: addImage,
  listImages: listImages,
  listImageObject: listImageObject,
  addObjectToImage: addObjectToImage,
  updateImage: updateImage,
  deleteImage: deleteImage,
  deleteImageObject: deleteImageObject
};

function listObjects(req, res) {
  T.celestial_objects.get(null).then(info => res.json(info));
}

function addImage(req, res) {
  T.images.new(req.swagger.params.image.value, req.swagger.params.objectId.value).then(data => res.json(data));
}

function listImages(req, res) {
  T.images.get(null).then(info => res.json(info));
}

function listImageObject(req, res) {
  T.image_object.get(null).then(info => res.json(info));
}

function addObjectToImage(req, res) {
  T.image_object.new(req.swagger.params.objectId.value, req.swagger.params.imageId.value).then(data => res.json(data));
}

function updateImage(req, res) {
  req.swagger.params.image.value.id = req.swagger.params.imageId.value;
  T.images.update(req.swagger.params.image.value).then(data => res.json(data));
}

function deleteImage(req, res) {
  T.images.remove(req.swagger.params.imageId.value).then(data => res.json({message: "Success"}));
}

function deleteImageObject(req, res) {
  T.image_object.remove(req.swagger.params.objectId.value, req.swagger.params.imageId.value)
          .then(data => res.json({message: "Success"}));
}