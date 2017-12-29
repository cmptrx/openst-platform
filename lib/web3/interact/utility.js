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
      ,stPrimeAddress = coreAddresses.getAddressForContract('stPrime');

  this.stPrimeContractInteract = new StPrimeKlass(stPrimeAddress)

  BaseInteract.call(this);

};

utilityInteract.prototype = Object.create(BaseInteract.prototype);

utilityInteract.prototype.constructor = utilityInteract;

utilityInteract.prototype.requestFundsTransfer = function (receiverAddr, amountInSt) {

  var responseData =  responseHelper.error('l_w_i_v_1', 'This has not been implemented yet');

  return Promise.resolve(responseData);

};

utilityInteract.prototype.mainNetChainId = function() {
  return coreConstants.OST_UTILITY_MAIN_NET_CHAIN_ID;
};

utilityInteract.prototype.getSTPrimeBalance = function(address) {
  return this._getBalance(address, this.stPrimeContractInteract);
}