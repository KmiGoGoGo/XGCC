"use strict";
const common_vendor = require("../common/vendor.js");
const utils_request = require("../utils/request.js");
const globalData = require("../globalData.js");
function getMemberInfo() {
  return utils_request.http.post("/api-service/api/getMemberInfo");
}
function loginBeforeCheck(data) {
  return utils_request.http.post("/api-service/api/loginBeforeCheck", data);
}
function listPopUp() {
  return utils_request.http.post("/api-service/api/popUp/listPopUp");
}
function getInvoiceBySellerId() {
  const sellerId = globalData.globalData.sellerId;
  return utils_request.http.post(`/api-service/api/invoice/getBySellerId/${sellerId}`);
}
function queryDynamicsActivity(cityName) {
  if (!cityName) {
    cityName = "全国";
  }
  return new Promise((resolve, reject) => {
    common_vendor.index.request({
      url: `http://cy.gy-ev.com/api/api-service/api/queryDynamicsActivity?sellerNo=${globalData.globalData.sellerNo}&address=${cityName}`,
      method: "GET",
      success: (res) => {
        common_vendor.index.__f__("log", "at api/member.js:132", "queryDynamicsActivity", res);
        resolve(res);
      },
      fail: (err) => {
        reject(err);
      }
    });
  });
}
function getOldAndNewBenifit() {
  const sellerId = globalData.globalData.sellerId;
  return utils_request.http.post(`/api-service/api/friend/getOldAndNewBenifit/${sellerId}`);
}
function getMyNotPayBillNumber(data) {
  return utils_request.http.post("/api-service/api/getMyNotPayBillNumber", data);
}
function getAccountInfo(data) {
  return utils_request.http.post("/api-service/api/getAccountInfo", data);
}
function getAccountFlowPage(data) {
  return utils_request.http.post("/api-service/api/pageList", data);
}
function getRefundRecordById(data) {
  return utils_request.http.post("/api-service/api/refund/refundRecordById", data);
}
function getRefundRecordList(data) {
  return utils_request.http.post("/api-service/api/refund/refundRecordList", data);
}
function queryMemberStatus() {
  return utils_request.http.post("/api-service/api/querMemberStatus");
}
function changeUser(changeType) {
  return utils_request.http.post(`/api-service/api/changeUser?changeType=${changeType}`);
}
function logout() {
  return utils_request.http.post("/api-service/api/AppH5logout", { type: "3" });
}
exports.changeUser = changeUser;
exports.getAccountFlowPage = getAccountFlowPage;
exports.getAccountInfo = getAccountInfo;
exports.getInvoiceBySellerId = getInvoiceBySellerId;
exports.getMemberInfo = getMemberInfo;
exports.getMyNotPayBillNumber = getMyNotPayBillNumber;
exports.getOldAndNewBenifit = getOldAndNewBenifit;
exports.getRefundRecordById = getRefundRecordById;
exports.getRefundRecordList = getRefundRecordList;
exports.listPopUp = listPopUp;
exports.loginBeforeCheck = loginBeforeCheck;
exports.logout = logout;
exports.queryDynamicsActivity = queryDynamicsActivity;
exports.queryMemberStatus = queryMemberStatus;
//# sourceMappingURL=../../.sourcemap/mp-weixin/api/member.js.map
