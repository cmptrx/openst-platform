"use strict";

const BigNumber = require("bignumber.js");

const reqPrefix           = "../../.."
    , responseHelper      = require( reqPrefix + "/lib/formatter/response" )
    , logger              = require( reqPrefix + '/helpers/custom_console_logger')
    , coreAddresses       = require( reqPrefix + "/config/core_addresses" )
;

/**
 * @constructor
 */
const baseInteract = module.exports = function () {

};

baseInteract.prototype = {

  getNonce: function (address) {

    var oThis = this;

    if (!oThis._isValidBlockChainAdress(address)) {
      return Promise.resolve(responseHelper.error('l_w_i_b_8', 'Invalid Address'));
    }

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

    if (_isValidSignedTransaction(signedTx)) {
      var responseData = responseHelper.error('l_w_i_b_2', "Invalid format for signedTx");
      return Promise.resolve(responseData);
    }

    // TO BE IMPLEMENTED
    var responseData = responseHelper.error('l_w_i_b_3', "YET to be implemented");
    return Promise.resolve(responseData);

  },

  callTransaction: function(rawTx) {
    
    if (!rawTx || Array.isArray(rawTx) || rawTx.constructor != Object) {
      var responseData = responseHelper.error('l_w_i_b_4', "Invalid format for rawTx");
      return Promise.resolve(responseData);
    }

    if (!rawTx.from || !rawTx.to) {
      var responseData = responseHelper.error('l_w_i_b_5', "Mandatory keys missing in rawTx");
      return Promise.resolve(responseData);
    }
    
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

    if (_isValidSignedTransaction(signedTx)) {
      return responseHelper.error('l_w_i_b_6', "Invalid format for signedTx");
    }
    
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

  requestFundsTransfer: function (receiverAddr, amountInSt, senderName) {

    var oThis = this
        , amountInStWei = null;

    if (oThis._isConnectedToMainNetChain()) {
      return Promise.resolve(responseHelper.error('l_w_i_b_8', 'Not allowed For Main Net Yet'));
    }

    if (!oThis._isValidBlockChainAdress(receiverAddr)) {
      return Promise.resolve(responseHelper.error('l_w_i_b_9', 'Invalid Address'));
    }

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

  _isValidBlockChainAdress: function(address) {
    return this.web3RpcProvider.utils.isAddress(address);
  },

  _isValidSignedTransaction: function(signedTx) {
    if (!signedTx || signedTx.constructor != String) {
      return false;
    } else {
      return true;
    }
  },

  _isConnectedToMainNetChain: function() {
    var oThis = this;
    this.web3RpcProvider.eth.net.getId()
        .then(function(networkId) {
          return (oThis.mainNetChainId() == networkId);
        })
        .catch(function(error){
          logger.error("error in fetching chain id: ", error);
          throw("error in fetching chain id: ", error);
        });
  },

  _getBalance: function (address, contractInteract) {

    var oThis = this;

    if (!oThis._isValidBlockChainAdress(address)) {
      return Promise.resolve(responseHelper.error('l_w_i_b_7', 'Invalid Address'));
    }

    return contractInteract.balanceOf( address )
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
          var responseData = responseHelper.error('l_w_i_b_1', 'Something went wrong');
          return Promise.resolve(responseData);
        });
  }

}