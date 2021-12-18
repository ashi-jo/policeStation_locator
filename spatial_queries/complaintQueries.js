const pool = require("../pool");
const { v4: uuidv4 } = require("uuid");
const gdb_queries = require("../graph_queries/userQueries");
const request = require("request");
const moment = require("moment");
const bcrypt = require("bcrypt");
const axios = require("axios");
const alert = require("alert");

//get the active complaints of a particular ward
const getActiveComplaints = async (ward_id) => {
  try {
    const response = await pool.query(
      "SELECT * FROM active_complaints WHERE ward_id=$1",
      [ward_id]
    );
    //console.log(response.rows);
    return response.rows;
  } catch (error) {
    throw error;
  }
};

//get all resolved Complaints of that ward

const getResolvedComplaints = async (ward_id) => {
  try {
    const response = await pool.query(
      "SELECT * FROM resolved_complaints WHERE ward_id=$1",
      [ward_id]
    );
    console.log(response.rows);
    return response.rows;
  } catch (error) {
    throw error;
  }
};

// const resolveComplaint = async (req, res) => {
//   try {
//     const ward_id = req.params.ward_id;
//     const complaint_id = req.params.complaint_id;
//     const result = await pool.query(
//       "SELECT * FROM active_complaints WHERE complaint_id=$1 ",
//       [complaint_id]
//     );
//     console.log("here");
//     console.log(complaint_id);
//     console.log(result.rows);
//     const res1 = await pool.query(
//       "DELETE FROM active_complaints WHERE complaint_id=$1 ",
//       [complaint_id]
//     );

//     //calculate current date and time
//     const today = new Date();
//     const currentMonth =
//       today.getMonth() < 10 ? "0" + today.getMonth() : "" + today.getMonth();
//     console.log(currentMonth);
//     const currentDate =
//       today.getFullYear() + "" + currentMonth + "" + today.getDate();
//     var currentTime = moment().format("HHmmss");

//     const complaint = result.rows[0];

//     const res2 = await pool.query(
//       "INSERT INTO resolved_complaints (complaint_id, user_id, ward_id, image, worker_id, date, time ) VALUES ($1, $2, $3, $4, $5, TO_DATE($6, $7),TO_TIMESTAMP($8, $9))",
//       [
//         complaint_id,
//         complaint.user_id,
//         ward_id,
//         complaint.image,
//         null,
//         currentDate,
//         "YYYYMMDD",
//         currentTime,
//         "HH24MIss",
//       ]
//     );
//     res.redirect(`/admin/complaints/active/${ward_id}`);
//   } catch (error) {
//     throw error;
//   }
// };

module.exports = {
  getActiveComplaints,

  getResolvedComplaints,
};
