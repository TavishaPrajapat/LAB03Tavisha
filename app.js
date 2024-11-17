var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
require('dotenv').config({ path:'./configs/.env' });
// Router Objects
var indexRouter = require("./routes/index");
var transactionsRouter = require("./routes/transactions");
var expensesRouter = require("./routes/expenses");
// var usersRouter = require('./routes/users');
// Import MongoDB and Configuration modules
var mongoose = require("mongoose");
var configs = require("./configs/globals");
// HBS Helper Methods
var hbs = require("hbs");
// Import passport and session modules
var passport = require('passport');
var session = require('express-session');
// Import user model
var User = require('./models/user');
// Import Google Strategy
var GoogleStrategy = require("passport-google-oauth20").Strategy;
// Express App Object
var app = express();

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "hbs");
// Express Configuration
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));
// Configure passport module https://www.npmjs.com/package/express-session
app.use(session({
  secret: 's2021pr0j3ctTracker',
  resave: false,
  saveUninitialized: false
}));
// Initialize passport
app.use(passport.initialize());
app.use(passport.session());

// Make the user object available in all templates
app.use((req, res, next) => {
  res.locals.user = req.user; // `req.user` is set after login
  next();
});

// Link passport to the user model
passport.use(User.createStrategy());

// Configure Google Strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: configs.Authentication.Google.ClientId,
      clientSecret: configs.Authentication.Google.ClientSecret,
      callbackURL: configs.Authentication.Google.CallbackUrl,
    },
    async (accessToken, refreshToken, profile, done) => {
      const user = await User.findOne({ oauthId: profile.id });
      if (user) {
        return done(null, user); // returning existing user
      } else {
        const newUser = new User({
          username: profile.username,
          oauthId: profile.id,
          oauthProvider: 'Google',
          created: Date.now(),
        });
        const savedUser = await newUser.save();
        return done(null, savedUser); // returning newly created user
      }
    }
  )
);


passport.serializeUser((user, cb) => {
  process.nextTick(() => {
    return cb(null, {
      id: user.id,
      username: user.username,
      picture: user.picture,
    });
  });
});

passport.deserializeUser((user, cb) => {
  process.nextTick(() => {
    return cb(null, user);
  });
});

// Routing Configuration
app.use("/", indexRouter);
app.use("/transactions", transactionsRouter);
app.use("/expenses", expensesRouter); // Changed to use expenses route
// app.use('/users', usersRouter);

// Connecting to the DB
mongoose
  .connect(configs.ConnectionStrings.MongoDB, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then((message) => console.log("Connected Successfully!"))
  .catch((error) => console.log(`Error while connecting: ${error}`));

// Sub-Expressions for HBS helpers
hbs.registerHelper("createOptionElement", (currentValue, selectedValue) => {
  var selectedProperty = "";
  if (currentValue == selectedValue.toString()) {
    selectedProperty = "selected";
  }
  return new hbs.SafeString(`<option ${selectedProperty}>${currentValue}</option>`);
});

// Helper function to format date values
hbs.registerHelper('toShortDate', (longDateValue) => {
  return new hbs.SafeString(longDateValue.toLocaleDateString('en-CA'));
});

// Google Authentication Routes
// Trigger Google Login
app.get("/google", passport.authenticate("google", { scope: ["profile", "email"] }));

// Google Callback
app.get(
  "/auth/google/callback",
  passport.authenticate("google", { failureRedirect: "/login" }),
  (req, res) => {
    res.redirect("/transactions"); // Redirect to transactions on successful login
  }
);

// Logout Route
app.get("/logout", (req, res, next) => {
  req.logout((err) => {
    res.redirect("/login");
  });
});

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};
  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;
