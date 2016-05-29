'use strict';

var Promise = require('bluebird');

/**
 * Delete all null (or undefined) properties from an object.
 * Set 'recurse' to true if you also want to delete properties in nested objects.
 */
function delete_null_properties(obj, recurse) {
    for (var i in obj) {
        if (obj[i] === null) {
            delete obj[i];
        } else if (recurse && typeof obj[i] === 'object') {
            delete_null_properties(obj[i], recurse);
        }
    }
}

/**
 * Delete all null (or undefined) properties from an object.
 * Set 'recurse' to true if you also want to delete properties in nested objects.
 */
function without_nulls(obj, recurse) {
  delete_null_properties(obj, recurse);
  return obj;
}

/**
 * Delete all specified fields
 */
function without_fields(obj, fields) {
  var newObj = {}
  for (var key in obj) {
    if (fields.indexOf(key) < 0) {
      newObj[key] = obj[key];
    }
  }
  return newObj;
}

/**
 * Take only specified fields. Works even for items in Array.
 */
function take_fields(obj, fields) {
  var newObj = obj instanceof Array ? [] : {};
  for (var key in obj) {
    if (obj[key] instanceof Object) {
      newObj[key] = take_fields(obj[key], fields);
    } else if (fields.indexOf(key) >= 0) {
      newObj[key] = obj[key];
    }
  }
  return newObj;
}

function insert_child(parentTable, childTable, intoId, obj, parentFields, childFields) {
  return knex.insert(without_fields(obj, childFields))
             .into(parentTable.name)
             .then(ids => {
               obj.id = ids[0];
               return parentTable.get(ids[0]);
             })
             .then(data => without_nulls(data, true))
             .then(() => knex.insert(without_fields(obj, parentFields))
                             .into(childTable.name)
                             .then(ids => intoId ? childTable.get(intoId, ids[0]) : childTable.get(ids[0]))
                             .then(data => without_nulls(data, true)));
}

function insert_planetoid(baseTable, planetoidTable, childTable, planetarySystemId, obj, baseFields, planetoidFields, childFields) {
  var planetoidAndChildFields = planetoidFields.concat(childFields);
  var baseAndChildFields = baseFields.concat(childFields);
  var baseAndPlanetoidFields = baseFields.concat(planetoidFields);
  
  removeFromArray(baseAndChildFields, 'id');
  removeFromArray(baseAndPlanetoidFields, 'id');
    
  return knex.insert(without_fields(obj, planetoidAndChildFields))
             .into(baseTable.name)
             .then(ids => {
               obj.id = ids[0];               
               return baseTable.get(ids[0]);
             })
             .then(data => without_nulls(data, true))
             .then(() => {                
                obj.planetary_system_id = planetarySystemId;
                return knex.insert(without_fields(obj, baseAndChildFields))
                            .into(planetoidTable.name)
                            .then(ids => planetoidTable.get(ids[0]))
                            .then(data => without_nulls(data, true))
                            .then(() => knex.insert(without_fields(obj, baseAndPlanetoidFields))
                                            .into(childTable.name)
                                            .then(ids => childTable.get(planetarySystemId, ids[0]))
                                            .then(data => without_nulls(data, true)))
             });
}

function insert_satellite(baseTable, planetoidTable, childTable, planetId, obj, baseFields, planetoidFields, childFields) {
  var planetoidAndChildFields = planetoidFields.concat(childFields);
  var baseAndChildFields = baseFields.concat(childFields);
  var baseAndPlanetoidFields = baseFields.concat(planetoidFields);
  
  removeFromArray(baseAndChildFields, 'id');
  removeFromArray(baseAndPlanetoidFields, 'id');
    
  return knex.insert(without_fields(obj, planetoidAndChildFields))
             .into(baseTable.name)
             .then(ids => {
               obj.id = ids[0];               
               return baseTable.get(ids[0]);
             })
             .then(data => without_nulls(data, true))
             .then(() => knex.insert(without_fields(obj, baseAndChildFields))
                             .into(planetoidTable.name)
                             .then(ids => planetoidTable.get(ids[0]))
                             .then(data => without_nulls(data, true))
                             .then(() => knex.insert(without_fields(obj, baseAndPlanetoidFields))
                                            .into(childTable.name)
                                            .then(ids => childTable.get(planetId, ids[0]))
                                            .then(data => without_nulls(data, true)))
             );
}

