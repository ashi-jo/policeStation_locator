const express = require("express");
const path = require("path");
const app = express();
const ejs = require("ejs");
const db = require("./spatial_queries/combinedQueries");
const gdb = require("./graph_queries/userQueries");

const { uploadImage } = require("./contollers/multipart");
const { resizeImages } = require("./contollers/resize");

//for using passport
const flash = require("connect-flash");
const passport = require("passport");
const request = require("request");
const session = require("express-session");
const pool = require("./pool");
const bcrypt = require("bcrypt");
const LocalStrategy = require("passport-local").Strategy;
app.use(require("cookie-parser")());
const expressSession = require("express-session");
app.use(expressSession({ secret: "mySecretKey" }));
app.use(passport.initialize());
app.use(passport.session());

app.use(flash());
app.use(session({ secret: "keyboard cat" }));

// For parsing application/json
app.use(express.json());

// For parsing application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true }));

app.use(express.static("public"));

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

//GET@ public
//get landing page, public
app.get("/", (req, res) => {
  //res.json({ info: "Node.js, Express, and Postgres API" });
  res.render("index");
});

//***********user authentication routes**********//

//GET@ /user/register
//get user register page, public
// app.get("/user/register", (req, res) => {
//   res.render("userRegister");
// });

//GET@ /user/register/:ref_id
//get user registration page with reference, public
app.get("/user/register/:ref_id", (req, res) => {
  res.render("userRegister", { ref_id: req.params.ref_id });
});

//GET@ /user/login
//get user login page, public
app.get("/user/login", (req, res) => {
  res.render("userLogin");
});

//POST@ /user/register
//post register form, public
app.post("/user/register/:ref_id", db.userRegister);

//POST@ /user/login
//post login form, public
// app.post("/user/login", db.userLogin);
app.post(
  "/user/login",
  passport.authenticate("local", {
    successRedirect: "/user/home",
    failureRedirect: "/user/login",
    failureFlash: true,
  }),
  function (req, res) {
    console.log(req.user);
    res.redirect("/user/home");
  }
);

//GET@ /user/home
app.get("/user/home", (req, res) => {
  if (req.isAuthenticated()) {
    console.log("user id is");

    res.redirect(`/user/complaints/view/${req.user[0].user_id}`);
  } else {
    res.redirect("/user/login");
  }
});

//GET@ /user/logout
app.get("/user/logout", (req, res) => {
  console.log(req.isAuthenticated());
  req.logout();
  console.log(req.isAuthenticated());
  req.flash("success", "Logged out. See you soon!");
  res.redirect("/");
});

//passport initialization
passport.use(
  "local",
  new LocalStrategy(
    { passReqToCallback: true },
    (req, username, password, done) => {
      loginAttempt();
      async function loginAttempt() {
        const client = await pool.connect();
        try {
          await client.query("BEGIN");
          var currentAccountsData = await JSON.stringify(
            client.query(
              "SELECT * FROM users WHERE phone_no=$1",
              [username],
              function (err, result) {
                if (err) {
                  console.log(err);
                  return done(err);
                }
                if (result.rows[0] == null) {
                  console.log("wrong credentials(no user found)");
                  req.flash("danger", "Oops. Incorrect login details.");
                  return done(null, false);
                } else {
                  console.log("email found");
                  bcrypt.compare(
                    password,
                    result.rows[0].password,
                    function (err, check) {
                      if (err) {
                        console.log("Error while checking password");
                        return done();
                      } else {
                        if (check === true) {
                          console.log("password match");
                          console.log(result.rows[0].user_id);
                          return done(null, [
                            {
                              lat: result.rows[0].lat,
                              long: result.rows[0].long,
                              user_id: result.rows[0].user_id,
                              ref_id: result.rows[0].ref_id,
                            },
                          ]);
                        } else {
                          console.log(result.rows[0].password);
                          console.log(password);
                          console.log(password);
                          console.log("no match");
                          return done(null, false);
                        }
                      }
                    }
                  );
                }
              }
            )
          );
        } catch (e) {
          throw e;
        }
      }
    }
  )
);

passport.serializeUser(function (user, done) {
  done(null, user);
});
passport.deserializeUser(function (user, done) {
  done(null, user);
});

//******************end********************** */

//Souchalay
app.get("/user/souchalay/:user_id", (req, res) => {
  if (!req.isAuthenticated()) {
    res.redirect("/user/login");
  } else {
    res.render("souchalay", {
      user_id: req.params.user_id,
      color: "green",
      
    });
  }
});

app.post("/user/souchalay/:user_id", db.souchalay);

/*app.get("/user/souchalay/:lat/:long", (req, res) => {
  res.render("souchalayMap", {
    lat: req.params.lat,
    long: req.params.long,
  });
});*/

