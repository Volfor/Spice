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

GLOBAL.tables = {
  celestial_objects: {
    name: "Celestial_Objects",
    fields: ["id", "name", "discoverer", "discovery_date", "discovery_place", "age", "volume", "mass", "radius", "surface_area", "mean_density", "whose_satellite"],    
    init: function (table) {
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
           .references("id")
           .inTable(tables.celestial_objects.name);

      table.timestamps();      
    },
    get: function(id) {
      var query;
      if (id) {
        query = knex.select().where("id", id).from(tables.celestial_objects.name);
      } else {
        query = knex.select().from(tables.celestial_objects.name);
      }
      return query.then(function (data) { return without_nulls(data, true) });
    }
  },
  constellations: {
    name: "Constellations",
    fields: ["id", "limits", "hill_sphere"],
    foreignFields: ["stars"],
    init: function (table) {
      table.integer("id");
      table.string("limits");
      table.string("hill_sphere");      
      table.timestamps();

      table.primary("id");
    },
    new: function(constellation) {      
      return knex.insert(without_fields(constellation, ["name", "discoverer", "discovery_date", "discovery_place", "age", "volume", "mass", "radius", "surface_area", "mean_density", "whose_satellite", "stars"]))
                .into(tables.constellations.name)
                .then(function(ids) { return tables.constellations.get(ids[0]) })
                .then(function(data) { return without_nulls(data, true) })
                .then(function(response) { 
                    return knex.insert(without_fields(constellation, ["limits", "hill_sphere", "stars"]))
                              .into(tables.celestial_objects.name)
                              .then(function(ids) { return tables.constellations.get(ids[0]) }) 
                              .then(function(data) { return without_nulls(data, true) })
                });  
    },
    get: function(id) {
      var query;
      if (id) {        
        query = knex.first().from(tables.celestial_objects.name).innerJoin(tables.constellations.name, tables.celestial_objects.name + ".id", tables.constellations.name + ".id").where(tables.constellations.name + ".id", id);
      } else {        
        query = knex.select().from(tables.celestial_objects.name).innerJoin(tables.constellations.name, tables.celestial_objects.name + ".id", tables.constellations.name + ".id");
      }
      return query.then(function (data) { return without_nulls(data, true) });
    }
  },
  stars: {
    name: "Stars",
    fields: ["id", "right_ascension", "declination", "apparent_magnitude", "distance", "radial_velocity", "luminosity", "effective_temperature", "constellation_id", "planetary_system_id"],
    init: function (table) {
      table.integer("id");
      table.float("right_ascension");
      table.float("declination");
      table.float("apparent_magnitude");
      table.float("distance");
      table.float("radial_velocity");
      table.float("luminosity");
      table.float("effective_temperature");
      
      table.integer("constellation_id")
           .references("id")
           .inTable(tables.constellations.name);

      table.timestamps();

      table.primary("id");
    },
    new: function(star) {      
      return knex.insert(without_fields(star, ["name", "discoverer", "discovery_date", "discovery_place", "age", "volume", "mass", "radius", "surface_area", "mean_density", "whose_satellite"]))
                .into(tables.stars.name)
                .then(function(ids) { return tables.stars.get(ids[0]) })
                .then(function(data) { return without_nulls(data[0], true) })
                .then(function(response) { 
                    return knex.insert(without_fields(star, ["right_ascension", "declination", "apparent_magnitude", "distance", "radial_velocity", "luminosity", "effective_temperature", "constellation_id"]))
                              .into(tables.celestial_objects.name)
                              .then(function(ids) { return tables.stars.get(ids[0]) }) 
                              .then(function(data) { return without_nulls(data[0], true) })
                });  
    },
    get: function(id) {
      var query;
      if (id) {                

      } 
      else {        
        query = knex.select().from(tables.celestial_objects.name).innerJoin(tables.stars.name, tables.celestial_objects.name + ".id", tables.stars.name + ".id");
      }
      return query.then(function (data) { return without_nulls(data, true) });
    }
  },  
}

module.exports = {
  createAllTables: function(knex) {
    for (var key in tables) {
      if (tables.hasOwnProperty(key)) {
        knex.schema.createTableIfNotExists(tables[key].name, tables[key].init).return(0)
      }
    }
  },
  dropAllTables: function(knex) {
    for (var key in tables) {
      if (tables.hasOwnProperty(key)) {
        knex.schema.dropTableIfExists(tables[key].name).return(0);
      }
    }
  }
}