function update_child(parentTable, childTable, intoId, obj, parentFields, childFields) {
  return knex.where(parentTable.name + ".id", obj.id)
              .update(without_nulls(take_fields(obj, parentFields)))
              .table(parentTable.name)
              .then(affectedRows => parentTable.get(obj.id))
              .then(data => without_nulls(data, true))
              .then(() => knex.where(childTable.name + ".id", obj.id)
                          .update(without_nulls(take_fields(obj, childFields)))
                          .table(childTable.name)
                          .then(affectedRows => intoId ? childTable.get(intoId, obj.id) : childTable.get(obj.id))
                          .then(data => without_nulls(data, true)));
}

function update_planetoid(baseTable, planetoidTable, childTable, intoId, obj, baseFields, planetoidFields, childFields) {
  var planetoidFields_ = planetoidFields;
  removeFromArray(planetoidFields_, "id");
  return knex.where(baseTable.name + ".id", obj.id)
             .update(without_nulls(take_fields(obj, baseFields)))
             .table(baseTable.name)
             .then(affectedRows => baseTable.get(obj.id))
             .then(data => without_nulls(data, true))
             .then(() => knex.where(planetoidTable.name + ".id", obj.id)
                             .update(without_nulls(take_fields(obj, planetoidFields_)))
                             .table(planetoidTable.name)
                             .then(affectedRows => planetoidTable.get(obj.id))
                             .then(data => without_nulls(data, true))
                             .then(() => knex.where(childTable.name + ".id", obj.id)
                                             .update(without_nulls(take_fields(obj, childFields)))
                                             .table(childTable.name)
                                             .then(affectedRows => childTable.get(intoId, obj.id))
                                             .then(data => without_nulls(data, true))));
}

function get_with_id(table, id) {
  var query;
  if (id) {
    query = knex.first().where("id", id).from(table.name);
  } else {
    query = knex.select().from(table.name);
  }
  return query.then(data => without_nulls(data, true));
}

function get_child(parentTable, childTable, id) {
  var query;
      if (id) {
        query = knex.first()
                    .from(parentTable.name)
                    .innerJoin(childTable.name, parentTable.name + ".id", childTable.name + ".id")
                    .where(childTable.name + ".id", id);
      } else {        
        query = knex.select()
                    .from(parentTable.name)
                    .innerJoin(childTable.name, parentTable.name + ".id", childTable.name + ".id");
      }
      return query.then(data => without_nulls(data, true));
}

function get_child_from(parentTable, childTable, fromKey, fromId, childId) {
  var query;
      if (fromId) {
        if (childId) {
          query = knex.first()
                      .from(parentTable.name)
                      .innerJoin(childTable.name, parentTable.name + ".id", childTable.name + ".id")
                      .where(childTable.name + ".id", childId);
        } else {
          query = knex.select()
                      .from(parentTable.name)
                      .innerJoin(childTable.name, parentTable.name + ".id", childTable.name + ".id")
                      .where(fromKey, fromId);
        }
      } else {        
        query = knex.select()
                    .from(parentTable.name)
                    .innerJoin(childTable.name, parentTable.name + ".id", childTable.name + ".id");
      }
      return query.then(data => without_nulls(data, true));
}