app.post("/user/souchalay/:lat/:long/:user_id", db.viewAllSouchalay);

//********************NewsLetter*********************

app.get("/newsletter", (req, res) => {
  gdb.allNews(req, res);
});

//POST@ /newsletter/filter
//for filtering news tags
app.post("/newsletter/filter", gdb.newsletter);

//***************Done Newsletter******************//

//*****************complaint routes************* */

// POST@ /user/complaints/post/:user_id
// user posts a complaint, private

app.post(
  "/user/complaints/post/:user_id",
  uploadImage,
  db.postUserComplaintForm
);

// GET@ /user/complaints/post/:user_id
// show user the complaint form, private
app.get("/user/complaints/post/:user_id", (req, res) => {
  if (!req.isAuthenticated()) {
    res.redirect("/user/login");
  } else {
    res.render("uploadComplaintForm", {
      user_id: req.params.user_id,
      color: "green",
      errors: [{ message: "Make sure to turn on your GPS" }],
    });
  }
});

// GET@ /user/complaints/view/:user_id
// view all complaints posted by other users, private
app.get("/user/complaints/view/:user_id", (req, res) => {
  if (!req.isAuthenticated()) {
    res.redirect("/user/login");
  } else {
    console.log(req.params.user_id);
    db.viewAllComplaints(req, res);
  }
});

// POST@ /users/complaints/view/filter/:user_id
//filtering complaints according to distance

app.post("/user/complaints/view/filter/:user_id", (req, res) => {
  console.log("I am here in post");
  db.filterComplaints(req, res);
});

//GET@ /user/complaints/view/my/:user_id
//view all complaints posted by me but not yet cleaned by anyone
app.get("/user/complaints/view/pending/:user_id", (req, res) => {
  if (!req.isAuthenticated()) {
    res.redirect("/user/login");
  } else {
    db.viewMyActiveComplaints(req, res);
    console.log();
  }
});

//GET@ /user/complaint/view/resolved/:user_id
//view all complaints resolved by BMC
app.get("/user/complaints/view/resolved/:user_id", (req, res) => {
  if (!req.isAuthenticated()) {
    res.redirect("/user/login");
  } else {
    db.viewMyResolvedComplaints(req, res);
    console.log();
  }
});

app.post(
  "/user/complaints/ack/:user_id/:resolved_complaint_id",
  db.acknowledgeComplaintResolution
);

//*****************************end ************************ */

//*****************drives route************* */

// GET@ /user/drives/enroll/:user_id
// shows all the drives organized
app.get("/user/drives/enroll/:user_id", (req, res) => {
  if (!req.isAuthenticated()) {
    res.redirect("/user/login");
  } else {
    db.activeDrives(req, res);
  }
});

// POST@ /user/drives/enroll/:user_id
// for enrolling in a drive
app.post("/user/drives/enroll/:user_id", db.participateCampaign);

// POST@ /user/drives/enroll/filter/:user_id
// for filtering the nearest drives
app.post("/user/drives/enroll/filter/:user_id", db.filterCampaign);

// app.post("/user/drives/enroll/filter/map/:user_id",db.viewDrivesOnMap);
app.get("/user/drives/enroll/map/:user_id", (req, res) => {
  db.viewDrivesOnMap(req, res);
});

app.get("/user/drives/enroll/feedback/:user_id", async (req, res) => {
  try {
    const enrolledDrives = await db.getEnrolledDrives(req.params.user_id);
    res.render("feedbackForm", {
      user_id: req.params.user_id,
      enrolledDrives: enrolledDrives,
    });
  } catch (err) {
    throw err;
  }
});

app.post("/user/drives/enroll/feedback/:user_id", db.feedbackInsert);

//*****************************end ************************ */
//*******************************admin routes******************** */

//for automatic insertion of wards in sdb and gdb
app.post("/admin/insert/wards", db.insertWardGeoJSON);

//GET @ /admin/login
app.get("/admin/login", (req, res) => {
  res.render("adminLogin");
});

//POST @ /admin/login
app.post("/admin/login", db.adminLogin);

// For adminHome

app.get("/admin/home/:ward_id", async (req, res) => {

  const activec = await db.getAdminDetails(req.params.ward_id);
  //const totusers = await gdb.calculateWardRewardPoints(req.params.ward_id);
  console.log("In route");
  console.log(activec[0]);  

  const active = activec[0];
  const resolve = activec[1];

  const rewards = resolve/(active + resolve)*100;

  res.render("adminHome" ,
    {ward_id: req.params.ward_id,
      active:active,
      resolve:resolve,
      rewards:rewards,

    });
});



//GET @ /admin/logout
app.get("/admin/logout", (req, res) => {
  res.redirect("/admin/login");
});

