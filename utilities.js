const request = require("request");
const util = require("util");
const exec = util.promisify(require("child_process").exec);
var ExifImage = require("exif").ExifImage;
var im = require("imagemagick");
const pool = require("./pool");



const path = require('path');

const getCoordinatesFromPincode = (pincode) => {
  const options = {
    method: "GET",
    url: `https://us1.locationiq.com/v1/search.php?key=pk.9e8187ff3784e0e5cfef0fe6733bfd25&postalcode=${pincode}&format=json\n&limit=1&countrycodes=IN`,
    headers: {
      Cookie: "__cfduid=d87813cbe48abdce582fcd0f95df5d5331602794222",
    },
  };
  var temp;
  request(options, function (error, response) {
    if (error) return error;
    //console.log(response.body);
    temp = response.body;
    return response.body;
  });
  return temp;
};

const getLocationFromPhoto = async (filename, complaintTypeFolder) => {
  try {
    const { stdout, stderr } = await exec(
      `exiftool -c "%.6f" ./public/${complaintTypeFolder}/` + filename
    );
    // console.log(`stderr:${stderr}`);

    let location = {
      lat: 0.0,
      lng: 0.0,
    };
    // console.log(stdout);
    const lines = stdout.toString().split("\n");
    console.log(lines);
    lines.forEach((line) => {
      const parts = line.split(":");
      if (parts[0].trim() === "GPS Latitude") {
        if (parts[1].trim().includes("N")) {
          parts[1] = parts[1].trim().slice(0, parts[1].trim().length - 1);
        } else {
          parts[1] = "-" + parts[1].trim().slice(0, parts[1].trim().length - 1);
        }
        location.lat = parseFloat(parts[1].trim());
      }
      if (parts[0].trim() === "GPS Longitude") {
        if (parts[1].trim().includes("E")) {
          parts[1] = parts[1].trim().slice(0, parts[1].trim().length - 1);
        } else {
          parts[1] = "-" + parts[1].trim().slice(0, parts[1].trim().length - 1);
        }
        location.lng = parseFloat(parts[1].trim());
      }
    });
    console.log(location);
    return location;
  } catch (error) {
    console.log(`error: ${error.message}`);
    return;
  }
};

//get the BMC ward corresponding to the location
const getBMC_ward = async (lat, long) => {
  try {
    // SELECT ward_name, ST_Intersects(ward_location::geometry, ST_GeomFromText('POINT(72.834654 18.921984)', 4326)::geometry)  FROM ward;
    const response = await pool.query(
      "SELECT * FROM wards where ST_Intersects(ward_location::geometry, ST_SetSRID(ST_MakePoint($1, $2)::geometry,4326))=true",
      [parseFloat(long), parseFloat(lat)]
    );
    //console.log(response);
    return response.rows;
  } catch (error) {
    console.log(error);
  }
};

const tempFunction = () => {
  return "abc";
};


const detectTrash = async (filename) => {
  try {
    // console.log(__dirname);
    // const image = path.join(
    //     path.dirname(fs.realpathSync(__filename)),
    //     `../public/active_complaints/${filename}`
    // );
    const { stdout, stderr } = await exec(
      `cd Trash_Detection && python trashDetect.py --image ${filename}`
    );
    return stdout;
  } catch (error) {
    console.log(`Error: ${error}`);
    return;
  }
}

const getSentimentFromText = async (text) => {
  try {
    const { stdout, stderr } = await exec(
      `cd sentiment_analysis && python sentiment.py --text "${text}"`
    );
    return stdout;
  }
  catch (err) {
    throw err;
  }
}

module.exports = {
  getCoordinatesFromPincode,
  tempFunction,
  getLocationFromPhoto,
  getBMC_ward,
  detectTrash,
  getSentimentFromText
};
