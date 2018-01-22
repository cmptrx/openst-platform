"use strict";

/**
 * Get Approval Status
 */

const rootPrefix = '../..'
  , web3VcRpcProvider = require(rootPrefix + '/lib/web3/providers/value_rpc')
  , responseHelper = require(rootPrefix+'/lib/formatter/response')
  , helper = require(rootPrefix + '/lib/contract_interact/helper')
  , web3EventsFormatter = require(rootPrefix + '/lib/web3/events/formatter')
;

const getApprovalStatus = async function (approvalTransactionHash) {
  try {
    const approvalTxReceipt = await helper.getTxReceipt(web3VcRpcProvider, approvalTransactionHash);

    if(!approvalTxReceipt || !approvalTxReceipt.isSuccess()) {
      return Promise.resolve(responseHelper.error('s_sam_gas_1', 'approval not yet mined.'));
    }

    const approvalFormattedTxReceipt = approvalTxReceipt.data.formattedTransactionReceipt;
    const approvalFormattedEvents = await web3EventsFormatter.perform(approvalFormattedTxReceipt);

    // check whether Approval is present in the events.
    if(!approvalFormattedEvents || !approvalFormattedEvents['Approval']) {
      // this is a error scenario.
      return Promise.resolve(responseHelper.error('s_sam_gas_2', 'Approval event was not found in the reseipt.'));
    }

    return Promise.resolve(responseHelper.successWithData({}));


  } catch (err) {
    return Promise.reject('Something went wrong. ' + err.message)
  }
};

module.exports = getApprovalStatus;