//GET @ /admin/complaints/active/:ward_id
//view all active complaints
app.get("/admin/complaints/active/:ward_id", async (req, res) => {
  try {
    const activeComplaints = await db.getActiveComplaints(req.params.ward_id);
    res.render("adminActiveComplaints", {
      ward_id: req.params.ward_id,
      active_complaints: activeComplaints,
    });
  } catch (error) {
    throw error;
  }
});

// //POST @ /admin/complaints/resolve/:ward_id/:complaint_id
// //resolved a particular complaint
// app.post(
//   "/admin/complaints/resolve/:ward_id/:complaint_id",
//   db.resolveComplaint
// );

//GET @ /admin/complaints/resolved/:ward_id
app.get("/admin/complaints/resolved/:ward_id", async (req, res) => {
  try {
    const resolvedComplaints = await db.getResolvedComplaints(
      req.params.ward_id
    );
    res.render("adminResolvedComplaints", {
      ward_id: req.params.ward_id,
      resolved_complaints: resolvedComplaints,
    });
  } catch (error) {
    throw error;
  }
});

//get the map showing a particular active complaint
app.get("/admin/complaints/:ward_id/:complaint_id/:lat/:long", (req, res) => {
  res.render("adminMap", {
    complaint_id: req.params.complaint_id,
    ward_id: req.params.ward_id,
    lat: req.params.lat,
    long: req.params.long,
  });
});

//get the map showing all active complaints
app.get("/admin/complaints/activeMap/:ward_id", async (req, res) => {
  const activeComplaints = await db.getActiveComplaints(req.params.ward_id);
  // console.log(activeComplaints);
  // var rescue = [];
  // for (var i = 0; i < activeComplaints.length; i++) {
  //   const obj = {
  //     lat: activeComplaints[i].lat,
  //     lng: activeComplaints[i].lng,
  //   };
  //   rescue.push(obj);
  // }
  res.render("adminAllMap", {
    ward_id: req.params.ward_id,
    activeComplaints,
  });
});

//GET @ /admin/drives/initiate/:ward_id
app.get("/admin/drives/initiate/:ward_id", (req, res) => {
  res.render("adminInitiateCampaign", {
    ward_id: req.params.ward_id,
  });
});

app.post("/admin/drives/initiate/:ward_id", db.initiateCampaign);

app.get("/admin/drives/view/:ward_id", async (req, res) => {
  try {
    const campaign_items = await db.getCampaignName(req.params.ward_id);
    const campaign_details = [];
    const count = 0;
    res.render("adminViewPart", {
      ward_id: req.params.ward_id,
      campaign_items: campaign_items,
      campaign_details: campaign_details,
      count: count,
    });
  } catch (error) {
    throw error;
  }
});

app.post("/admin/drives/view/:ward_id", db.viewParticipants);

app.get("/admin/drives/view/sentiment/:ward_id", async (req, res) => {
  try {
    const ward_id = req.params.ward_id;
    const campaign_details = await db.collectCampSenti(req, res);
    // const part = await db.numberOfPart(req,res);
    // const ward_name = await db.wardName(req,res);
    // console.log(result);
    // console.log(part);
    console.log(campaign_details);
    res.render("sentimentCamp", {
      ward_id: ward_id,
      campaign_details: campaign_details,
    });
  } catch (err) {
    throw err;
  }
});

//*************************************end************************** */

//**************************************worker routes**************** */

//GET @ /worker/login

app.get("/worker/login", (req, res) => {
  res.render("workerLogin");
});

//POST @ /worker/login
app.post("/worker/login", db.workerLogin);

//GET @ /worker/upload/:worker_id

app.get("/worker/upload/:worker_id", (req, res) => {
  res.render("workerUpload", { worker_id: req.params.worker_id });
});

//GET @ /worker/logout
app.get("/worker/logout", (req, res) => {
  res.redirect("/worker/login");
});

app.post("/worker/upload/:worker_id", uploadImage, db.postWorkerResolvedForm);

//******************************profile routes ******************** */

app.get("/user/profile/view/:user_id", (req, res) => {
  if (!req.isAuthenticated()) {
    res.redirect("/user/login");
  } else {
    db.getUserProfilePage(req, res);
  }
});

app.get("/test", (req, res) => {
  const developers = [
    { id: 1, name: "Bhargavi Sandur", age: 20 },
    { id: 2, name: "Khushi Jagad", age: 21 },
    { id: 3, name: "Ritika Mangla", age: 20 },
  ];
  //res.status(200).json(developers);
  res.render("test", { developers });
});

const PORT = 5000 || process.env.PORT;

app.listen(PORT, (err) => {
  console.log(`server running on port ${PORT}`);
});