function get_planetoid(parentTable, planetoidTable, childTable, fromKey, fromId, childId) {
  var query;
      if (fromId) {
        if (childId) {
          query = knex.first()
                      .from(parentTable.name)
                      .innerJoin(planetoidTable.name, parentTable.name + ".id", planetoidTable.name + ".id")
                      .innerJoin(childTable.name, planetoidTable.name + ".id", childTable.name + ".id")
                      .where(childTable.name + ".id", childId);
        } else {
          query = knex.select()
                      .from(parentTable.name)
                      .innerJoin(planetoidTable.name, parentTable.name + ".id", planetoidTable.name + ".id")
                      .innerJoin(childTable.name, planetoidTable.name + ".id", childTable.name + ".id")
                      .where(fromKey, fromId);
        }
      } else {        
        query = knex.select()
                    .from(parentTable.name)
                    .innerJoin(planetoidTable.name, parentTable.name + ".id", planetoidTable.name + ".id")
                    .innerJoin(childTable.name, planetoidTable.name + ".id", childTable.name + ".id");
      }
      return query.then(data => without_nulls(data, true));
}

function remove_with_id(parentTable, childTable, id) {
  var query;
  if (id) {
    query = knex.del()
                .from(childTable.name)
                .where(childTable.name + ".id", id)
                .then(() => knex.del()
                                .from(parentTable.name)
                                .where(parentTable.name + ".id", id));
  } else {
    query = knex.del()
                .from(childTable.name)
                .then(() => knex.del()
                                .from(parentTable.name));
  }
  return query.then(affectedRows => ({"message": "success"}));
}

function remove_planetoid(parentTable, planetoidTable, childTable, id) {
  var query;
  if (id) {
    query = knex.del()
                .from(childTable.name)
                .where(childTable.name + ".id", id)
                .then(() => knex.del()
                                .from(planetoidTable.name)
                                .where(planetoidTable.name + ".id", id)
                                .then(() => knex.del()
                                                .from(parentTable.name)
                                                .where(parentTable.name + ".id", id)));
  } else {
    query = knex.del()
                .from(childTable.name)
                .then(() => knex.del()
                                .from(planetoidTable.name)
                                .then(() => knex.del()
                                                .from(parentTable.name)));
  }
  return query.then(affectedRows => ({"message": "success"}));
}

function removeFromArray(arr, what) {
    var found = arr.indexOf(what);

    while (found !== -1) {
        arr.splice(found, 1);
        found = arr.indexOf(what);
    }
}

var baseFields = ["name", "discoverer", "discovery_date", "discovery_place", "age", "volume", "mass", 
                             "radius", "surface_area", "mean_density", "whose_satellite", "stars"];

