const express = require("express");
const path = require("path");
const app = express();
const ejs = require("ejs");
const db = require("./spatial_queries/combinedQueries");
const gdb = require("./graph_queries/userQueries");

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

app.get("/user/register/:ref_id", (req, res) => {
  res.render("userRegister", { ref_id: req.params.ref_id });
});

app.get("/user/login", (req, res) => {
  res.render("userLogin");
});

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

app.get("/user/policeStation/:user_id", (req, res) => {
  if (!req.isAuthenticated()) {
    res.redirect("/user/login");
  } else {
    res.render("policeStation", {
      user_id: req.params.user_id,
      color: "green",

    });
  }
});

app.post("/user/policeStation/:user_id", db.policeStation);

app.post("/user/policeStation/:lat/:long/:user_id", db.viewAllpoliceStation);

//*****************complaint routes************* */

// POST@ /user/complaints/post/:user_id
// user posts a complaint, private

app.post(
  "/user/complaints/post/:user_id",
  // uploadImage,
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

app.post(
  "/user/complaints/ack/:user_id/:resolved_complaint_id",
  db.acknowledgeComplaintResolution
);

//*****************************end ************************ */

app.get("/user/profile/view/:user_id", (req, res) => {
  if (!req.isAuthenticated()) {
    res.redirect("/user/login");
  } else {
    db.getUserProfilePage(req, res);
  }
});

const PORT = 5000 || process.env.PORT;

app.listen(PORT, (err) => {
  console.log(`server running on port ${PORT}`);
});
