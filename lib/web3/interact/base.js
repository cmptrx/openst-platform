"use strict";

const Assert  = require("assert")
    , BigNumber = require("bignumber.js");

const reqPrefix           = "../../.."
    , responseHelper      = require( reqPrefix + "/lib/formatter/response" )
    , logger              = require( reqPrefix + '/helpers/custom_console_logger')
    , coreAddresses       = require( reqPrefix + "/config/core_addresses" )
;

/**
 * @constructor
 */
const baseInteract = module.exports = function (contractInteract) {

  this.contractInteractForDefaultCurrency = contractInteract;

};

baseInteract.prototype = {

  getBalance: function (address) {

    Assert.ok(this.web3RpcProvider.utils.isAddress(address), `Invalid address: ${address}`);

    var oThis = this;

    return oThis.contractInteractForDefaultCurrency.balanceOf( address )
        .then( function(result){
          var stringBalance = result.data['balance'];
          var responseData =  responseHelper.successWithData({
            weiBalance: new BigNumber(stringBalance),
            absoluteBalance: oThis._toETHfromWei(stringBalance)
          });
          return Promise.resolve(responseData);
        })
        .catch( function(reason) {
          logger.error('getBalance for addr: ', address, 'failed beacuse: ', reason);
          var responseData = responseHelper.error('l_w_i_1', 'Something went wrong');
          return Promise.resolve(responseData);
        });
  },

  getNonce: function (address) {

    Assert.ok(this.web3RpcProvider.utils.isAddress(address), `Invalid address: ${address}`);

    // handle response
    const handleResponse = function (nonce) {
      logger.win('--- Nonce received successfully.');
      var responseData = responseHelper.successWithData({nonce: nonce});
      return Promise.resolve(responseData);
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
      var responseData = responseHelper.successWithData({transactionDetails: transactionDetails});
      return Promise.resolve(responseData);
    };

    return this.web3RpcProvider.eth.getTransactionReceipt(transactionHash).then(handleResponse);

  },

  estimateGasForSignedTransaction: function() {

  },

  callTransaction: function(rawTx) {

    var oThis = this;

    return new Promise(function (onResolve, onReject) {

      // end the response once you get the transaction hash.
      const onTxResponse = function (transactionData) {
        logger.step('--- Data received successfully.');
        onResolve(responseHelper.successWithData({transactionData: transactionData}));
      };

      const onTxError = function (err) {
        logger.error('### Error while getting Tx Data.');
        logger.error(err);
        onResolve(responseHelper.error(err.message, ' transaction hash not obtained.'));
      };

      oThis.web3RpcProvider.eth.call(rawTx)
          .then(onTxResponse)
          .catch(onTxError);

    });

  },

  sendSignedTransaction: function(signedTx) {

    var oThis = this;

    return new Promise(function (onResolve, onReject) {

      // end the response once you get the transaction hash.
      const onTxHash = function (transactionHash) {
        logger.step('--- Transaction hash received successfully.');
        onResolve(responseHelper.successWithData({transactionHash: transactionHash}));
      };

      const onTxHashError = function (err) {
        logger.error('### Error while getting transaction hash.');
        logger.error(err);
        onResolve(responseHelper.error(err.message , ' transaction hash not obtained.'));
      };

      oThis.web3RpcProvider.eth.sendSignedTransaction(signedTx).once('transactionHash', onTxHash)
          .catch(onTxHashError);

    });

  },

  requestFundsTransfer: function (receiverAddr, amountInSt, senderName, gasPrice) {

    var oThis = this
        , amountInStWei = null;

    Assert.ok(oThis.web3RpcProvider.utils.isAddress(receiverAddr), `Invalid receiverAddr: ${receiverAddr}`);

    if (!amountInSt) {
      amountInStWei = oThis._toBigNumberWei('100'); // default to 100
    } else {
      amountInStWei = oThis._toBigNumberWei(amountInSt);
    }

    return oThis._transferFundsOnChain(senderName, receiverAddr, amountInStWei);

  },

  /////////// PRIVATE METHODS //////////////////////

  _toBigNumberWei: function( stringValue ) {

    var value = Number( stringValue );

    if ( typeof stringValue != 'string' ) {
      stringValue = String( stringValue );
    }

    const weiValue = this.web3RpcProvider.utils.toWei( stringValue, "ether");

    return new BigNumber( weiValue );

  },

  _toETHfromWei: function(stringValue) {

    if ( typeof stringValue != 'string' ) {
      stringValue = String( stringValue );
    }

    return this.web3RpcProvider.utils.fromWei( stringValue, "ether" );

  },

}