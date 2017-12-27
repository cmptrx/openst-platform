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

  router.get('/get-balance', async function(req, res, next) {

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

  });

  router.get('/get-nonce', async function(req, res, next) {

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

  });

  router.get('/get-transaction-receipt', async function(req, res, next) {

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

  });

  // For For VC grants ST & For UC fails now (would eventually grants ST')
  router.post('/request-funds', async function(req, res, next) {

    Assert.notStrictEqual(coreConstants.ENVIRONMENT, coreConstants.PROD_ENVIRONMENT, `Not For Prod ENV`);

    const amountInSt = req.query.amount
        , receiverAddress = req.query.address;

    const requestFundTransferResponse = await chainInteract.requestFundsTransfer(receiverAddress, amountInSt);

    return requestFundTransferResponse.renderResponse( res );

  });

  router.post('/call-tx', async function(req, res, next) {

    const txParams = req.query.rawTx;

    if (!txParams || Array.isArray(txParams) || txParams.constructor != Object) {
      return responseHelper.error('r_wi_3', "Invalid format for txParams");
    }

    if (!txParams.from || !txParams.to) {
      return responseHelper.error('r_wi_4', "Mandatory keys missing in txParams");
    }

    const callTxResponse = await chainInteract.callTransaction(txParams);

    return callTxResponse.renderResponse( res );

  });

  router.post('/send-tx', async function(req, res, next) {

    const signedTx = req.query.signedTx;

    if (!signedTx || signedTx.constructor != String) {
      return responseHelper.error('r_wi_3', "Invalid format for txParams");
    }

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

  });

  router.post('/estimate-gas-for-tx', async function(req, res, next) {

    const signedTx = req.query.signedTx;

    if (!signedTx || signedTx.constructor != String) {
      return responseHelper.error('r_wi_4', "Invalid format for txParams");
    }

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

  });

  //// Private Methods /////////

  const _renderResult = function(requestResponse, responseObject) {
    return requestResponse.renderResponse(responseObject);
  }

  return router;

};

