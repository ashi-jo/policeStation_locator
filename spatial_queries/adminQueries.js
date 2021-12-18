const wards = require("../geoJSON/BMC_wards");
const pool = require("../pool");
const { v4: uuidv4 } = require("uuid");
const gdb_queries = require("../graph_queries/userQueries");
const request = require("request");
const moment = require("moment");
const bcrypt = require("bcrypt");
const axios = require("axios");
const alert = require("alert");

const insertWardGeoJSON = async (req, res) => {
  try {
    var i = 0;

    wards.wards.features.forEach(async (feature) => {
      const response = await pool.query(
        "INSERT INTO ward(ward_name, rewards, ward_location, username, password ) VALUES ($1, $2, ST_setSRID(ST_GeomFromGeoJSON($3)::geography,4326), $4, $5 )",
        [
          feature.properties.name,
          10,
          JSON.stringify(feature.geometry),
          `wardID${feature.properties.name}`,
          `mypassword${feature.properties.name}`,
        ]
      );
    });
    wards.wards.features.forEach(async (feature) => {
      const ward_id = uuidv4();
      await gdb_queries.insertWardInGraphDB(ward_id, feature.properties.name);
    });
    await gdb_queries.insertWardInGraphDB(uuidv4(), "Outside-Mumbai");

    res.send("success");
  } catch (error) {
    throw error;
  }
};

module.exports = { insertWardGeoJSON };
