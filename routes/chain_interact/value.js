"use strict";

const reqPrefix           = "../.."
    , responseHelper      = require( reqPrefix + "/lib/formatter/response" )
    , coreConstants       = require( reqPrefix + "/config/core_constants" )
    , logger              = require( reqPrefix + '/helpers/custom_console_logger')
    , BaseChainInteract   = require( reqPrefix + '/routes/chain_interact/base' )
;

/**
 * @constructor
 */
const valueChainInteractRoute = module.exports = function () {

  var chainInteractKlass = require(reqPrefix + "/lib/web3/interact/value");
  BaseChainInteract.call(this, chainInteractKlass);

  const oThis = this;

  const renderResult = function(requestResponse, responseObject) {
    return requestResponse.renderResponse(responseObject);
  };

  const getSTBalance = function(req, res, next) {

    const address = req.query.address;

    oThis.chainInteract.getSTBalance(address)
        .then(function(requestResponse) {
          return renderResult(requestResponse, res);
        })
        .catch(function(reason){
          logger.error(reason);
          return renderResult(
              responseHelper.error('r_wi_1', "Something Went Wrong"),
              res
          );
        });

  };

  const nonProdEnvOnly = function(req, res, next) {

    if (!coreConstants.ENVIRONMENT || (coreConstants.ENVIRONMENT == coreConstants.PROD_ENVIRONMENT)) {
      logger.error(req.path,' is Not Allowed For Prod ENV');
      return renderResult(
          responseHelper.error('r_wi_5', req.path + ' is Not Allowed For Prod ENV'),
          res
      );
    } else {
      next();
    }

  };

  const requestSTTransfer = function(req, res, next) {

    const amountInSt = req.query.amount
        , receiverAddress = req.query.address;

    oThis.chainInteract.requestSTTransfer(receiverAddress, amountInSt)
        .then(function(requestResponse) {
          return renderResult(requestResponse, res);
        })
        .catch(function(reason){
          logger.error(reason);
          return renderResult(
              responseHelper.error('r_wi_4', "Something Went Wrong"),
              res
          );
        });

  };

  this.router.get('/get-st-balance', getSTBalance);

  this.router.post('/request-st-transfer', nonProdEnvOnly, requestSTTransfer);

};

valueChainInteractRoute.prototype = Object.create(BaseChainInteract.prototype);

valueChainInteractRoute.prototype.constructor = valueChainInteractRoute;