var T = {
  celestial_objects: {
    name: "celestial_objects",
    fields: ["id", "name", "discoverer", "discovery_date", "discovery_place", "age", "volume", "mass", "radius", 
             "surface_area", "mean_density", "whose_satellite"],
    init: table => {
      table.increments("id");
      table.string("name");
      table.string("discoverer");
      table.date("discovery_date");
      table.string("discovery_place");
      table.float("age");
      table.float("volume");
      table.float("mass");
      table.float("radius");
      table.float("surface_area");
      table.float("mean_density");
      table.integer("whose_satellite")
           .unsigned()
           .notNullable()
           .references("id")
           .inTable(T.celestial_objects.name);      
    },
    get: id => get_with_id(T.celestial_objects, id),    
  },
  images: {
    name: "images",
    fields: ["id", "spectrum", "shooting_date", "author", "telescope", "url"],
    init: table => {
      table.increments("id");
      table.float("spectrum");
      table.date("shooting_date");
      table.string("author");
      table.string("telescope");
      table.string("url");         
    },
  },
  image_object: {
    name: "image_object",
    fields: ["image_id", "object_id"],
    init: table => {
      table.integer("image_id")
           .unsigned()
           .notNullable()
           .references("id")
           .inTable(T.images.name);
      table.integer("object_id")
           .unsigned()
           .notNullable()
           .references("id")
           .inTable(T.celestial_objects.name);    

      table.primary(["image_id", "object_id"]);
    },
  },
  constellations: {
    name: "constellations",
    fields: ["id", "limits", "hill_sphere"],
    foreignFields: ["stars"],
    init: table => {
      table.integer("id");
      table.string("limits");
      table.string("hill_sphere");

      table.primary("id");
    },    
    new: constellation => {
      var baseFields_ = baseFields;
      baseFields_.push("stars");
      return insert_child(T.celestial_objects, T.constellations, null, constellation, baseFields_, 
                        ["id", "limits", "hill_sphere", "stars"]);
    },   
    update: constellation => update_child(T.celestial_objects, T.constellations, null, constellation, baseFields, 
                ["limits", "hill_sphere"]),
    get: id => get_child(T.celestial_objects, T.constellations, id),
    remove: id =>  remove_with_id(T.celestial_objects, T.constellations, id),
  },
  stars: {
    name: "stars",
    fields: ["id", "right_ascension", "declination", "apparent_magnitude", "distance", "radial_velocity", 
             "luminosity", "effective_temperature", "constellation_id", "planetary_system_id"],
    init: table => {
      table.integer("id");
      table.float("right_ascension");
      table.float("declination");
      table.float("apparent_magnitude");
      table.float("distance");
      table.float("radial_velocity");
      table.float("luminosity");
      table.float("effective_temperature");      
      table.integer("constellation_id")
           .unsigned()
           .notNullable()
           .references("id")
           .inTable(T.constellations.name);

      table.primary("id");
    },
    new: (constellationId, star) => {
      star.constellation_id = constellationId;
      return insert_child(T.celestial_objects, T.stars, constellationId, star, baseFields, T.stars.fields);      
    }, 
    update: (constellationId, star) => {
      childFields_ = T.stars.fields;
      removeFromArray(childFields_, "id");
      return update_child(T.celestial_objects, T.stars, constellationId, star, baseFields, childFields_);
    },
    get: (constellationId, starId) => get_child_from(T.celestial_objects, T.stars, "constellation_id", constellationId, starId),
    remove: id =>  remove_with_id(T.celestial_objects, T.stars, id),
  },
  nebulas: {
    name: "nebulas",
    fields: ["id", "hill_sphere", "distance", "snow_line", "visible_dimensions", "apparent_magnitude", 
             "constellation_id"],
    init: table => {
      table.integer("id");
      table.string("hill_sphere");
      table.float("distance");
      table.float("snow_line");
      table.float("visible_dimensions");
      table.float("apparent_magnitude");
      table.integer("constellation_id")
           .unsigned()
           .notNullable()
           .references("id")
           .inTable(T.constellations.name);      

      table.primary("id");
    },   
    new: (constellationId, nebula) => {
      nebula.constellation_id = constellationId;
      return insert_child(T.celestial_objects, T.nebulas, constellationId, nebula, baseFields, T.nebulas.fields);
    },
    update: (constellationId, nebula) => {
      childFields_ = T.nebulas.fields;
      removeFromArray(childFields_, "id");
      return update_child(T.celestial_objects, T.nebulas, constellationId, nebula, baseFields, childFields_);
    },
    get: (constellationId, nebulaId) => get_child_from(T.celestial_objects, T.nebulas, "constellation_id", 
                constellationId, nebulaId),    
    remove: id =>  remove_with_id(T.celestial_objects, T.nebulas, id),
  },
  galaxies: {
    name: "galaxies",
    fields: ["id", "hill_sphere", "snow_line", "visible_dimensions", "surface_brightness", "distance", 
             "radial_velocity"],
    init: table => {
      table.integer("id");
      table.string("hill_sphere");
      table.float("snow_line");
      table.float("visible_dimensions");
      table.float("surface_brightness");
      table.float("distance");
      table.float("radial_velocity");
      
      table.primary("id");
    },          
    new: galaxy => insert_child(T.celestial_objects, T.galaxies, null, galaxy, baseFields, T.galaxies.fields),
    update: galaxy => {
      childFields_ = T.galaxies.fields;
      removeFromArray(childFields_, "id");
      return update_child(T.celestial_objects, T.galaxies, null, galaxy, baseFields, childFields_);
    },
    get: id => get_child(T.celestial_objects, T.galaxies, id),
    remove: id =>  remove_with_id(T.celestial_objects, T.galaxies, id),
  },
  planetary_systems: {
    name: "planetary_systems",
    fields: ["id", "hill_sphere", "snow_line", "galaxy_id"],
    init: table => {
      table.integer("id");
      table.string("hill_sphere");
      table.float("snow_line");
      table.integer("galaxy_id")
           .unsigned()
           .notNullable()
           .references("id")
           .inTable(T.galaxies.name);

      table.primary("id");
    },  
    new: (galaxyId, planetarySystem) => {
      planetarySystem.galaxy_id = galaxyId;
      return insert_child(T.celestial_objects, T.planetary_systems, galaxyId, planetarySystem, baseFields, 
                T.planetary_systems.fields);
    },
    update: (galaxyId, planetarySystem) => {
      childFields_ = T.planetary_systems.fields;
      removeFromArray(childFields_, "id");
      return update_child(T.celestial_objects, T.planetary_systems, galaxyId, planetarySystem, baseFields, childFields_);
    },
    get: (galaxyId, planetarySystemId) => get_child_from(T.celestial_objects, T.planetary_systems, "galaxy_id", 
                galaxyId, planetarySystemId), 
    remove: id =>  remove_with_id(T.celestial_objects, T.planetary_systems, id),
  },
  planetoids: {
    name: "planetoids",
    fields: ["id", "semi_major_axis", "aphelion", "perihelion", "eccentricity", "orbital_inclination", "axial_tilt", 
             "rotation_period", "temperature", "planetary_system_id"],
    init: table => {
      table.integer("id");
      table.float("semi_major_axis");
      table.float("aphelion");
      table.float("perihelion");
      table.float("eccentricity");
      table.float("orbital_inclination");
      table.float("axial_tilt");
      table.float("rotation_period");
      table.float("temperature");
      table.integer("planetary_system_id")   
           .unsigned()
           .notNullable()
           .references("id")
           .inTable(T.planetary_systems.name);

      table.primary("id");
    },
    get: id => get_with_id(T.planetoids, id),
  },
  planets: {
    name: "planets",
    fields: ["id", "day"],
    init: table => {
      table.integer("id");
      table.float("day");      

      table.primary("id");
    },
    new: (planetarySystemId, planet) => insert_planetoid(T.celestial_objects, T.planetoids, T.planets, 
                planetarySystemId, planet, baseFields, T.planetoids.fields, T.planets.fields),
    update: (planetarySystemId, planet) => update_planetoid(T.celestial_objects, T.planetoids, T.planets, 
                planetarySystemId, planet, baseFields, T.planetoids.fields, ["day"]),
    get: (planetarySystemId, planetId) => get_planetoid(T.celestial_objects, T.planetoids, T.planets,
                "planetary_system_id", planetarySystemId, planetId),
    remove: id =>  remove_planetoid_test(T.celestial_objects, T.planetoids, T.planets, id),     
  },
  dwarf_planets: {
    name: "dwarf_planets",
    fields: ["id", "mean_anomaly"],
    init: table => {
      table.integer("id");
      table.float("mean_anomaly");      

      table.primary("id");
    },
    new: (planetarySystemId, dwarfPlanet) => insert_planetoid(T.celestial_objects, T.planetoids, T.dwarf_planets,
                planetarySystemId, dwarfPlanet, baseFields, T.planetoids.fields, T.dwarf_planets.fields),
    update: (planetarySystemId, dwarfPlanet) => update_planetoid(T.celestial_objects, T.planetoids, T.dwarf_planets, 
                planetarySystemId, dwarfPlanet, baseFields, T.planetoids.fields, ["mean_anomaly"]),
    get: (planetarySystemId, dwarfPlanetId) => get_planetoid(T.celestial_objects, T.planetoids, T.dwarf_planets, 
                "planetary_system_id", planetarySystemId, dwarfPlanetId),
    remove: id =>  remove_planetoid_test(T.celestial_objects, T.planetoids, T.dwarf_planets, id),
  },
  asteroids: {
    name: "asteroids",
    fields: ["id", "mean_anomaly", "snow_line"],
    init: table => {
      table.integer("id");
      table.float("mean_anomaly");
      table.float("snow_line");      

      table.primary("id");
    },
    new: (planetarySystemId, asteroid) => insert_planetoid(T.celestial_objects, T.planetoids, T.asteroids,
                planetarySystemId, asteroid, baseFields, T.planetoids.fields, T.asteroids.fields),
    update: (planetarySystemId, asteroid) => update_planetoid(T.celestial_objects, T.planetoids, T.asteroids, 
                planetarySystemId, asteroid, baseFields, T.planetoids.fields, ["mean_anomaly", "snow_line"]),
    get: (planetarySystemId, asteroidId) => get_planetoid(T.celestial_objects, T.planetoids, T.asteroids, 
                "planetary_system_id", planetarySystemId, asteroidId),    
    remove: id =>  remove_planetoid_test(T.celestial_objects, T.planetoids, T.asteroids, id),
  },
  comets: {
    name: "comets",
    fields: ["id", "epoch"],
    init: table => {
      table.integer("id");
      table.float("epoch");
      
      table.primary("id");
    }, 
    new: (planetarySystemId, comet) => insert_planetoid(T.celestial_objects, T.planetoids, T.comets, 
                planetarySystemId, comet, baseFields, T.planetoids.fields, T.comets.fields),
    update: (planetarySystemId, comet) => update_planetoid(T.celestial_objects, T.planetoids, T.comets, 
                planetarySystemId, comet, baseFields, T.planetoids.fields, ["epoch"]),
    get: (planetarySystemId, cometId) => get_planetoid(T.celestial_objects, T.planetoids, T.comets, 
                "planetary_system_id", planetarySystemId, cometId),    
    remove: id =>  remove_planetoid_test(T.celestial_objects, T.planetoids, T.comets, id),
  },
  satellites: {
    name: "satellites",
    fields: ["id"],
    init: table => {
      table.integer("id");

      table.primary("id");
    }, 
    new: (planetId, satellite) => {
      satellite.whose_satellite = planetId;
      return insert_satellite(T.celestial_objects, T.planetoids, T.satellites, planetId, satellite, baseFields, 
                T.planetoids.fields, T.satellites.fields);
    },
    update: (planetId, satellite) => {      
      satellite.whose_satellite = planetId;
      return update_planetoid(T.celestial_objects, T.planetoids, T.satellites, planetId, satellite, baseFields, 
                T.planetoids.fields, T.satellites.fields);
    },
    get: (planetId, satelliteId) => get_planetoid(T.celestial_objects, T.planetoids, T.satellites, "whose_satellite",
                planetId, satelliteId),     
    remove: id =>  remove_planetoid_test(T.celestial_objects, T.planetoids, T.satellites, id),
  },

  /*
   * Global database functions
   */
  createAllTables: function(knex) {
    var query = Promise.resolve(true);
    for (var key in T) {
      if (T.hasOwnProperty(key) && !(T[key] instanceof Function)) {
        let tbl = T[key];
        if (tbl.clearOnInit) query = query.then(data => knex.schema.dropTableIfExists(tbl.name));
        query = query.then(data => knex.schema.createTableIfNotExists(tbl.name, tbl.init));
        if (tbl.afterInit) query = query.then(data => tbl.afterInit());
      }
    }
    return query;
  },
  dropAllTables: function(knex) {
    var query = Promise.resolve(true);
    for (var key in T) {
      if (T.hasOwnProperty(key) && !(T[key] instanceof Function)) {
        query = query.then(data => knex.schema.dropTableIfExists(T[key].name));
        let tbl = T[key];
        query = query.then(data => knex.schema.dropTableIfExists(tbl.name));
      }
    }
    return query;
  }
}

module.exports = T;