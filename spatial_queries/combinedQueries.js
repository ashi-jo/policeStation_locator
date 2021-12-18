const adminQueries = require("./adminQueries");
const userQueries = require("./userQueries");
const complaintQueries = require("./complaintQueries");
//Admin Queries

//User Queries

const userRegister = userQueries.userRegister;
const userLogin = userQueries.userLogin;
const postUserComplaintForm = userQueries.postUserComplaintForm;
const viewAllComplaints = userQueries.viewAllComplaints;
const getUserComplaintForm = userQueries.getUserComplaintForm;
const activeDrives = userQueries.activeDrives;
const participateCampaign = userQueries.participateCampaign;
const filterCampaign = userQueries.filterCampaign;
const insertWardGeoJSON = adminQueries.insertWardGeoJSON;
const getUserProfilePage = userQueries.getUserProfilePage;
const viewDrivesOnMap = userQueries.viewDrivesOnMap;
const getEnrolledDrives = userQueries.getEnrolledDrives;
const feedbackInsert = userQueries.feedbackInsert;


const getActiveComplaints = complaintQueries.getActiveComplaints;
const getResolvedComplaints = complaintQueries.getResolvedComplaints;

const viewMyActiveComplaints = userQueries.viewMyActiveComplaints;
const viewMyResolvedComplaints = userQueries.viewMyResolvedComplaints;
const acknowledgeComplaintResolution =
  userQueries.acknowledgeComplaintResolution;

const policeStation = userQueries.policeStation;
const viewAllpoliceStation = userQueries.viewAllpoliceStation;

const filterComplaints = userQueries.filterComplaints;

//Worker Queries

module.exports = {
  userRegister,
  userLogin,
  postUserComplaintForm,
  viewAllComplaints,
  getUserComplaintForm,
  activeDrives,
  participateCampaign,
  filterCampaign,
  insertWardGeoJSON,
  getUserProfilePage,
  getActiveComplaints,
  getResolvedComplaints,
  viewMyActiveComplaints,
  viewMyResolvedComplaints,
  acknowledgeComplaintResolution,
  policeStation,
  viewDrivesOnMap,
  getEnrolledDrives,
  feedbackInsert,
  filterComplaints,
  viewAllpoliceStation
};
