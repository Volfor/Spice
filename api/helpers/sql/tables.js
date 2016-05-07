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
 * Take only specified fields
 */
function insert_without(table, obj, fields) {
  return knex.insert(without_fields(obj, fields))
             .into(table.name)
             .then(function(ids) { return table.get(ids[0]) })
             .then(function(data) { return without_nulls(data, true) });
}

GLOBAL.tables = {
  celestial_objects: {
    name: "Celestial_Objects",
    fields: ["id", "name", "discoverer", "discovery_date", "discovery_place", "age", "volume", "mass", "radius", 
             "surface_area", "mean_density", "whose_satellite"],
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
  images: {
    name: "Images",
    fields: ["id", "spectrum", "shooting_date", "author", "telescope", "url"],
    init: function (table) {
      table.integer("id");
      table.float("spectrum");
      table.date("shooting_date");
      table.string("author");
      table.string("telescope");
      table.string("url");

      table.timestamps();

      table.primary("id");
    }
  },
  image_object: {
    name: "Image_Object",
    fields: ["image_id", "object_id"],
    init: function (table) {
      table.integer("image_id")
           .references("id")
           .inTable(tables.images.name);
      table.integer("object_id")
           .references("id")
           .inTable(tables.celestial_objects.name);

      table.timestamps();

      table.primary(["image_id", "object_id"]);
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
      return insert_without(tables.constellations, constellation, 
                  ["name", "discoverer", "discovery_date", "discovery_place", "age", "volume", "mass", 
                   "radius", "surface_area", "mean_density", "whose_satellite", "stars"])
        .then(insert_without(tables.celestial_objects, constellation, ["limits", "hill_sphere", "stars"]));      
    },
    get: function(id) {
      var query;
      if (id) {        
        query = knex.first()
                    .from(tables.celestial_objects.name)
                    .innerJoin(tables.constellations.name, tables.celestial_objects.name + ".id", 
                               tables.constellations.name + ".id")
                    .where(tables.constellations.name + ".id", id);
      } else {        
        query = knex.select()
                    .from(tables.celestial_objects.name)
                    .innerJoin(tables.constellations.name, tables.celestial_objects.name + ".id", 
                               tables.constellations.name + ".id");
      }
      return query.then(function (data) { return without_nulls(data, true) });
    }
  },
  stars: {
    name: "Stars",
    fields: ["id", "right_ascension", "declination", "apparent_magnitude", "distance", "radial_velocity", 
             "luminosity", "effective_temperature", "constellation_id", "planetary_system_id"],
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
    new: function(constellationId, star) {            
      star.constellation_id = constellationId;
      return insert_without(tables.stars, star, 
                  ["name", "discoverer", "discovery_date", "discovery_place", "age", "volume", "mass", 
                   "radius", "surface_area", "mean_density", "whose_satellite"])
        .then(insert_without(tables.celestial_objects, star, 
                  ["right_ascension", "declination", "apparent_magnitude", "distance", "radial_velocity", 
                   "luminosity", "effective_temperature", "constellation_id", "planetary_system_id"]));        
    },

    get: function(constellationId, starId) {
      var query;
      if (constellationId) {
        if (starId) {
          query = knex.first().from(tables.celestial_objects.name).innerJoin(tables.stars.name, tables.celestial_objects.name + ".id", tables.stars.name + ".id").where("id", starId);
        } 
        else {
          query = knex.select().from(tables.celestial_objects.name).innerJoin(tables.stars.name, tables.celestial_objects.name + ".id", tables.stars.name + ".id").where("constellation_id", constellationId);
        }        
      } 
      else {
        query = knex.select().from(tables.celestial_objects.name).innerJoin(tables.stars.name, tables.celestial_objects.name + ".id", tables.stars.name + ".id");
      }      
      return query.then(function (data) { return without_nulls(data, true) });
    }
  },
  nebulas: {
    name: "Nebulas",
    fields: ["id", "hill_sphere", "distance", "snow_line", "visible_dimensions", "apparent_magnitude", "constellation_id"],
    init: function (table) {
      table.integer("id");
      table.string("hill_sphere");
      table.float("distance");
      table.float("snow_line");
      table.float("visible_dimensions");
      table.float("apparent_magnitude");

      table.integer("constellation_id")
           .references("id")
           .inTable(tables.constellations.name);

      table.timestamps();

      table.primary("id");
    },
    get: function (constellationId, nebulaId) {
      var query;
      if (constellationId) {
        if (nebulaId) {
          query = knex.first().from(tables.celestial_objects.name).innerJoin(tables.nebulas.name, tables.celestial_objects.name + ".id", tables.nebulas.name + ".id").where("id", nebulaId);
        }
        else {
          query = knex.select().from(tables.celestial_objects.name).innerJoin(tables.nebulas.name, tables.celestial_objects.name + ".id", tables.nebulas.name + ".id").where("constellation_id", constellationId);
        }        
      } 
      else {
        query = knex.select().from(tables.celestial_objects.name).innerJoin(tables.nebulas.name, tables.celestial_objects.name + ".id", tables.nebulas.name + ".id");
      }      
      return query.then(function (data) { return without_nulls(data, true) });
    }
  },
  galaxies: {
    name: "Galaxies",
    fields: ["id", "hill_sphere", "snow_line", "visible_dimensions", "surface_brightness", "distance", "radial_velocity"],
    init: function (table) {
      table.integer("id");
      table.string("hill_sphere");
      table.float("snow_line");
      table.float("visible_dimensions");
      table.float("surface_brightness");
      table.float("distance");
      table.float("radial_velocity");

      table.timestamps();

      table.primary("id");
    },
    new: function(galaxy) {      
      return knex.insert(without_fields(galaxy, ["name", "discoverer", "discovery_date", "discovery_place", "age", "volume", "mass", "radius", "surface_area", "mean_density", "whose_satellite"]))
                .into(tables.galaxies.name)
                .then(function(ids) { return tables.galaxies.get(ids[0]) })
                .then(function(data) { return without_nulls(data, true) })
                .then(function(response) { 
                    return knex.insert(without_fields(galaxy, ["hill_sphere", "snow_line", "visible_dimensions", "surface_brightness", "distance", "radial_velocity"]))
                              .into(tables.celestial_objects.name)
                              .then(function(ids) { return tables.galaxies.get(ids[0]) }) 
                              .then(function(data) { return without_nulls(data, true) })
                });  
    },
    get: function (id) {
      var query;
      if (id) {
        query = knex.first().from(tables.celestial_objects.name).innerJoin(tables.galaxies.name, tables.celestial_objects.name + ".id", tables.galaxies.name + ".id").where(tables.galaxies.name + ".id", id);
      }
      else {
        query = knex.select().from(tables.celestial_objects.name).innerJoin(tables.galaxies.name, tables.celestial_objects.name + ".id", tables.galaxies.name + ".id");
      }     
      return query.then(function (data) { return without_nulls(data, true) }); 
    }
  },
  planetary_systems: {
    name: "Planetary_Systems",
    fields: ["id", "hill_sphere", "snow_line", "galaxy_id"],
    init: function (table) {
      table.integer("id");
      table.string("hill_sphere");
      table.float("snow_line");

      table.integer("galaxy_id")
           .references("id")
           .inTable(tables.galaxies.name);

      table.timestamps();

      table.primary("id");
    },
    get: function (id) {
      var query;
      if (id) {
        query = knex.first().from(tables.celestial_objects.name).innerJoin(tables.planetary_systems.name, tables.celestial_objects.name + ".id", tables.planetary_systems.name + ".id").where(tables.planetary_systems.name + ".id", id);
      }
      else {
        query = knex.select().from(tables.celestial_objects.name).innerJoin(tables.planetary_systems.name, tables.celestial_objects.name + ".id", tables.planetary_systems.name + ".id");
      }
      return query.then(function (data) { return without_nulls(data, true) }); 
    }
  },
  planetoids: {
    name: "Planetoids",
    fields: ["id", "semi_major_axis", "aphelion", "perihelion", "eccentricity", "orbital_inclination", "axial_tilt", "rotation_period", "temperature", "planetary_system_id"],
    init: function (table) {
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
           .references("id")
           .inTable(tables.planetary_systems.name);

      table.timestamps();

      table.primary("id");
    }
  },
  planets: {
    name: "Planets",
    fields: ["id", "day"],
    init: function (table) {
      table.integer("id");
      table.float("day");

      table.timestamps();

      table.primary("id");
    },
    get: function (planetarySystemId, planetId) {
      var query;      
      if (planetarySystemId) {
        if (planetId) {
          query = knex.first().from(tables.celestial_objects.name).innerJoin(tables.planetoids.name, tables.celestial_objects.name + ".id", tables.planetoids.name + ".id").innerJoin(tables.planets.name, tables.planetoids.name + ".id", tables.planets.name + ".id").where("id", planetId);
        } 
        else {
          query = knex.select().from(tables.celestial_objects.name).innerJoin(tables.planetoids.name, tables.celestial_objects.name + ".id", tables.planetoids.name + ".id").innerJoin(tables.planets.name, tables.planetoids.name + ".id", tables.planets.name + ".id").where("planetary_system_id", planetarySystemId);
        }  
      }
      else {
        query = knex.select().from(tables.celestial_objects.name).innerJoin(tables.planetoids.name, tables.celestial_objects.name + ".id", tables.planetoids.name + ".id").innerJoin(tables.planets.name, tables.planetoids.name + ".id", tables.planets.name + ".id");
      }      
      return query.then(function (data) { return without_nulls(data, true) }); 
    }
  },
  dwarf_planets: {
    name: "Dwarf_Planets",
    fields: ["id", "mean_anomaly"],
    init: function (table) {
      table.integer("id");
      table.float("mean_anomaly");

      table.timestamps();

      table.primary("id");
    },
    get: function (planetarySystemId, dwarfPlanetId) {
      var query;            
      if (planetarySystemId) {
        if (dwarfPlanetId) {
           query = knex.first().from(tables.celestial_objects.name).innerJoin(tables.planetoids.name, tables.celestial_objects.name + ".id", tables.planetoids.name + ".id").innerJoin(tables.dwarf_planets.name, tables.planetoids.name + ".id", tables.dwarf_planets.name + ".id").where("id", dwarfPlanetId);
        } 
        else {
          query = knex.select().from(tables.celestial_objects.name).innerJoin(tables.planetoids.name, tables.celestial_objects.name + ".id", tables.planetoids.name + ".id").innerJoin(tables.dwarf_planets.name, tables.planetoids.name + ".id", tables.dwarf_planets.name + ".id").where("planetary_system_id", planetarySystemId);
        }
      }
      else {
        query = knex.select().from(tables.celestial_objects.name).innerJoin(tables.planetoids.name, tables.celestial_objects.name + ".id", tables.planetoids.name + ".id").innerJoin(tables.dwarf_planets.name, tables.planetoids.name + ".id", tables.dwarf_planets.name + ".id");          
      }
      return query.then(function (data) { return without_nulls(data, true) }); 
    }
  },
  asteroids: {
    name: "Asteroids",
    fields: ["id", "mean_anomaly", "snow_line"],
    init: function (table) {
      table.integer("id");
      table.float("mean_anomaly");
      table.float("snow_line");

      table.timestamps();

      table.primary("id");
    },    
    get: function (planetarySystemId, asteroidId) {
      var query;                  
      if (planetarySystemId) {
        if (asteroidId) {
          query = knex.first().from(tables.celestial_objects.name).innerJoin(tables.planetoids.name, tables.celestial_objects.name + ".id", tables.planetoids.name + ".id").innerJoin(tables.asteroids.name, tables.planetoids.name + ".id", tables.asteroids.name + ".id").where("id", asteroidId);
        }
        else {
          query = knex.select().from(tables.celestial_objects.name).innerJoin(tables.planetoids.name, tables.celestial_objects.name + ".id", tables.planetoids.name + ".id").innerJoin(tables.asteroids.name, tables.planetoids.name + ".id", tables.asteroids.name + ".id").where("planetary_system_id", planetarySystemId);
        }
      }
      else {
        query = knex.select().from(tables.celestial_objects.name).innerJoin(tables.planetoids.name, tables.celestial_objects.name + ".id", tables.planetoids.name + ".id").innerJoin(tables.asteroids.name, tables.planetoids.name + ".id", tables.asteroids.name + ".id");          
      }      
      return query.then(function (data) { return without_nulls(data, true) }); 
    }
  },
  comets: {
    name: "Comets",
    fields: ["id", "epoch"],
    init: function (table) {
      table.integer("id");
      table.float("epoch");

      table.timestamps();

      table.primary("id");
    },
    get: function (planetarySystemId, cometId) {
      var query;
      if (planetarySystemId) {
        if (cometId) {
          query = knex.first().from(tables.celestial_objects.name).innerJoin(tables.planetoids.name, tables.celestial_objects.name + ".id", tables.planetoids.name + ".id").innerJoin(tables.comets.name, tables.planetoids.name + ".id", tables.comets.name + ".id").where("id", cometId);
        }
        else {
          query = knex.select().from(tables.celestial_objects.name).innerJoin(tables.planetoids.name, tables.celestial_objects.name + ".id", tables.planetoids.name + ".id").innerJoin(tables.comets.name, tables.planetoids.name + ".id", tables.comets.name + ".id").where("planetary_system_id", planetarySystemId);
        }
      }
      else {
        query = knex.select().from(tables.celestial_objects.name).innerJoin(tables.planetoids.name, tables.celestial_objects.name + ".id", tables.planetoids.name + ".id").innerJoin(tables.comets.name, tables.planetoids.name + ".id", tables.comets.name + ".id");
      }
      return query.then(function (data) { return without_nulls(data, true) }); 
    }
  },
  satellites: {
    name: "Satellites",
    fields: ["id"],
    init: function (table) {
      table.integer("id");
      table.timestamps();
      table.primary("id");
    },
    get: function (planetId, satelliteId) {
      if (planetId) {
        if (satelliteId) {
           query = knex.first().from(tables.celestial_objects.name).innerJoin(tables.planetoids.name, tables.celestial_objects.name + ".id", tables.planetoids.name + ".id").innerJoin(tables.satellites.name, tables.planetoids.name + ".id", tables.satellites.name + ".id").where("id", satelliteId);
        }
        else {
          query = knex.select().from(tables.celestial_objects.name).innerJoin(tables.planetoids.name, tables.celestial_objects.name + ".id", tables.planetoids.name + ".id").innerJoin(tables.satellites.name, tables.planetoids.name + ".id", tables.satellites.name + ".id").where("whose_satellite", planetId);
        }
      }
      else {
         query = knex.select().from(tables.celestial_objects.name).innerJoin(tables.planetoids.name, tables.celestial_objects.name + ".id", tables.planetoids.name + ".id").innerJoin(tables.satellites.name, tables.planetoids.name + ".id", tables.satellites.name + ".id");
      }
    }
  }
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
