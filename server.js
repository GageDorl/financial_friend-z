/* eslint-disable quotes */
/* eslint-disable prettier/prettier */
/* eslint-disable no-unused-vars */
require("dotenv").config();
var express = require("express");
var exphbs = require("express-handlebars");
var bodyParser = require("body-parser");
var db = require("./models");
var session = require("express-session");
var passport = require("./config/passport");
var app = express();
var envvar = require('envvar');
var moment = require('moment');
var plaid = require('plaid');
var PORT = process.env.PORT || 3000;

var APP_PORT = envvar.number('APP_PORT', 8000);
var PLAID_CLIENT_ID = envvar.string('PLAID_CLIENT_ID', "5dd040478e6cda0015503374");
var PLAID_SECRET = envvar.string('PLAID_SECRET', "8f619741faf8c93a1e4b0ea823d88f");
var PLAID_PUBLIC_KEY = envvar.string('PLAID_PUBLIC_KEY', "d709a077c62c423a5d9652fa75e96b");
var PLAID_ENV = envvar.string('PLAID_ENV', 'development');

var ACCESS_TOKEN = null;
var PUBLIC_TOKEN = null;
// Middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(express.static("public"));
app.use(session({ secret: "keyboard cat", resave: true, saveUninitialized: true }));
app.use(passport.initialize());
app.use(passport.session());
// Handlebars
app.engine(
  "handlebars",
  exphbs({
    defaultLayout: "main"
  })
);
app.set("view engine", "handlebars");

// Routes
require("./routes/apiRoutes")(app);
require("./routes/htmlRoutes")(app);

var syncOptions = { force: false };
var client = new plaid.Client(
  PLAID_CLIENT_ID,
  PLAID_SECRET,
  PLAID_PUBLIC_KEY,
  plaid.environments[PLAID_ENV],
  {version: '2019-05-29', clientApp: 'Plaid Quickstart'}
);
// If running a test, set syncOptions.force to true
// clearing the `testdb`
app.post('/get_access_token', function(request, response, next) {
  PUBLIC_TOKEN = request.body.public_token;
  client.exchangePublicToken(PUBLIC_TOKEN, function(error, tokenResponse) {
    if (error != null) {
      console.log('Could not exchange public_token!' + '\n' + error);
      return response.json({error: msg});
    }
    ACCESS_TOKEN = tokenResponse.access_token;
    ITEM_ID = tokenResponse.item_id;
    console.log('Access Token: ' + ACCESS_TOKEN);
    console.log('Item ID: ' + ITEM_ID);
    response.json(ACCESS_TOKEN);
  });
});


app.post('/accounts/balance/get',function(req, res){
  
  client.getBalance(req.body.token,(err, result) => {
    // Handle err
    
    res.json(result.accounts[0].balances.available)
  });
});

if (process.env.NODE_ENV === "test") {
  syncOptions.force = true;
}

  
// Starting the server, syncing our models ------------------------------------/
db.sequelize.sync(syncOptions).then(function() {
  app.listen(PORT, function() {
    console.log(
      "==> 🌎  Listening on port %s. Visit http://localhost:%s/ in your browser.",
      PORT,
      PORT
    );
  });
});

module.exports = app;
