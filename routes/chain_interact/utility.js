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
const utilityChainInteractRoute = module.exports = function () {

  const oThis = this;

  const renderResult = function(requestResponse, responseObject) {
    return requestResponse.renderResponse(responseObject);
  };
  
  var chainInteractKlass = require(reqPrefix + "/lib/web3/interact/utility");
  BaseChainInteract.call(oThis, chainInteractKlass);

  const getSTPrimeBalance = function(req, res, next) {

    const address = req.query.address;

    oThis.chainInteract.getSTPrimeBalance(address)
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

  this.router.get('/get-st-prime-balance', getSTPrimeBalance);

};

utilityChainInteractRoute.prototype = Object.create(BaseChainInteract.prototype);

utilityChainInteractRoute.prototype.constructor = utilityChainInteractRoute;