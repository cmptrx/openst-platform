"use strict";

const Assert  = require("assert")
    , BigNumber = require("bignumber.js");

const reqPrefix           = "../../.."
    , BaseInteract        = require( reqPrefix + "/lib/web3/interact/base" )
    , coreAddresses       = require( reqPrefix + "/config/core_addresses" )
    , responseHelper      = require( reqPrefix + "/lib/formatter/response" )
    , coreConstants       = require( reqPrefix + "/config/core_constants" )
;

/**
 * @constructor
 */
const utilityInteract = module.exports = function () {

  this.web3RpcProvider = require(reqPrefix + "/lib/web3/providers/utility_rpc");

  var StPrimeKlass = require(reqPrefix + '/lib/contract_interact/st_prime')
      ,stPrimeAddress = coreAddresses.getAddressForContract('stPrime')
      , contractInteract = new StPrimeKlass(stPrimeAddress);

  BaseInteract.call(this, contractInteract);

};

utilityInteract.prototype = Object.create(BaseInteract.prototype);

utilityInteract.prototype.constructor = utilityInteract;

utilityInteract.prototype.requestFundsTransfer = function (receiverAddr, amountInSt) {

  var responseData =  responseHelper.error('l_w_i_v_1', 'This has not been implemented yet');

  return Promise.resolve(responseData);

};