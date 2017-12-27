"use strict";

/*
 * Main application file
 *
 */

//All Module Requires.
const express = require('express')
  , path = require('path')
  , logger = require('morgan')
  , cookieParser = require('cookie-parser')
  , bodyParser = require('body-parser')
  , basicAuth = require('express-basic-auth')
  , helmet = require('helmet')
  , sanitizer = require('express-sanitized')
;

//All the requires.
const rootPrefix        = "."
  , coreConstants       = require( rootPrefix + '/config/core_constants' )
  , responseHelper      = require( rootPrefix + '/lib/formatter/response')
  , indexRoutes         = require( rootPrefix + '/routes/index')
  , btRoutes            = require( rootPrefix + '/routes/bt')
  , web3InteractRoutes = require( rootPrefix + '/routes/web3Interact')
  , config              = require( coreConstants.OST_MEMBER_CONFIG_FILE_PATH )
;

console.log( "config file path:", coreConstants.OST_MEMBER_CONFIG_FILE_PATH );

//Constants
const app = express();

app.use(logger('combined'));
app.use(helmet());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());

/*
  The below peice of code should always be before routes.
  Docs: https://www.npmjs.com/package/express-sanitized
*/
app.use(sanitizer());

// load index routes
app.use('/', indexRoutes);

// Mount member company routes
for (var key in config.Members) {
  const member = config.Members[key];
  member.Route = "/bt" + member.Route;
  console.log("Mounting branded token", member.Name, "on", member.Route);
  app.use(member.Route, basicAuth(member.ApiAuth), new btRoutes(member));
}

// Mount UC Chain Interact
console.log("Mounting UC Chain Interact on /uc");
app.use('/uc', basicAuth(coreConstants.OST_CHAIN_INTERACT_URI_HTTP_AUTH_CREDENTIALS), new web3InteractRoutes('uc'));

// Mount VC Chain Interact
console.log("Mounting VC Chain Interact on /vc");
app.use('/vc', basicAuth(coreConstants.OST_CHAIN_INTERACT_URI_HTTP_AUTH_CREDENTIALS), new web3InteractRoutes('vc'));

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  return responseHelper.error('404', 'Not Found').renderResponse(res, 404);
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  console.error(err);
  return responseHelper.error('500', 'Something went wrong').renderResponse(res, 500);
});

module.exports = app;
