"use strict";
const utils_request = require("../utils/request.js");
function pageChargeServiceMonitor(data) {
  return utils_request.http.post("/api-service/api/pageChargeServiceMonitorNew", data);
}
function startCharge(data) {
  return utils_request.http.post("/api-service/api/charge/startCharge", data);
}
function getPreChargeAmountByBusId(busId) {
  return utils_request.http.get(`/api-service/api/getPreChargeAmountByBusId?busId=${busId}`);
}
function querChargeOnline(data) {
  return utils_request.http.postForm("/api-service/api/querChargeOnline", data);
}
function stopCharge(data) {
  return utils_request.http.postForm("/api-service/api/stopCharge", data);
}
function queryChargeRealy(data) {
  return utils_request.http.postForm("/api-service/api/querChargeRealy", data);
}
exports.getPreChargeAmountByBusId = getPreChargeAmountByBusId;
exports.pageChargeServiceMonitor = pageChargeServiceMonitor;
exports.querChargeOnline = querChargeOnline;
exports.queryChargeRealy = queryChargeRealy;
exports.startCharge = startCharge;
exports.stopCharge = stopCharge;
//# sourceMappingURL=../../.sourcemap/mp-weixin/api/charge.js.map
