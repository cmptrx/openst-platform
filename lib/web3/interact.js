"use strict";

const Assert  = require("assert")
    , BigNumber = require("bignumber.js");

const reqPrefix           = "../.."
    , responseHelper      = require( reqPrefix + "/lib/formatter/response" )
    , logger              = require( reqPrefix + '/helpers/custom_console_logger')
    , coreAddresses       = require( reqPrefix + "/config/core_addresses" )
    , coreConstants       = require( reqPrefix + "/config/core_constants" )
;

/**
 * @constructor
 *
 * @param {String} chainCode - 'uc' for Utility Chain & 'vc' for Value Chain
 *
 */
const chainInteract = module.exports = function (chainCode) {

  var web3RpcProvider = null;

  if (chainCode === 'uc') {
    web3RpcProvider = require(reqPrefix + "/lib/web3/providers/utility_rpc")
  } else if (chainCode === 'vc') {
    web3RpcProvider = require(reqPrefix + "/lib/web3/providers/value_rpc")
  } else {
    throw('unsupported chainCode: ' + chainCode);
  }

  this.chainCode = chainCode;
  this.web3RpcProvider = web3RpcProvider;

};

chainInteract.prototype = {

  getBalance: function (address) {

    Assert.ok(this.web3RpcProvider.utils.isAddress(address), `Invalid address: ${address}`);

    var contractInteract = this.getContractInteractForDefaultCurrency()
        ,oThis = this;

    return contractInteract.balanceOf( address )
        .then( function(result){
          var stringBalance = result.data['balance'];
          return responseHelper.successWithData({
            weiBalance: new BigNumber(stringBalance),
            absoluteBalance: oThis.toETHfromWei(stringBalance)
          });
        })
        .catch( function(reason) {
        logger.error('getBalance for addr: ', address, 'failed beacuse: ', reason);
        return responseHelper.error('l_w_i_1', 'Something went wrong')
      });
  },

  getNonce: function (address) {

    Assert.ok(this.web3RpcProvider.utils.isAddress(address), `Invalid address: ${address}`);

    // handle response
    const handleResponse = function (nonce) {
      logger.win('--- Nonce received successfully.');
      return responseHelper.successWithData({nonce: nonce});
    };

    return this.web3RpcProvider.eth.getTransactionCount(address).then(handleResponse);

  },

  getTransactionReceipt: function (transactionHash) {

    // handle response
    const handleResponse = function (transactionDetails) {
      logger.win('--- Transaction receipt successfully.');
      if (!transactionDetails) {
        transactionDetails = {};
      }
      return responseHelper.successWithData({transactionDetails: transactionDetails});
    };

    return this.web3RpcProvider.eth.getTransactionReceipt(transactionHash).then(handleResponse);

  },

  requestFundsTransfer: function (receiverAddr, amountInSt) {

    var amountInStWei = null
        , oThis = this;

    Assert.ok(oThis.web3RpcProvider.utils.isAddress(receiverAddr), `Invalid receiverAddr: ${receiverAddr}`);

    if (!amountInSt) {
      amountInStWei = this.toBigNumberWei('100'); // default to 100
    } else {
      amountInStWei = this.toBigNumberWei(amountInSt);
    }

    if (this.chainCode == 'vc') {
      var senderName = 'foundation'
          , gasPrice = coreConstants.OST_VALUE_GAS_PRICE;
    } else {
      var senderName = 'utilityChainOwner'
          , gasPrice = coreConstants.OST_UTILITY_GAS_PRICE;
    }

    var senderAddr = coreAddresses.getAddressForUser(senderName)
        ,senderPassphrase = coreAddresses.getPassphraseForUser(senderName);

    return oThis.web3RpcProvider.eth.personal.unlockAccount( senderAddr, senderPassphrase).then(function() {

      // this promise for somereason is getting resolved after transaction is being mined.
      // Fix it to reduce request response time
      return oThis.web3RpcProvider.eth.sendTransaction({
        from: senderAddr,
        to: receiverAddr,
        amount: amountInStWei,
        gasPrice: gasPrice
      });

    });

  },

  /////////// PRIVATE METHODS //////////////////////

  toBigNumberWei: function( stringValue ) {

    var value = Number( stringValue );

    if ( typeof stringValue != 'string' ) {
      stringValue = String( stringValue );
    }

    const weiValue = this.web3RpcProvider.utils.toWei( stringValue, "ether");

    return new BigNumber( weiValue );

  },

  getContractInteractForDefaultCurrency: function() {

    if (this.chainCode == 'uc') {
      var StPrimeKlass = require(reqPrefix + '/lib/contract_interact/st_prime')
          ,stPrimeAddress = coreAddresses.getAddressForContract('stPrime')
          , contractInteract = new StPrimeKlass(stPrimeAddress);
    } else {
      var contractInteract = require(reqPrefix + '/lib/contract_interact/simpleToken')
    }

    return contractInteract;

  },

  toETHfromWei: function(stringValue) {

    if ( typeof stringValue != 'string' ) {
      stringValue = String( stringValue );
    }

    return this.web3RpcProvider.utils.fromWei( stringValue, "ether" );

  },

};