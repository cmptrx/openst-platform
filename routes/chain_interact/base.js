"use strict";

const Express = require('express')
;

const reqPrefix           = "../.."
    , responseHelper      = require(reqPrefix + "/lib/formatter/response")
    , coreConstants       = require( reqPrefix + "/config/core_constants" )
    , logger              = require( reqPrefix + '/helpers/custom_console_logger')
;

/**
 * @constructor
 */
const baseChainInteract = module.exports = function (chainInteractKlass) {

  this.chainInteract = new chainInteractKlass();

  const oThis = this;

  const renderResult = function(requestResponse, responseObject) {
    return requestResponse.renderResponse(responseObject);
  };
  
  //////// Middleware Methods /////////////

  const getNonce = function(req, res, next) {

    const address = req.query.address;

    oThis.chainInteract.getNonce(address)
        .then(function(requestResponse) {
          return renderResult(requestResponse, res);
        })
        .catch(function(reason){
          logger.error(reason);
          return renderResult(
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

    oThis.chainInteract.getTransactionReceipt(transactionHash)
        .then(function(requestResponse) {
          return renderResult(requestResponse, res);
        })
        .catch(function(reason){
          logger.error(reason);
          return renderResult(
              responseHelper.error('r_wi_3', "Something Went Wrong"),
              res
          );
        });

  };

  const executeReadTransaction = function(req, res, next) {

    const txParams = req.query.rawTx;

    oThis.chainInteract.callTransaction(txParams)
        .then(function(requestResponse) {
          return renderResult(requestResponse, res);
        })
        .catch(function(reason){
          logger.error(reason);
          return renderResult(
              responseHelper.error('r_wi_5', "Something Went Wrong"),
              res
          );
        });

  };

  const executeWriteTransaction = function(req, res, next) {

    const signedTx = req.query.signedTx;

    oThis.chainInteract.sendSignedTransaction(signedTx)
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

  const extimateGasForTransaction = function(req, res, next) {

    const signedTx = req.query.signedTx;

    oThis.chainInteract.estimateGasForSignedTransaction(signedTx)
        .then(function(requestResponse) {
          return renderResult(requestResponse, res);
        })
        .catch(function(reason){
          logger.error(reason);
          return renderResult(
              responseHelper.error('r_wi_5', "Something Went Wrong"),
              res
          );
        });

  };

  //////////// Expose Routes ///////////////////

  var router = Express.Router();

  router.get('/get-nonce', getNonce);

  router.get('/get-transaction-receipt', getTransactionReceipt);

  router.post('/call-tx', executeReadTransaction);

  router.post('/send-tx', executeWriteTransaction);

  router.post('/estimate-gas-for-tx', extimateGasForTransaction);

  this.router = router;

};
