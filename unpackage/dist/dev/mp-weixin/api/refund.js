"use strict";
const utils_request = require("../utils/request.js");
function getRefundAmount() {
  return utils_request.http.post("/api-service/api/refund/refundAmount");
}
function getRefundList(data) {
  return utils_request.http.post("/api-service/api/refund/refundList", data);
}
function refundApply(data) {
  return utils_request.http.post("/api-service/api/refund/refundApply", data);
}
function getLeaguerAccountRefundList(data) {
  return utils_request.http.post("/api-service/api/refund/personalRefundList", data);
}
function getLeaguerAccountRefundRecordList(data) {
  return utils_request.http.post("/api-service/api/refund/personalRefundRecordList", data);
}
function leaguerAccountRefundApply(data) {
  return utils_request.http.post("/api-service/api/refund/personalRecordApply", data);
}
function getLeaguerAccountRefundAmount() {
  return utils_request.http.post("/api-service/api/refund/personalRefundAmount");
}
exports.getLeaguerAccountRefundAmount = getLeaguerAccountRefundAmount;
exports.getLeaguerAccountRefundList = getLeaguerAccountRefundList;
exports.getLeaguerAccountRefundRecordList = getLeaguerAccountRefundRecordList;
exports.getRefundAmount = getRefundAmount;
exports.getRefundList = getRefundList;
exports.leaguerAccountRefundApply = leaguerAccountRefundApply;
exports.refundApply = refundApply;
//# sourceMappingURL=../../.sourcemap/mp-weixin/api/refund.js.map
