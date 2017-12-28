"use strict";

const Express = require('express')
    , Assert  = require("assert")
;

const reqPrefix           = ".."
    , responseHelper      = require(reqPrefix + "/lib/formatter/response")
    , coreConstants       = require( reqPrefix + "/config/core_constants" )
    , logger              = require( reqPrefix + '/helpers/custom_console_logger')
;

module.exports = function( chainCode ) {

  if (chainCode === 'uc') {
    var chainInteractKlass = require(reqPrefix + "/lib/web3/interact/utility")
  } else if (chainCode === 'vc') {
    var chainInteractKlass = require(reqPrefix + "/lib/web3/interact/value")
  } else {
    throw('unsupported chainCode: ' + chainCode);
  }

  const router = Express.Router()
      , chainInteract = new chainInteractKlass()
      , oThis = this;

  //////// Middleware Methods /////////////

  const getBalance = function(req, res, next) {

    const address = req.query.address;

    chainInteract.getBalance(address)
        .then(function(requestResponse) {
          return _renderResult(requestResponse, res);
        })
        .catch(function(reason){
          logger.error(reason);
          return _renderResult(
              responseHelper.error('r_wi_1', "Something Went Wrong"),
              res
          );
        });

  };

  const getNonce = function(req, res, next) {

    const address = req.query.address;

    chainInteract.getNonce(address)
        .then(function(requestResponse) {
          return _renderResult(requestResponse, res);
        })
        .catch(function(reason){
          logger.error(reason);
          return _renderResult(
              responseHelper.error('r_wi_2', "Something Went Wrong"),
              res
          );
        });

  };

  const getTransactionReceipt = function(req, res, next) {

    const transactionHash = req.query.transactionHash;

    if (!transactionHash) {
      return responseHelper.error('r_wi_2', "Invalid transactionHash");
    }

    chainInteract.getTransactionReceipt(transactionHash)
        .then(function(requestResponse) {
          return _renderResult(requestResponse, res);
        })
        .catch(function(reason){
          logger.error(reason);
          return _renderResult(
              responseHelper.error('r_wi_3', "Something Went Wrong"),
              res
          );
        });

  };

  const requestFundTransfer = function(req, res, next) {

    const amountInSt = req.query.amount
        , receiverAddress = req.query.address;

    chainInteract.requestFundsTransfer(receiverAddress, amountInSt)
        .then(function(requestResponse) {
          return _renderResult(requestResponse, res);
        })
        .catch(function(reason){
          logger.error(reason);
          return _renderResult(
              responseHelper.error('r_wi_4', "Something Went Wrong"),
              res
          );
        });

  };

  const executeReadTransaction = function(req, res, next) {

    const txParams = req.query.rawTx;

    chainInteract.callTransaction(txParams)
        .then(function(requestResponse) {
          return _renderResult(requestResponse, res);
        })
        .catch(function(reason){
          logger.error(reason);
          return _renderResult(
              responseHelper.error('r_wi_5', "Something Went Wrong"),
              res
          );
        });

  };

  const executeWriteTransaction = function(req, res, next) {

    const signedTx = req.query.signedTx;

    chainInteract.sendSignedTransaction(signedTx)
        .then(function(requestResponse) {
          return _renderResult(requestResponse, res);
        })
        .catch(function(reason){
          logger.error(reason);
          return _renderResult(
              responseHelper.error('r_wi_4', "Something Went Wrong"),
              res
          );
        });

  };

  const extimateGasForTransaction = function(req, res, next) {

    const signedTx = req.query.signedTx;

    chainInteract.estimateGasForSignedTransaction(signedTx)
        .then(function(requestResponse) {
          return _renderResult(requestResponse, res);
        })
        .catch(function(reason){
          logger.error(reason);
          return _renderResult(
              responseHelper.error('r_wi_5', "Something Went Wrong"),
              res
          );
        });

  };

  const prodEnvOnly = function(req, res, next) {

    if (coreConstants.ENVIRONMENT == coreConstants.PROD_ENVIRONMENT) {
      next();
    } else {
      logger.error(req.path,' is Not Allowed For Prod ENV');
      return _renderResult(
          responseHelper.error('r_wi_5', req.path + ' is Not Allowed For Prod ENV'),
          res
      );
    }

  };

  //////////// Expose Routes ///////////////////

  router.get('/get-balance', getBalance);

  router.get('/get-nonce', getNonce);

  router.get('/get-transaction-receipt', getTransactionReceipt);

  // For For VC grants ST & For UC fails now (would eventually grants ST')
  router.post('/request-funds', prodEnvOnly, requestFundTransfer);

  router.post('/call-tx', executeReadTransaction);

  router.post('/send-tx', executeWriteTransaction);

  router.post('/estimate-gas-for-tx', extimateGasForTransaction);

  //// Private Methods /////////

  const _renderResult = function(requestResponse, responseObject) {
    return requestResponse.renderResponse(responseObject);
  }

  ///////// Return Route Object /////////////

  return router;

};

