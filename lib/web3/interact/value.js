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
const valueInteract = module.exports = function () {

  this.web3RpcProvider = require(reqPrefix + "/lib/web3/providers/value_rpc");

  var contractInteract = require(reqPrefix + '/lib/contract_interact/simpleToken');

  BaseInteract.call(this, contractInteract);

};

valueInteract.prototype = Object.create(BaseInteract.prototype);

valueInteract.prototype.constructor = valueInteract;

valueInteract.prototype.requestFundsTransfer = function (receiverAddr, amountInSt) {

  var oThis = this;

  return BaseInteract.prototype.requestFundsTransfer.call(oThis, receiverAddr,
      amountInSt, 'foundation', coreConstants.OST_VALUE_GAS_PRICE);

};

valueInteract.prototype._transferFundsOnChain = function (senderName, receiverAddr, amountInStWei) {

  return this.contractInteractForDefaultCurrency.transfer(senderName, receiverAddr, amountInStWei);

};

valueInteract.prototype.mainNetChainId = function() {
  return coreConstants.OST_VALUE_MAIN_NET_CHAIN_ID;
};